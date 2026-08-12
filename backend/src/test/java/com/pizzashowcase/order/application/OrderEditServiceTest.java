package com.pizzashowcase.order.application;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pizzashowcase.menu.domain.Addon;
import com.pizzashowcase.menu.domain.AddonGroup;
import com.pizzashowcase.menu.domain.Category;
import com.pizzashowcase.menu.domain.Product;
import com.pizzashowcase.menu.domain.ProductAddonGroup;
import com.pizzashowcase.menu.infrastructure.ProductAddonGroupRepository;
import com.pizzashowcase.menu.infrastructure.ProductRepository;
import com.pizzashowcase.order.api.dto.admin.AdminOrderDto;
import com.pizzashowcase.order.api.dto.admin.EditOrderItemRequest;
import com.pizzashowcase.order.api.dto.admin.EditOrderRequest;
import com.pizzashowcase.order.api.dto.admin.OrderEditPreviewDto;
import com.pizzashowcase.order.domain.Address;
import com.pizzashowcase.order.domain.FulfillmentType;
import com.pizzashowcase.order.domain.Order;
import com.pizzashowcase.order.domain.OrderEdit;
import com.pizzashowcase.order.domain.OrderItem;
import com.pizzashowcase.order.domain.OrderStatus;
import com.pizzashowcase.order.domain.PaymentMethod;
import com.pizzashowcase.order.infrastructure.OrderEditRepository;
import com.pizzashowcase.order.infrastructure.OrderRepository;
import com.pizzashowcase.shared.error.ApiException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.dao.OptimisticLockingFailureException;

import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Zamówienie testowe: 1× Margherita 30,00 (pozycja 101) + 2× Cola 6,00
 * (pozycja 102), dostawa 5,00 → subtotal 42,00, total 47,00.
 * W menu Margherita zdążyła podrożeć do 35,00 — to celowe, bo właśnie na
 * tym widać różnicę między pozycją nietkniętą a przeliczoną.
 */
class OrderEditServiceTest {

    private static final BigDecimal DELIVERY_FEE = new BigDecimal("5.00");

    private OrderRepository orderRepository;
    private OrderEditRepository orderEditRepository;
    private AdminOrderQueryService queryService;
    private ApplicationEventPublisher eventPublisher;
    private OrderEditService service;
    private Order order;

    @BeforeEach
    void setUp() throws Exception {
        ProductRepository productRepository = mock(ProductRepository.class);
        ProductAddonGroupRepository productAddonGroupRepository = mock(ProductAddonGroupRepository.class);
        orderRepository = mock(OrderRepository.class);
        orderEditRepository = mock(OrderEditRepository.class);
        queryService = mock(AdminOrderQueryService.class);
        eventPublisher = mock(ApplicationEventPublisher.class);

        Category category = mock(Category.class);
        when(category.isActive()).thenReturn(true);

        Product margherita = product(1L, "Margherita", "35.00", category);
        Product cola = product(2L, "Cola 0,5 l", "6.00", category);

        Addon jalapeno = mock(Addon.class);
        when(jalapeno.getId()).thenReturn(50L);
        when(jalapeno.getName()).thenReturn("Jalapeño");
        when(jalapeno.getPrice()).thenReturn(new BigDecimal("4.00"));
        AddonGroup group = mock(AddonGroup.class);
        when(group.getId()).thenReturn(9L);
        when(group.getName()).thenReturn("Dodatki");
        when(group.getAddons()).thenReturn(Set.of(jalapeno));
        when(group.isRequired()).thenReturn(false);
        when(group.getMinSelect()).thenReturn(0);
        when(group.getMaxSelect()).thenReturn(5);
        ProductAddonGroup link = mock(ProductAddonGroup.class);
        when(link.getProduct()).thenReturn(margherita);
        when(link.getAddonGroup()).thenReturn(group);

        when(productRepository.findAllByIdInWithVariants(anyCollection()))
                .thenReturn(List.of(margherita, cola));
        when(productAddonGroupRepository.findAllByProductIdsWithAddons(anyCollection()))
                .thenReturn(List.of(link));

        service = new OrderEditService(
                orderRepository,
                orderEditRepository,
                new OrderLinePricer(productRepository, productAddonGroupRepository),
                queryService,
                eventPublisher,
                new ObjectMapper(),
                mock(jakarta.persistence.EntityManager.class));

        order = newOrder();
        when(orderRepository.findWithDetailsById(7L)).thenReturn(Optional.of(order));
        // Udajemy bazę: flush nadaje identyfikatory świeżo dodanym pozycjom.
        // Bez tego kolejna edycja tego samego zamówienia nie miałaby czym
        // wskazać wiersza powstałego w poprzedniej.
        java.util.concurrent.atomic.AtomicLong itemSeq = new java.util.concurrent.atomic.AtomicLong(200L);
        when(orderRepository.saveAndFlush(any(Order.class))).thenAnswer(inv -> {
            Order saved = inv.getArgument(0);
            for (OrderItem item : saved.getItems()) {
                if (item.getId() == null) {
                    setField(item, "id", itemSeq.incrementAndGet());
                }
            }
            return saved;
        });
        when(orderEditRepository.save(any(OrderEdit.class))).thenAnswer(inv -> inv.getArgument(0));
        when(queryService.toDto(any(Order.class))).thenReturn(mock(AdminOrderDto.class));
    }

    // ---- Wycena ----

    @Test
    void untouchedLineKeepsItsSnapshotPriceEvenAfterMenuPriceChange() {
        service.edit(7L, request(
                line(101L, 1L, 1, null),
                line(102L, 2L, 2, null),
                newLine(1L, 1, List.of(50L), null)));

        OrderItem margherita = itemByName("Margherita", "30.00");
        assertThat(margherita.getUnitPriceSnapshot()).isEqualByComparingTo("30.00");
        // 30,00 + 12,00 (Cola) + 39,00 (nowa Margherita 35,00 + jalapeño 4,00)
        assertThat(order.getSubtotal()).isEqualByComparingTo("81.00");
        assertThat(order.getTotal()).isEqualByComparingTo("86.00");
    }

    @Test
    void changedLineIsRepricedWithCurrentMenuPrice() {
        service.edit(7L, request(
                line(101L, 1L, 2, null),
                line(102L, 2L, 2, null)));

        OrderItem margherita = itemByName("Margherita", null);
        assertThat(margherita.getUnitPriceSnapshot()).isEqualByComparingTo("35.00");
        assertThat(margherita.getLineTotal()).isEqualByComparingTo("70.00");
        assertThat(order.getSubtotal()).isEqualByComparingTo("82.00");
    }

    @Test
    void removingLineRecalculatesTotalAndKeepsDeliveryFeeUntouched() {
        service.edit(7L, request(line(101L, 1L, 1, null)));

        assertThat(order.getItems()).hasSize(1);
        assertThat(order.getSubtotal()).isEqualByComparingTo("30.00");
        assertThat(order.getDeliveryFee()).isEqualByComparingTo("5.00");
        assertThat(order.getTotal()).isEqualByComparingTo("35.00");
    }

    @Test
    void itemNoteIsStoredWithoutRepricingTheLine() {
        service.edit(7L, request(
                line(101L, 1L, 1, "bez cebuli"),
                line(102L, 2L, 2, null)));

        OrderItem margherita = itemByName("Margherita", null);
        assertThat(margherita.getItemNote()).isEqualTo("bez cebuli");
        assertThat(margherita.getUnitPriceSnapshot()).isEqualByComparingTo("30.00");
        assertThat(order.getTotal()).isEqualByComparingTo("47.00");
    }

    // ---- Bramki ----

    @Test
    void removingEveryLineIsRejected() {
        assertThatThrownBy(() -> service.edit(7L, new EditOrderRequest(1L, List.of(), null, null, null)))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("co najmniej jedną pozycję");
    }

    @Test
    void readyOrderCannotBeEdited() {
        order.setStatus(OrderStatus.READY);

        assertThatThrownBy(() -> service.edit(7L, request(line(101L, 1L, 2, null))))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("nie da się już zmienić");

        verify(orderRepository, never()).saveAndFlush(any());
    }

    @Test
    void staleVersionIsRejectedWithOptimisticLockFailure() {
        EditOrderRequest stale = new EditOrderRequest(0L, List.of(line(101L, 1L, 2, null)), null, null, null);

        assertThatThrownBy(() -> service.edit(7L, stale))
                .isInstanceOf(OptimisticLockingFailureException.class);
    }

    @Test
    void unknownOrderItemIdIsRejected() {
        assertThatThrownBy(() -> service.edit(7L, request(line(999L, 1L, 1, null))))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("nie należy do tego zamówienia");
    }

    @Test
    void noChangeAtAllIsRejected() {
        assertThatThrownBy(() -> service.edit(7L, request(
                line(101L, 1L, 1, null),
                line(102L, 2L, 2, null))))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("Nic się nie zmieniło");
    }

    // ---- Reszta z gotówki (AD-026) ----

    @Test
    void cashChangeBelowNewTotalBlocksTheSave() {
        // Zamówienie rośnie do 86,00, a klient deklarował resztę ze 100 zł
        // — po dołożeniu drugiej Margherity 100 zł już nie wystarcza.
        EditOrderRequest request = new EditOrderRequest(
                1L,
                List.of(line(101L, 1L, 1, null), line(102L, 2L, 2, null),
                        newLine(1L, 3, List.of(), null)),
                null,
                new BigDecimal("100.00"),
                null);

        assertThatThrownBy(() -> service.edit(7L, request))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("niższa niż wartość zamówienia");

        verify(orderRepository, never()).saveAndFlush(any());
    }

    @Test
    void previewReportsInsufficientCashWithoutThrowing() {
        EditOrderRequest request = new EditOrderRequest(
                1L,
                List.of(line(101L, 1L, 1, null), line(102L, 2L, 2, null),
                        newLine(1L, 3, List.of(), null)),
                null,
                new BigDecimal("100.00"),
                null);

        OrderEditPreviewDto preview = service.preview(7L, request);

        assertThat(preview.cashChangeSufficient()).isFalse();
        assertThat(preview.total()).isEqualByComparingTo("152.00");
        assertThat(preview.deliveryFee()).isEqualByComparingTo("5.00");
        // Podgląd niczego nie zapisuje ani nie rusza encji.
        assertThat(order.getItems()).hasSize(2);
        assertThat(order.getTotal()).isEqualByComparingTo("47.00");
        verify(orderRepository, never()).saveAndFlush(any());
    }

    @Test
    void previewMarksWhichLinesKeepTheirSnapshot() {
        OrderEditPreviewDto preview = service.preview(7L, request(
                line(101L, 1L, 1, null),
                line(102L, 2L, 3, null)));

        assertThat(preview.items()).hasSize(2);
        assertThat(preview.items().get(0).repriced()).isFalse();
        assertThat(preview.items().get(0).unitPrice()).isEqualByComparingTo("30.00");
        assertThat(preview.items().get(1).repriced()).isTrue();
    }

    // ---- Historia ----

    @Test
    void editWritesHumanReadableSummaryAndSnapshot() {
        service.edit(7L, request(
                line(101L, 1L, 2, "bez cebuli"),
                line(102L, 2L, 2, null)));

        ArgumentCaptor<OrderEdit> captor = ArgumentCaptor.forClass(OrderEdit.class);
        verify(orderEditRepository).save(captor.capture());
        OrderEdit saved = captor.getValue();

        assertThat(saved.getSummary())
                .contains("Zmieniono ilość „Margherita”: 1 → 2")
                .contains("Notatka do „Margherita”: „bez cebuli”")
                .contains("Suma: 47,00 zł → 87,00 zł");
        assertThat(saved.getTotalBefore()).isEqualByComparingTo("47.00");
        assertThat(saved.getTotalAfter()).isEqualByComparingTo("87.00");
        // Snapshot trzyma stan SPRZED edycji — to on odtwarza cofnięcie.
        assertThat(saved.getSnapshotBefore()).contains("\"quantity\":1");
    }

    @Test
    void addingAnAddonIsDescribedAsAdditionNotAsRemoveAndAdd() {
        service.edit(7L, request(
                lineWithAddons(101L, 1L, 1, List.of(50L)),
                line(102L, 2L, 2, null)));

        ArgumentCaptor<OrderEdit> captor = ArgumentCaptor.forClass(OrderEdit.class);
        verify(orderEditRepository).save(captor.capture());
        assertThat(captor.getValue().getSummary()).contains("Dodano do „Margherita”: jalapeño");
    }

    // ---- Cofanie ----

    @Test
    void undoRestoresItemsTotalsAndCashChangeExactly() {
        wireEditStore();
        service.edit(7L, new EditOrderRequest(
                1L,
                List.of(line(101L, 1L, 2, "bez cebuli"), line(102L, 2L, 2, null)),
                "zadzwonić przed",
                new BigDecimal("200.00"),
                null));
        assertThat(order.getTotal()).isEqualByComparingTo("87.00");

        service.undoLast(7L, 1L);

        assertThat(order.getItems()).hasSize(2);
        OrderItem margherita = itemByName("Margherita", null);
        assertThat(margherita.getQuantity()).isEqualTo(1);
        assertThat(margherita.getUnitPriceSnapshot()).isEqualByComparingTo("30.00");
        assertThat(margherita.getItemNote()).isNull();
        assertThat(order.getSubtotal()).isEqualByComparingTo("42.00");
        assertThat(order.getTotal()).isEqualByComparingTo("47.00");
        assertThat(order.getCashChangeFrom()).isNull();
        assertThat(order.getCustomerNotes()).isNull();
    }

    @Test
    void undoIsChained_secondCallRollsBackTheEarlierEdit() {
        wireEditStore();
        service.edit(7L, request(line(101L, 1L, 2, null), line(102L, 2L, 2, null)));
        // Margherita dostała po pierwszej edycji nowy wiersz (nową cenę),
        // więc druga edycja wskazuje go już nowym identyfikatorem.
        Long margheritaId = itemByName("Margherita", null).getId();
        service.edit(7L, request(line(margheritaId, 1L, 2, null)));
        assertThat(order.getItems()).hasSize(1);

        service.undoLast(7L, 1L);
        assertThat(order.getItems()).hasSize(2);
        assertThat(order.getTotal()).isEqualByComparingTo("87.00");

        service.undoLast(7L, 1L);
        assertThat(order.getTotal()).isEqualByComparingTo("47.00");
        assertThat(itemByName("Margherita", null).getQuantity()).isEqualTo(1);
    }

    @Test
    void undoWithoutAnyEditIsRejected() {
        assertThatThrownBy(() -> service.undoLast(7L, 1L))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("Brak zmian do cofnięcia");
    }

    @Test
    void undoIsBlockedOnceTheOrderLeftEditableStatuses() {
        wireEditStore();
        service.edit(7L, request(line(101L, 1L, 2, null), line(102L, 2L, 2, null)));
        order.setStatus(OrderStatus.READY);

        assertThatThrownBy(() -> service.undoLast(7L, 1L))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("nie da się już zmienić");
    }

    /**
     * Repozytorium wpisów udaje bazę: nadaje id, zapamiętuje i zwraca
     * najnowszy niecofnięty wpis — bez tego nie da się przetestować
     * łańcuchowego cofania na mocku.
     */
    private void wireEditStore() {
        List<OrderEdit> store = new java.util.ArrayList<>();
        java.util.concurrent.atomic.AtomicLong seq = new java.util.concurrent.atomic.AtomicLong();
        when(orderEditRepository.save(any(OrderEdit.class))).thenAnswer(inv -> {
            OrderEdit edit = inv.getArgument(0);
            if (edit.getId() == null) {
                setField(edit, "id", seq.incrementAndGet());
                store.add(edit);
            }
            return edit;
        });
        when(orderEditRepository.findFirstByOrderIdAndUndoneAtIsNullOrderByEditedAtDescIdDesc(7L))
                .thenAnswer(inv -> store.stream()
                        .filter(e -> !e.isUndone())
                        .max(java.util.Comparator.comparing(OrderEdit::getId)));
    }

    // ---- Pomocnicze ----

    private Order newOrder() throws Exception {
        Order o = new Order(
                "2026-00007",
                UUID.randomUUID(),
                "Jan Kowalski",
                "+48123456789",
                null,
                FulfillmentType.DELIVERY,
                PaymentMethod.CASH_ON_DELIVERY,
                Address.empty(),
                null,
                null,
                new BigDecimal("42.00"),
                DELIVERY_FEE,
                "Centrum",
                new BigDecimal("47.00"));
        setField(o, "id", 7L);
        setField(o, "version", 1L);

        OrderItem margherita = new OrderItem(1L, null, "Margherita", null,
                new BigDecimal("30.00"), 1, new BigDecimal("30.00"));
        setField(margherita, "id", 101L);
        OrderItem cola = new OrderItem(2L, null, "Cola 0,5 l", null,
                new BigDecimal("6.00"), 2, new BigDecimal("12.00"));
        setField(cola, "id", 102L);
        o.addItem(margherita);
        o.addItem(cola);
        return o;
    }

    private static Product product(Long id, String name, String price, Category category) {
        Product p = mock(Product.class);
        when(p.getId()).thenReturn(id);
        when(p.getName()).thenReturn(name);
        when(p.isAvailable()).thenReturn(true);
        when(p.getCategory()).thenReturn(category);
        when(p.getBasePrice()).thenReturn(new BigDecimal(price));
        when(p.getVariants()).thenReturn(Set.of());
        return p;
    }

    private static EditOrderRequest request(EditOrderItemRequest... items) {
        return new EditOrderRequest(1L, List.of(items), null, null, null);
    }

    private static EditOrderItemRequest line(Long orderItemId, Long productId, int qty, String note) {
        return new EditOrderItemRequest(orderItemId, productId, null, List.of(), qty, note);
    }

    private static EditOrderItemRequest lineWithAddons(Long orderItemId, Long productId,
                                                       int qty, List<Long> addonIds) {
        return new EditOrderItemRequest(orderItemId, productId, null, addonIds, qty, null);
    }

    private static EditOrderItemRequest newLine(Long productId, int qty, List<Long> addonIds, String note) {
        return new EditOrderItemRequest(null, productId, null, addonIds, qty, note);
    }

    private OrderItem itemByName(String productName, String unitPrice) {
        return order.getItems().stream()
                .filter(i -> i.getProductNameSnapshot().equals(productName))
                .filter(i -> unitPrice == null || i.getUnitPriceSnapshot().compareTo(new BigDecimal(unitPrice)) == 0)
                .findFirst()
                .orElseThrow(() -> new AssertionError("Brak pozycji " + productName));
    }

    private static void setField(Object target, String field, Object value) throws Exception {
        Field f = target.getClass().getDeclaredField(field);
        f.setAccessible(true);
        f.set(target, value);
    }
}
