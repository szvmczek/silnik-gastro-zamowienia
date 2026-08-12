package com.pizzashowcase.order.application;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pizzashowcase.order.api.dto.OrderTrackingAddonDto;
import com.pizzashowcase.order.api.dto.admin.AdminOrderDto;
import com.pizzashowcase.order.api.dto.admin.EditOrderItemRequest;
import com.pizzashowcase.order.api.dto.admin.EditOrderRequest;
import com.pizzashowcase.order.api.dto.admin.OrderEditPreviewDto;
import com.pizzashowcase.order.application.OrderLinePricer.LineSpec;
import com.pizzashowcase.order.application.OrderLinePricer.PricedLines;
import com.pizzashowcase.order.application.OrderLinePricer.PricingMode;
import com.pizzashowcase.order.application.event.OrderEditedEvent;
import com.pizzashowcase.order.domain.CashChangePolicy;
import com.pizzashowcase.order.domain.Order;
import com.pizzashowcase.order.domain.OrderEdit;
import com.pizzashowcase.order.domain.OrderItem;
import com.pizzashowcase.order.domain.OrderItemAddon;
import com.pizzashowcase.order.infrastructure.OrderEditRepository;
import com.pizzashowcase.order.infrastructure.OrderRepository;
import com.pizzashowcase.shared.error.ApiException;
import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Edycja treści zamówienia z panelu — klient dzwoni po złożeniu i chce
 * coś zmienić. Zamiast anulować i wystawiać nowe zamówienie (co gubi numer,
 * historię i link trackingowy), zmieniamy pozycje w miejscu.
 *
 * <p>Kluczowe zasady:
 * <ul>
 *   <li>Pozycja o niezmienionej konfiguracji zostaje TĄ SAMĄ encją ze swoim
 *       snapshotem cenowym (AD-006) — zmiana ceny w menu po złożeniu
 *       zamówienia nie ma prawa po cichu przepisać kwoty czegoś, czego
 *       admin nie tknął.</li>
 *   <li>Pozycja nowa albo zmieniona idzie przez {@link OrderLinePricer},
 *       czyli ten sam silnik co checkout (CLAUDE.md §5).</li>
 *   <li>{@code deliveryFee} i strefa zostają nietknięte — adres się nie
 *       zmienia, a snapshot strefy z AD-016 ma być niezmienny.</li>
 * </ul>
 */
@Service
@Transactional
public class OrderEditService {

    private final OrderRepository orderRepository;
    private final OrderEditRepository orderEditRepository;
    private final OrderLinePricer orderLinePricer;
    private final AdminOrderQueryService adminOrderQueryService;
    private final ApplicationEventPublisher eventPublisher;
    private final ObjectMapper objectMapper;
    private final EntityManager entityManager;

    public OrderEditService(OrderRepository orderRepository,
                            OrderEditRepository orderEditRepository,
                            OrderLinePricer orderLinePricer,
                            AdminOrderQueryService adminOrderQueryService,
                            ApplicationEventPublisher eventPublisher,
                            ObjectMapper objectMapper,
                            EntityManager entityManager) {
        this.entityManager = entityManager;
        this.orderRepository = orderRepository;
        this.orderEditRepository = orderEditRepository;
        this.orderLinePricer = orderLinePricer;
        this.adminOrderQueryService = adminOrderQueryService;
        this.eventPublisher = eventPublisher;
        this.objectMapper = objectMapper;
    }

    // ---- Podgląd ----

    /**
     * Liczy wynik edycji bez zapisywania. Świadomie NIE dotyka encji
     * {@link Order} — nowe pozycje powstają jako obiekty wolne i giną po
     * wyjściu z metody, więc nic nie może wyciec flushem na końcu
     * transakcji.
     */
    @Transactional(readOnly = true)
    public OrderEditPreviewDto preview(Long id, EditOrderRequest request) {
        Order order = loadOrThrow(id);
        assertEditable(order);

        Resolution resolution = resolve(order, request.items());
        BigDecimal deliveryFee = order.getDeliveryFee();
        BigDecimal total = resolution.subtotal().add(deliveryFee).setScale(2, RoundingMode.HALF_UP);

        List<OrderEditPreviewDto.Item> items = resolution.lines().stream()
                .map(line -> new OrderEditPreviewDto.Item(
                        line.previousId(),
                        line.item().getProductNameSnapshot(),
                        line.item().getVariantNameSnapshot(),
                        line.item().getQuantity(),
                        line.item().getUnitPriceSnapshot(),
                        line.item().getLineTotal(),
                        line.noteAfter(),
                        line.repriced(),
                        toAddonDtos(line.item())))
                .toList();

        Set<Long> productIds = request.items().stream()
                .map(EditOrderItemRequest::productId)
                .collect(Collectors.toSet());
        List<String> warnings = orderLinePricer.availabilityWarnings(productIds);

        return new OrderEditPreviewDto(
                items,
                resolution.subtotal(),
                deliveryFee,
                total,
                request.cashChangeFrom(),
                CashChangePolicy.isSufficient(request.cashChangeFrom(), total),
                warnings);
    }

    // ---- Zapis ----

    public AdminOrderDto edit(Long id, EditOrderRequest request) {
        Order order = loadOrThrow(id);
        assertVersion(order, request.version());
        assertEditable(order);

        OrderEditSnapshot before = OrderEditSnapshot.of(order);
        BigDecimal totalBefore = order.getTotal();

        Resolution resolution = resolve(order, request.items());

        BigDecimal subtotal = resolution.subtotal();
        BigDecimal total = subtotal.add(order.getDeliveryFee()).setScale(2, RoundingMode.HALF_UP);
        // AD-026 na NOWEJ sumie: podbicie zamówienia edycją nie może
        // zostawić nieaktualnego nominału, przez który kurier przyjedzie
        // bez odpowiedniej reszty.
        BigDecimal cashChangeFrom = CashChangePolicy.normalize(request.cashChangeFrom(), total);
        String customerNotes = trimToNull(request.customerNotes());

        List<String> summaryLines = new ArrayList<>();
        String reason = trimToNull(request.reason());
        if (reason != null) {
            summaryLines.add("Powód: " + reason);
        }
        summaryLines.addAll(resolution.changeLines());
        describeOrderNoteChange(before.customerNotes(), customerNotes, summaryLines);
        describeCashChange(before.cashChangeFrom(), cashChangeFrom, totalBefore, total, summaryLines);
        if (totalBefore.compareTo(total) != 0) {
            summaryLines.add("Suma: " + zl(totalBefore) + " → " + zl(total));
        }
        if (summaryLines.isEmpty()) {
            throw ApiException.unprocessable("Nic się nie zmieniło — nie ma czego zapisać.");
        }

        applyResolution(order, resolution);
        // Zmiana samej notatki pozycji brudzi wiersz order_items, a nie
        // orders — bez wymuszenia @Version zostałaby bez zmian i drugi
        // admin nadpisałby ją po cichu zamiast dostać 409 (AD-009).
        entityManager.lock(order, LockModeType.OPTIMISTIC_FORCE_INCREMENT);
        order.setSubtotal(subtotal);
        order.setTotal(total);
        order.setCashChangeFrom(cashChangeFrom);
        order.setCustomerNotes(customerNotes);

        // Flush wymusza bump @Version zanim zbudujemy DTO — inaczej klient
        // dostanie starą wersję i następny zapis skończy się 409
        // (ten sam powód co w OrderStatusService).
        Order saved = orderRepository.saveAndFlush(order);

        orderEditRepository.save(new OrderEdit(
                saved.getId(),
                Instant.now(),
                currentAdminIdentity(),
                String.join("\n", summaryLines),
                totalBefore,
                total,
                writeSnapshot(before)));

        publishEdited(saved, OrderEditedEvent.Kind.EDIT);
        return adminOrderQueryService.toDto(saved);
    }

    // ---- Cofanie ----

    /**
     * Cofa najnowszą jeszcze niecofniętą edycję. Pozycje odtwarzane są
     * WPROST ze snapshotu, bez zaglądania do menu — dzięki temu cofnięcie
     * jest wierne nawet wtedy, gdy produkt zdążył zniknąć z karty albo
     * zmienić cenę.
     *
     * <p>Cofanie jest łańcuchowe: kolejne wywołanie zdejmie edycję
     * wcześniejszą. To dalej nie jest wersjonowanie — nie ma skoku do
     * dowolnego punktu historii, tylko krok wstecz.
     */
    public AdminOrderDto undoLast(Long id, Long version) {
        Order order = loadOrThrow(id);
        assertVersion(order, version);
        assertEditable(order);

        OrderEdit last = orderEditRepository
                .findFirstByOrderIdAndUndoneAtIsNullOrderByEditedAtDescIdDesc(id)
                .orElseThrow(() -> ApiException.unprocessable("Brak zmian do cofnięcia."));

        OrderEditSnapshot snapshot = readSnapshot(last.getSnapshotBefore());

        entityManager.lock(order, LockModeType.OPTIMISTIC_FORCE_INCREMENT);
        List<OrderItem> current = List.copyOf(order.getItems());
        current.forEach(order::removeItem);
        for (OrderEditSnapshot.Item item : snapshot.items()) {
            order.addItem(OrderEditSnapshot.toEntity(item));
        }
        order.setSubtotal(snapshot.subtotal());
        order.setTotal(snapshot.total());
        order.setCashChangeFrom(snapshot.cashChangeFrom());
        order.setCustomerNotes(snapshot.customerNotes());

        last.markUndone(Instant.now(), currentAdminIdentity());
        orderEditRepository.save(last);

        Order saved = orderRepository.saveAndFlush(order);
        publishEdited(saved, OrderEditedEvent.Kind.UNDO);
        return adminOrderQueryService.toDto(saved);
    }

    // ---- Rozwiązanie pozycji ----

    /** Jedna linia wyniku: encja (istniejąca albo świeżo wyceniona) + kontekst do opisu zmiany. */
    private record ResolvedLine(OrderItem item,
                                Long previousId,
                                boolean repriced,
                                String noteAfter) {
    }

    private record Resolution(List<ResolvedLine> lines,
                              List<OrderItem> keptItems,
                              List<OrderItem> removedItems,
                              List<String> changeLines,
                              BigDecimal subtotal) {
    }

    private Resolution resolve(Order order, List<EditOrderItemRequest> requested) {
        // Zamówienie bez pozycji nie ma sensu operacyjnego — wycofanie
        // całości to anulowanie (D-05), nie edycja do zera.
        if (requested.isEmpty()) {
            throw ApiException.unprocessable(
                    "Zamówienie musi mieć co najmniej jedną pozycję."
                            + " Aby wycofać całość, anuluj zamówienie.");
        }
        Map<Long, OrderItem> existing = new LinkedHashMap<>();
        for (OrderItem item : order.getItems()) {
            existing.put(item.getId(), item);
        }

        int size = requested.size();
        OrderItem[] kept = new OrderItem[size];
        OrderItem[] replaced = new OrderItem[size];
        List<Integer> toPrice = new ArrayList<>();
        Set<Long> referenced = new HashSet<>();

        for (int i = 0; i < size; i++) {
            EditOrderItemRequest line = requested.get(i);
            Long prevId = line.orderItemId();
            if (prevId != null) {
                OrderItem previous = existing.get(prevId);
                if (previous == null) {
                    throw ApiException.unprocessable(
                            "Pozycja " + prevId + " nie należy do tego zamówienia. Odśwież widok.");
                }
                if (!referenced.add(prevId)) {
                    throw ApiException.unprocessable("Pozycja " + prevId + " została podana dwa razy.");
                }
                if (sameConfiguration(previous, line)) {
                    kept[i] = previous;
                    continue;
                }
                replaced[i] = previous;
            }
            toPrice.add(i);
        }

        List<LineSpec> specs = toPrice.stream()
                .map(requested::get)
                .map(line -> new LineSpec(line.productId(), line.variantId(),
                        line.addonIds(), line.quantity(), line.itemNote()))
                .toList();
        PricedLines priced = orderLinePricer.price(specs, PricingMode.ADMIN_EDIT);

        List<ResolvedLine> lines = new ArrayList<>(size);
        List<String> changeLines = new ArrayList<>();
        List<OrderItem> keptItems = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;

        int pricedIdx = 0;
        for (int i = 0; i < size; i++) {
            EditOrderItemRequest line = requested.get(i);
            if (kept[i] != null) {
                OrderItem item = kept[i];
                String noteAfter = trimToNull(line.itemNote());
                describeNoteChange(item, noteAfter, changeLines);
                keptItems.add(item);
                lines.add(new ResolvedLine(item, item.getId(), false, noteAfter));
                subtotal = subtotal.add(item.getLineTotal());
                continue;
            }
            OrderItem fresh = priced.items().get(pricedIdx++);
            OrderItem previous = replaced[i];
            if (previous == null) {
                changeLines.add("Dodano pozycję: " + describe(fresh));
            } else {
                describeReplacement(previous, fresh, changeLines);
            }
            lines.add(new ResolvedLine(fresh, previous != null ? previous.getId() : null,
                    true, fresh.getItemNote()));
            subtotal = subtotal.add(fresh.getLineTotal());
        }

        List<OrderItem> removed = existing.values().stream()
                .filter(item -> !referenced.contains(item.getId()))
                .toList();
        for (OrderItem item : removed) {
            changeLines.add("Usunięto pozycję: " + describe(item));
        }

        return new Resolution(lines, keptItems, removed, changeLines,
                subtotal.setScale(2, RoundingMode.HALF_UP));
    }

    private void applyResolution(Order order, Resolution resolution) {
        Set<Long> keptIds = new HashSet<>();
        for (OrderItem kept : resolution.keptItems()) {
            keptIds.add(kept.getId());
        }
        // Wszystko, czego nie zachowujemy, znika: i pozycje usunięte przez
        // admina, i te zmienione (dostaną nowy wiersz z aktualną ceną).
        // Materializacja przez toList() przed pętlą — inaczej modyfikacja
        // kolekcji w trakcie iteracji.
        List<OrderItem> toRemove = order.getItems().stream()
                .filter(item -> !keptIds.contains(item.getId()))
                .toList();
        toRemove.forEach(order::removeItem);

        for (ResolvedLine line : resolution.lines()) {
            if (line.repriced()) {
                order.addItem(line.item());
            } else {
                line.item().setItemNote(line.noteAfter());
            }
        }
    }

    // ---- Opisy zmian (czytelne dla człowieka) ----

    private static void describeNoteChange(OrderItem item, String noteAfter, List<String> out) {
        describeNoteChange(item, noteAfter, label(item), out);
    }

    /**
     * Etykieta podawana osobno, bo przy zmienionej pozycji notatka dotyczy
     * jej stanu PO zmianie — inaczej wpis mówiłby o „Margherita 30 cm",
     * której w zamówieniu już nie ma.
     */
    private static void describeNoteChange(OrderItem item, String noteAfter,
                                           String label, List<String> out) {
        String before = item.getItemNote();
        if (Objects.equals(before, noteAfter)) {
            return;
        }
        if (noteAfter == null) {
            out.add("Usunięto notatkę z „" + label + "”");
        } else {
            out.add("Notatka do „" + label + "”: „" + noteAfter + "”");
        }
    }

    private static void describeReplacement(OrderItem before, OrderItem after, List<String> out) {
        if (!Objects.equals(before.getProductId(), after.getProductId())) {
            out.add("Zmieniono produkt: " + describe(before) + " → " + describe(after));
            return;
        }
        String label = label(after);
        if (!Objects.equals(before.getVariantNameSnapshot(), after.getVariantNameSnapshot())) {
            out.add("Zmieniono rozmiar w „" + before.getProductNameSnapshot() + "”: "
                    + orDash(before.getVariantNameSnapshot()) + " → " + orDash(after.getVariantNameSnapshot()));
        }
        if (before.getQuantity() != after.getQuantity()) {
            out.add("Zmieniono ilość „" + label + "”: " + before.getQuantity() + " → " + after.getQuantity());
        }
        List<String> addonsBefore = addonNames(before);
        List<String> addonsAfter = addonNames(after);
        List<String> added = minus(addonsAfter, addonsBefore);
        List<String> dropped = minus(addonsBefore, addonsAfter);
        if (!added.isEmpty()) {
            out.add("Dodano do „" + label + "”: " + String.join(", ", added));
        }
        if (!dropped.isEmpty()) {
            out.add("Usunięto z „" + label + "”: " + String.join(", ", dropped));
        }
        describeNoteChange(before, after.getItemNote(), label, out);
    }

    private static void describeOrderNoteChange(String before, String after, List<String> out) {
        if (Objects.equals(before, after)) {
            return;
        }
        out.add(after == null
                ? "Usunięto notatkę do zamówienia"
                : "Notatka do zamówienia: „" + after + "”");
    }

    /**
     * Reszta z gotówki po P10: {@code null} = brak danych, kwota równa
     * sumie = gotówka odliczona, kwota wyższa = wydajemy resztę.
     */
    private static void describeCashChange(BigDecimal before, BigDecimal after,
                                           BigDecimal totalBefore, BigDecimal totalAfter,
                                           List<String> out) {
        if (before == null && after == null) {
            return;
        }
        if (before != null && after != null && before.compareTo(after) == 0) {
            return;
        }
        out.add("Reszta z gotówki: " + cashLabel(before, totalBefore) + " → " + cashLabel(after, totalAfter));
    }

    private static String cashLabel(BigDecimal cashChangeFrom, BigDecimal total) {
        if (cashChangeFrom == null) {
            return "brak danych";
        }
        if (cashChangeFrom.compareTo(total) == 0) {
            return "gotówka odliczona";
        }
        return "z " + zl(cashChangeFrom);
    }

    private static String describe(OrderItem item) {
        StringBuilder sb = new StringBuilder()
                .append(item.getQuantity()).append("× ").append(label(item));
        List<String> addons = addonNames(item);
        if (!addons.isEmpty()) {
            sb.append(" (").append(String.join(", ", addons)).append(")");
        }
        return sb.toString();
    }

    private static String label(OrderItem item) {
        return item.getVariantNameSnapshot() == null
                ? item.getProductNameSnapshot()
                : item.getProductNameSnapshot() + " " + item.getVariantNameSnapshot();
    }

    private static List<String> addonNames(OrderItem item) {
        return item.getAddons().stream()
                .map(a -> a.getAddonNameSnapshot().toLowerCase(Locale.ROOT))
                .sorted()
                .toList();
    }

    private static List<String> minus(List<String> from, List<String> other) {
        List<String> rest = new ArrayList<>(from);
        rest.removeAll(other);
        return rest;
    }

    private static String orDash(String s) {
        return s == null ? "—" : s;
    }

    static String zl(BigDecimal amount) {
        return amount.setScale(2, RoundingMode.HALF_UP).toPlainString().replace('.', ',') + " zł";
    }

    // ---- Pomocnicze ----

    private static boolean sameConfiguration(OrderItem previous, EditOrderItemRequest line) {
        if (!Objects.equals(previous.getProductId(), line.productId())) return false;
        if (!Objects.equals(previous.getVariantId(), line.variantId())) return false;
        if (previous.getQuantity() != line.quantity()) return false;
        List<Long> before = previous.getAddons().stream()
                .map(OrderItemAddon::getAddonId)
                .sorted()
                .toList();
        List<Long> after = (line.addonIds() == null ? List.<Long>of() : line.addonIds()).stream()
                .sorted(Comparator.naturalOrder())
                .toList();
        return before.equals(after);
    }

    private static List<OrderTrackingAddonDto> toAddonDtos(OrderItem item) {
        return item.getAddons().stream()
                .map(a -> new OrderTrackingAddonDto(
                        a.getAddonGroupNameSnapshot(),
                        a.getAddonNameSnapshot(),
                        a.getUnitPriceSnapshot()))
                .toList();
    }

    private Order loadOrThrow(Long id) {
        return orderRepository.findWithDetailsById(id)
                .orElseThrow(() -> ApiException.notFound("Nie znaleziono zamówienia o id " + id));
    }

    static void assertEditable(Order order) {
        if (!order.getStatus().isContentEditable()) {
            throw ApiException.unprocessable(
                    "Zamówienia w statusie " + order.getStatus()
                            + " nie da się już zmienić. Jedzenie jest spakowane albo w drodze —"
                            + " zostaje anulowanie i nowe zamówienie.");
        }
    }

    static void assertVersion(Order order, Long expectedVersion) {
        if (!Objects.equals(expectedVersion, order.getVersion())) {
            throw new OptimisticLockingFailureException("Order " + order.getId() + " version mismatch");
        }
    }

    void publishEdited(Order order, OrderEditedEvent.Kind kind) {
        eventPublisher.publishEvent(new OrderEditedEvent(
                order.getId(), order.getOrderNumber(), order.getTotal(), kind));
    }

    String writeSnapshot(OrderEditSnapshot snapshot) {
        try {
            return objectMapper.writeValueAsString(snapshot);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Nie udało się zapisać stanu zamówienia przed edycją", e);
        }
    }

    OrderEditSnapshot readSnapshot(String json) {
        try {
            return objectMapper.readValue(json, OrderEditSnapshot.class);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Nie udało się odczytać stanu zamówienia sprzed edycji", e);
        }
    }

    static String currentAdminIdentity() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null ? auth.getName() : null;
    }

    static String trimToNull(String s) {
        if (s == null) return null;
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }
}
