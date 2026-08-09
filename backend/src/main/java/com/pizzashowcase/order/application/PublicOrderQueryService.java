package com.pizzashowcase.order.application;

import com.pizzashowcase.order.api.dto.OrderTrackingAddonDto;
import com.pizzashowcase.order.api.dto.OrderTrackingAddressDto;
import com.pizzashowcase.order.api.dto.OrderTrackingDto;
import com.pizzashowcase.order.api.dto.OrderTrackingItemDto;
import com.pizzashowcase.order.domain.Address;
import com.pizzashowcase.order.domain.FulfillmentType;
import com.pizzashowcase.order.domain.Order;
import com.pizzashowcase.order.infrastructure.OrderRepository;
import com.pizzashowcase.shared.error.ApiException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class PublicOrderQueryService {

    private final OrderRepository orderRepository;

    public PublicOrderQueryService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    public OrderTrackingDto findByToken(UUID token) {
        Order order = orderRepository.findByPublicTrackingToken(token)
                .orElseThrow(() -> ApiException.notFound("Nie znaleziono zamówienia dla podanego linku."));

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

        return new OrderTrackingDto(
                order.getOrderNumber(),
                order.getStatus(),
                order.getEtaMinutes(),
                order.getEtaSetAt(),
                order.getFulfillmentType(),
                order.getPaymentMethod(),
                order.getCreatedAt(),
                toAddressDto(order.getFulfillmentType(), order.getDeliveryAddress()),
                items,
                order.getSubtotal(),
                order.getDeliveryFee(),
                order.getDeliveryZoneName(),
                order.getTotal(),
                order.getCashChangeFrom()
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
