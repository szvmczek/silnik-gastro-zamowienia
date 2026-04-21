package com.pizzashowcase.order.application;

import com.pizzashowcase.order.api.dto.OrderTrackingAddonDto;
import com.pizzashowcase.order.api.dto.OrderTrackingAddressDto;
import com.pizzashowcase.order.api.dto.OrderTrackingItemDto;
import com.pizzashowcase.order.api.dto.admin.AdminDashboardSummaryDto;
import com.pizzashowcase.order.api.dto.admin.AdminOrderDto;
import com.pizzashowcase.order.api.dto.admin.AdminOrderListItemDto;
import com.pizzashowcase.order.api.dto.admin.AdminOrderStatusHistoryDto;
import com.pizzashowcase.order.domain.Address;
import com.pizzashowcase.order.domain.FulfillmentType;
import com.pizzashowcase.order.domain.Order;
import com.pizzashowcase.order.domain.OrderStatus;
import com.pizzashowcase.order.infrastructure.OrderRepository;
import com.pizzashowcase.shared.error.ApiException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class AdminOrderQueryService {

    private static final ZoneId RESTAURANT_ZONE = ZoneId.of("Europe/Warsaw");
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

    private Instant toInstantStart(LocalDate date) {
        return date == null ? null : date.atStartOfDay(RESTAURANT_ZONE).toInstant();
    }

    private Instant toInstantEndExclusive(LocalDate date) {
        return date == null ? null : date.plusDays(1).atStartOfDay(RESTAURANT_ZONE).toInstant();
    }

    private AdminOrderListItemDto toListItem(Order order) {
        return new AdminOrderListItemDto(
                order.getId(),
                order.getVersion(),
                order.getOrderNumber(),
                order.getStatus(),
                order.getFulfillmentType(),
                order.getPaymentMethod(),
                order.getCustomerName(),
                order.getCustomerPhone(),
                order.getTotal(),
                order.getCreatedAt(),
                order.getEtaMinutes(),
                order.getItems().size()
        );
    }

    public AdminOrderDto toDto(Order order) {
        List<OrderTrackingItemDto> items = order.getItems().stream()
                .map(item -> new OrderTrackingItemDto(
                        item.getProductNameSnapshot(),
                        item.getVariantNameSnapshot(),
                        item.getQuantity(),
                        item.getUnitPriceSnapshot(),
                        item.getLineTotal(),
                        item.getAddons().stream()
                                .map(addon -> new OrderTrackingAddonDto(
                                        addon.getAddonGroupNameSnapshot(),
                                        addon.getAddonNameSnapshot(),
                                        addon.getUnitPriceSnapshot()))
                                .toList()))
                .toList();

        List<AdminOrderStatusHistoryDto> history = order.getStatusHistory().stream()
                .map(h -> new AdminOrderStatusHistoryDto(
                        h.getStatus(), h.getChangedAt(), h.getChangedBy()))
                .toList();

        return new AdminOrderDto(
                order.getId(),
                order.getVersion(),
                order.getOrderNumber(),
                order.getStatus(),
                order.getEtaMinutes(),
                order.getFulfillmentType(),
                order.getPaymentMethod(),
                order.getCreatedAt(),
                order.getUpdatedAt(),
                order.getCustomerName(),
                order.getCustomerPhone(),
                order.getCustomerEmail(),
                order.getCustomerNotes(),
                toAddressDto(order.getFulfillmentType(), order.getDeliveryAddress()),
                items,
                order.getSubtotal(),
                order.getTotal(),
                history
        );
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
