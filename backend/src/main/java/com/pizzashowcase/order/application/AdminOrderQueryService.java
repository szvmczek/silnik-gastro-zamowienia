package com.pizzashowcase.order.application;

import com.pizzashowcase.order.api.dto.OrderTrackingAddonDto;
import com.pizzashowcase.order.api.dto.OrderTrackingAddressDto;
import com.pizzashowcase.order.api.dto.OrderTrackingItemDto;
import com.pizzashowcase.order.api.dto.admin.AdminDashboardStatsDto;
import com.pizzashowcase.order.api.dto.admin.AdminDashboardStatsDto.ActiveCounts;
import com.pizzashowcase.order.api.dto.admin.AdminDashboardStatsDto.DailyStats;
import com.pizzashowcase.order.api.dto.admin.AdminDashboardStatsDto.HourlyStats;
import com.pizzashowcase.order.api.dto.admin.AdminDashboardStatsDto.Today;
import com.pizzashowcase.order.api.dto.admin.AdminDashboardStatsDto.TopProductStats;
import com.pizzashowcase.order.api.dto.admin.AdminDashboardSummaryDto;
import com.pizzashowcase.order.api.dto.admin.AdminOrderDto;
import com.pizzashowcase.order.api.dto.admin.AdminOrderListItemDto;
import com.pizzashowcase.order.api.dto.admin.AdminOrderStatusCountsDto;
import com.pizzashowcase.order.api.dto.admin.AdminOrderStatusHistoryDto;
import com.pizzashowcase.order.domain.Address;
import com.pizzashowcase.order.domain.FulfillmentType;
import com.pizzashowcase.order.domain.Order;
import com.pizzashowcase.order.domain.OrderItem;
import com.pizzashowcase.order.domain.OrderStatus;
import com.pizzashowcase.order.infrastructure.OrderRepository;
import com.pizzashowcase.shared.error.ApiException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class AdminOrderQueryService {

    private static final ZoneId RESTAURANT_ZONE = ZoneId.of("Europe/Warsaw");
    private static final Instant RANGE_MIN = Instant.EPOCH;
    // Sentinel "far future" — PostgreSQL timestamptz supports up to 294276 AD,
    // Instant.MAX would overflow. Year 9999 is safely above any real order.
    private static final Instant RANGE_MAX = Instant.parse("9999-12-31T23:59:59Z");
    private static final List<OrderStatus> IN_PREPARATION_STATUSES =
            List.of(OrderStatus.CONFIRMED, OrderStatus.IN_PREPARATION);
    private static final List<OrderStatus> AWAITING_FULFILLMENT_STATUSES =
            List.of(OrderStatus.READY, OrderStatus.OUT_FOR_DELIVERY);

    private final OrderRepository orderRepository;

    public AdminOrderQueryService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    public Page<AdminOrderListItemDto> list(OrderStatus status,
                                            FulfillmentType fulfillmentType,
                                            LocalDate dateFrom,
                                            LocalDate dateTo,
                                            Pageable pageable) {
        Instant fromInclusive = toInstantStart(dateFrom);
        Instant toExclusive = toInstantEndExclusive(dateTo);
        return orderRepository.findAllFiltered(status, fulfillmentType, fromInclusive, toExclusive, pageable)
                .map(this::toListItem);
    }

    public AdminOrderStatusCountsDto statusCounts(FulfillmentType fulfillmentType,
                                                  LocalDate dateFrom,
                                                  LocalDate dateTo) {
        Instant fromInclusive = toInstantStart(dateFrom);
        Instant toExclusive = toInstantEndExclusive(dateTo);
        Map<OrderStatus, Long> byStatus = new EnumMap<>(OrderStatus.class);
        for (OrderStatus status : OrderStatus.values()) {
            byStatus.put(status, 0L);
        }
        long total = 0L;
        for (Object[] row : orderRepository.countGroupedByStatus(
                fulfillmentType, fromInclusive, toExclusive)) {
            OrderStatus status = (OrderStatus) row[0];
            long count = (Long) row[1];
            byStatus.put(status, count);
            total += count;
        }
        return new AdminOrderStatusCountsDto(byStatus, total);
    }

    public AdminOrderDto getById(Long id) {
        Order order = orderRepository.findWithDetailsById(id)
                .orElseThrow(() -> ApiException.notFound("Nie znaleziono zamówienia o id " + id));
        return toDto(order);
    }

    public AdminDashboardSummaryDto summary() {
        LocalDate today = LocalDate.now(RESTAURANT_ZONE);
        Instant fromToday = today.atStartOfDay(RESTAURANT_ZONE).toInstant();
        Instant toTomorrow = today.plusDays(1).atStartOfDay(RESTAURANT_ZONE).toInstant();
        long newToday = orderRepository.countByStatusAndCreatedAtInRange(
                OrderStatus.NEW, fromToday, toTomorrow);
        long inPreparation = orderRepository.countByStatusIn(IN_PREPARATION_STATUSES);
        long awaitingFulfillment = orderRepository.countByStatusIn(AWAITING_FULFILLMENT_STATUSES);
        return new AdminDashboardSummaryDto(newToday, inPreparation, awaitingFulfillment);
    }

    public AdminDashboardStatsDto stats() {
        LocalDate today = LocalDate.now(RESTAURANT_ZONE);
        Instant todayStart = today.atStartOfDay(RESTAURANT_ZONE).toInstant();
        Instant tomorrowStart = today.plusDays(1).atStartOfDay(RESTAURANT_ZONE).toInstant();
        Instant sevenDaysAgoStart = today.minusDays(6).atStartOfDay(RESTAURANT_ZONE).toInstant();
        Instant thirtyDaysAgoStart = today.minusDays(29).atStartOfDay(RESTAURANT_ZONE).toInstant();

        List<Order> last7DaysOrders = orderRepository.findInCreatedAtRange(sevenDaysAgoStart, tomorrowStart);
        List<Order> last30DaysWithItems = orderRepository.findInCreatedAtRangeWithItems(
                thirtyDaysAgoStart, tomorrowStart);

        Today todayStats = aggregateToday(last7DaysOrders, todayStart, tomorrowStart);
        ActiveCounts activeCounts = aggregateActiveCounts();
        List<DailyStats> daily = aggregateLast7Days(last7DaysOrders, today);
        List<HourlyStats> hourly = aggregateHourlyToday(last7DaysOrders, todayStart, tomorrowStart);
        List<TopProductStats> topProducts = aggregateTopProducts30Days(last30DaysWithItems);

        return new AdminDashboardStatsDto(todayStats, activeCounts, daily, hourly, topProducts);
    }

    private Today aggregateToday(List<Order> last7Days, Instant todayStart, Instant tomorrowStart) {
        long orderCount = 0;
        long deliveryCount = 0;
        long pickupCount = 0;
        long canceledCount = 0;
        long nonCanceledCount = 0;
        BigDecimal revenue = BigDecimal.ZERO;
        for (Order o : last7Days) {
            Instant created = o.getCreatedAt();
            if (created.isBefore(todayStart) || !created.isBefore(tomorrowStart)) continue;
            orderCount++;
            if (o.getFulfillmentType() == FulfillmentType.DELIVERY) deliveryCount++;
            else if (o.getFulfillmentType() == FulfillmentType.PICKUP) pickupCount++;
            if (o.getStatus() == OrderStatus.CANCELED) {
                canceledCount++;
            } else {
                nonCanceledCount++;
                revenue = revenue.add(o.getTotal());
            }
        }
        BigDecimal aov = nonCanceledCount == 0
                ? BigDecimal.ZERO
                : revenue.divide(BigDecimal.valueOf(nonCanceledCount), 2, RoundingMode.HALF_UP);
        return new Today(orderCount, revenue, aov, deliveryCount, pickupCount, canceledCount);
    }

    private ActiveCounts aggregateActiveCounts() {
        long newCount = orderRepository.countByStatus(OrderStatus.NEW);
        long inPrep = orderRepository.countByStatusIn(IN_PREPARATION_STATUSES);
        long readyPickup = orderRepository.countByStatusAndFulfillmentType(
                OrderStatus.READY, FulfillmentType.PICKUP);
        long readyDelivery = orderRepository.countByStatusAndFulfillmentType(
                OrderStatus.READY, FulfillmentType.DELIVERY);
        long outForDelivery = orderRepository.countByStatus(OrderStatus.OUT_FOR_DELIVERY);
        return new ActiveCounts(newCount, inPrep, readyPickup, readyDelivery, outForDelivery);
    }

    private List<DailyStats> aggregateLast7Days(List<Order> orders, LocalDate today) {
        Map<LocalDate, long[]> counts = new HashMap<>();
        Map<LocalDate, BigDecimal> revenue = new HashMap<>();
        for (Order o : orders) {
            LocalDate day = o.getCreatedAt().atZone(RESTAURANT_ZONE).toLocalDate();
            counts.computeIfAbsent(day, k -> new long[1])[0]++;
            if (o.getStatus() != OrderStatus.CANCELED) {
                revenue.merge(day, o.getTotal(), BigDecimal::add);
            }
        }
        List<DailyStats> result = new ArrayList<>(7);
        for (int i = 6; i >= 0; i--) {
            LocalDate day = today.minusDays(i);
            long count = counts.getOrDefault(day, new long[]{0L})[0];
            BigDecimal rev = revenue.getOrDefault(day, BigDecimal.ZERO);
            result.add(new DailyStats(day, count, rev));
        }
        return result;
    }

    private List<HourlyStats> aggregateHourlyToday(List<Order> last7Days,
                                                   Instant todayStart,
                                                   Instant tomorrowStart) {
        long[] counts = new long[24];
        for (Order o : last7Days) {
            Instant created = o.getCreatedAt();
            if (created.isBefore(todayStart) || !created.isBefore(tomorrowStart)) continue;
            int hour = created.atZone(RESTAURANT_ZONE).getHour();
            counts[hour]++;
        }
        List<HourlyStats> result = new ArrayList<>(24);
        for (int h = 0; h < 24; h++) {
            result.add(new HourlyStats(h, counts[h]));
        }
        return result;
    }

    private List<TopProductStats> aggregateTopProducts30Days(List<Order> orders) {
        Map<String, Long> totals = new HashMap<>();
        for (Order o : orders) {
            if (o.getStatus() == OrderStatus.CANCELED) continue;
            for (OrderItem item : o.getItems()) {
                totals.merge(item.getProductNameSnapshot(), (long) item.getQuantity(), Long::sum);
            }
        }
        return totals.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed()
                        .thenComparing(Comparator.comparing(Map.Entry::getKey)))
                .limit(5)
                .map(e -> new TopProductStats(e.getKey(), e.getValue()))
                .toList();
    }

    private Instant toInstantStart(LocalDate date) {
        return date == null ? RANGE_MIN : date.atStartOfDay(RESTAURANT_ZONE).toInstant();
    }

    private Instant toInstantEndExclusive(LocalDate date) {
        return date == null ? RANGE_MAX : date.plusDays(1).atStartOfDay(RESTAURANT_ZONE).toInstant();
    }

    private AdminOrderListItemDto toListItem(Order order) {
        // List now returns the same item/address shape as detail (AD-022) so
        // operational views (Kuchnia/Pickup/Delivery) render full cards from
        // a single list query. items + items.addons fetched eagerly via
        // OrderRepository.findAllFiltered @EntityGraph to avoid N+1.
        return new AdminOrderListItemDto(
                order.getId(),
                order.getVersion(),
                order.getOrderNumber(),
                order.getStatus(),
                order.getFulfillmentType(),
                order.getPaymentMethod(),
                order.getCustomerName(),
                order.getCustomerPhone(),
                order.getCustomerNotes(),
                order.getCashChangeFrom(),
                toAddressDto(order.getFulfillmentType(), order.getDeliveryAddress()),
                toItemDtos(order),
                order.getTotal(),
                order.getCreatedAt(),
                order.getEtaMinutes(),
                order.getEtaSetAt(),
                order.getItems().size()
        );
    }

    public AdminOrderDto toDto(Order order) {
        List<OrderTrackingItemDto> items = toItemDtos(order);

        List<AdminOrderStatusHistoryDto> history = order.getStatusHistory().stream()
                .map(h -> new AdminOrderStatusHistoryDto(
                        h.getStatus(), h.getChangedAt(), h.getChangedBy(), h.getReason()))
                .toList();

        return new AdminOrderDto(
                order.getId(),
                order.getVersion(),
                order.getOrderNumber(),
                order.getPublicTrackingToken().toString(),
                order.getStatus(),
                order.getEtaMinutes(),
                order.getEtaSetAt(),
                order.getFulfillmentType(),
                order.getPaymentMethod(),
                order.getCreatedAt(),
                order.getUpdatedAt(),
                order.getCustomerName(),
                order.getCustomerPhone(),
                order.getCustomerEmail(),
                order.getCustomerNotes(),
                order.getCashChangeFrom(),
                toAddressDto(order.getFulfillmentType(), order.getDeliveryAddress()),
                items,
                order.getSubtotal(),
                order.getDeliveryFee(),
                order.getDeliveryZoneName(),
                order.getTotal(),
                history
        );
    }

    private List<OrderTrackingItemDto> toItemDtos(Order order) {
        return order.getItems().stream()
                .map(item -> new OrderTrackingItemDto(
                        item.getProductNameSnapshot(),
                        item.getVariantNameSnapshot(),
                        item.getQuantity(),
                        item.getUnitPriceSnapshot(),
                        item.getLineTotal(),
                        item.getItemNote(),
                        item.getAddons().stream()
                                .map(addon -> new OrderTrackingAddonDto(
                                        addon.getAddonGroupNameSnapshot(),
                                        addon.getAddonNameSnapshot(),
                                        addon.getUnitPriceSnapshot()))
                                .toList()))
                .toList();
    }

    private OrderTrackingAddressDto toAddressDto(FulfillmentType fulfillment, Address address) {
        if (fulfillment != FulfillmentType.DELIVERY || address == null || address.isEmpty()) {
            return null;
        }
        return new OrderTrackingAddressDto(
                address.getStreet(),
                address.getBuildingNumber(),
                address.getApartmentNumber(),
                address.getPostalCode(),
                address.getCity(),
                address.getNotes()
        );
    }
}
