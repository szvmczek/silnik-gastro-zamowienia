package com.pizzashowcase.order.application;

import com.pizzashowcase.order.api.dto.admin.AdminDashboardStatsDto;
import com.pizzashowcase.order.api.dto.admin.AdminDashboardStatsDto.DailyStats;
import com.pizzashowcase.order.api.dto.admin.AdminDashboardStatsDto.TopProductStats;
import com.pizzashowcase.order.domain.FulfillmentType;
import com.pizzashowcase.order.domain.Order;
import com.pizzashowcase.order.domain.OrderItem;
import com.pizzashowcase.order.domain.OrderStatus;
import com.pizzashowcase.order.infrastructure.OrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class AdminOrderQueryServiceStatsTest {

    private static final ZoneId ZONE = ZoneId.of("Europe/Warsaw");

    private OrderRepository orderRepository;
    private AdminOrderQueryService service;

    @BeforeEach
    void setUp() {
        orderRepository = mock(OrderRepository.class);
        service = new AdminOrderQueryService(orderRepository,
                mock(com.pizzashowcase.order.infrastructure.OrderEditRepository.class));

        when(orderRepository.countByStatus(any(OrderStatus.class))).thenReturn(0L);
        when(orderRepository.countByStatusAndFulfillmentType(any(), any())).thenReturn(0L);
        when(orderRepository.countByStatusIn(any())).thenReturn(0L);
    }

    @Test
    void stats_aggregatesTodayCorrectly() {
        LocalDate today = LocalDate.now(ZONE);
        Instant todayNoon = today.atStartOfDay(ZONE).plusHours(12).toInstant();

        Order delivered = orderMock(todayNoon, OrderStatus.DELIVERED, FulfillmentType.DELIVERY,
                BigDecimal.valueOf(80), Set.of());
        Order pickup = orderMock(todayNoon, OrderStatus.READY, FulfillmentType.PICKUP,
                BigDecimal.valueOf(40), Set.of());
        Order canceled = orderMock(todayNoon, OrderStatus.CANCELED, FulfillmentType.DELIVERY,
                BigDecimal.valueOf(50), Set.of());

        when(orderRepository.findInCreatedAtRange(any(Instant.class), any(Instant.class)))
                .thenReturn(List.of(delivered, pickup, canceled));
        when(orderRepository.findInCreatedAtRangeWithItems(any(Instant.class), any(Instant.class)))
                .thenReturn(List.of());

        AdminDashboardStatsDto result = service.stats();

        assertThat(result.today().orderCount()).isEqualTo(3);
        assertThat(result.today().totalRevenue()).isEqualByComparingTo(BigDecimal.valueOf(120));
        assertThat(result.today().averageOrderValue()).isEqualByComparingTo(BigDecimal.valueOf(60));
        assertThat(result.today().deliveryCount()).isEqualTo(2);
        assertThat(result.today().pickupCount()).isEqualTo(1);
        assertThat(result.today().canceledCount()).isEqualTo(1);
    }

    @Test
    void stats_emptyTodayHasZeroAov() {
        when(orderRepository.findInCreatedAtRange(any(Instant.class), any(Instant.class)))
                .thenReturn(List.of());
        when(orderRepository.findInCreatedAtRangeWithItems(any(Instant.class), any(Instant.class)))
                .thenReturn(List.of());

        AdminDashboardStatsDto result = service.stats();

        assertThat(result.today().orderCount()).isZero();
        assertThat(result.today().averageOrderValue()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(result.last7Days()).hasSize(7);
        assertThat(result.hourlyToday()).hasSize(24);
        assertThat(result.topProducts30Days()).isEmpty();
    }

    @Test
    void stats_last7DaysIncludesZeroFilledDays() {
        LocalDate today = LocalDate.now(ZONE);
        Instant todayNoon = today.atStartOfDay(ZONE).plusHours(12).toInstant();
        Instant yesterdayNoon = today.minusDays(1).atStartOfDay(ZONE).plusHours(12).toInstant();

        Order todayOrder = orderMock(todayNoon, OrderStatus.DELIVERED, FulfillmentType.DELIVERY,
                BigDecimal.valueOf(100), Set.of());
        Order yesterdayOrder = orderMock(yesterdayNoon, OrderStatus.DELIVERED, FulfillmentType.PICKUP,
                BigDecimal.valueOf(50), Set.of());

        when(orderRepository.findInCreatedAtRange(any(Instant.class), any(Instant.class)))
                .thenReturn(List.of(todayOrder, yesterdayOrder));
        when(orderRepository.findInCreatedAtRangeWithItems(any(Instant.class), any(Instant.class)))
                .thenReturn(List.of());

        AdminDashboardStatsDto result = service.stats();

        assertThat(result.last7Days()).hasSize(7);
        DailyStats todayStats = result.last7Days().get(6);
        DailyStats yesterdayStats = result.last7Days().get(5);
        assertThat(todayStats.date()).isEqualTo(today);
        assertThat(todayStats.orderCount()).isEqualTo(1);
        assertThat(todayStats.revenue()).isEqualByComparingTo(BigDecimal.valueOf(100));
        assertThat(yesterdayStats.date()).isEqualTo(today.minusDays(1));
        assertThat(yesterdayStats.orderCount()).isEqualTo(1);
        // 5 days back = zero-filled
        assertThat(result.last7Days().get(0).orderCount()).isZero();
    }

    @Test
    void stats_topProductsExcludesCanceledAndSortsBySoldDesc() {
        LocalDate today = LocalDate.now(ZONE);
        Instant todayNoon = today.atStartOfDay(ZONE).plusHours(12).toInstant();

        Order o1 = orderMock(todayNoon, OrderStatus.DELIVERED, FulfillmentType.DELIVERY,
                BigDecimal.valueOf(100),
                items(item("Margherita", 3), item("Pepperoni", 1)));
        Order o2 = orderMock(todayNoon, OrderStatus.DELIVERED, FulfillmentType.PICKUP,
                BigDecimal.valueOf(50),
                items(item("Margherita", 2)));
        // Canceled order's items must NOT contribute.
        Order canceled = orderMock(todayNoon, OrderStatus.CANCELED, FulfillmentType.DELIVERY,
                BigDecimal.valueOf(200),
                items(item("Margherita", 100)));

        when(orderRepository.findInCreatedAtRange(any(Instant.class), any(Instant.class)))
                .thenReturn(List.of());
        when(orderRepository.findInCreatedAtRangeWithItems(any(Instant.class), any(Instant.class)))
                .thenReturn(List.of(o1, o2, canceled));

        AdminDashboardStatsDto result = service.stats();

        List<TopProductStats> top = result.topProducts30Days();
        assertThat(top).hasSize(2);
        assertThat(top.get(0).productName()).isEqualTo("Margherita");
        assertThat(top.get(0).totalSold()).isEqualTo(5L);
        assertThat(top.get(1).productName()).isEqualTo("Pepperoni");
        assertThat(top.get(1).totalSold()).isEqualTo(1L);
    }

    private static Order orderMock(Instant createdAt, OrderStatus status, FulfillmentType fulfillment,
                                   BigDecimal total, Set<OrderItem> items) {
        Order o = mock(Order.class);
        when(o.getCreatedAt()).thenReturn(createdAt);
        when(o.getStatus()).thenReturn(status);
        when(o.getFulfillmentType()).thenReturn(fulfillment);
        when(o.getTotal()).thenReturn(total);
        when(o.getItems()).thenReturn(items);
        return o;
    }

    private static OrderItem item(String name, int qty) {
        OrderItem i = mock(OrderItem.class);
        when(i.getProductNameSnapshot()).thenReturn(name);
        when(i.getQuantity()).thenReturn(qty);
        return i;
    }

    private static Set<OrderItem> items(OrderItem... arr) {
        Set<OrderItem> set = new LinkedHashSet<>();
        for (OrderItem i : arr) set.add(i);
        return set;
    }
}
