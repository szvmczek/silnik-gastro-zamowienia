package com.pizzashowcase.order.application;

import com.pizzashowcase.order.api.dto.admin.AdminOrderDto;
import com.pizzashowcase.order.api.dto.admin.UpdateOrderEtaRequest;
import com.pizzashowcase.order.api.dto.admin.UpdateOrderStatusRequest;
import com.pizzashowcase.order.domain.Order;
import com.pizzashowcase.order.domain.OrderStatus;
import com.pizzashowcase.order.domain.OrderStatusHistory;
import com.pizzashowcase.order.infrastructure.OrderRepository;
import com.pizzashowcase.shared.error.ApiException;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@Transactional
public class OrderStatusService {

    private final OrderRepository orderRepository;
    private final AdminOrderQueryService adminOrderQueryService;

    public OrderStatusService(OrderRepository orderRepository,
                              AdminOrderQueryService adminOrderQueryService) {
        this.orderRepository = orderRepository;
        this.adminOrderQueryService = adminOrderQueryService;
    }

    public AdminOrderDto changeStatus(Long id, UpdateOrderStatusRequest request) {
        Order order = loadOrThrow(id);
        assertVersion(order, request.version());

        OrderStatus current = order.getStatus();
        OrderStatus next = request.status();
        if (!current.canTransitionTo(next, order.getFulfillmentType())) {
            throw ApiException.unprocessable(
                    "Nielegalna zmiana statusu: " + current + " -> " + next
                            + " (fulfillment: " + order.getFulfillmentType() + ").");
        }

        order.setStatus(next);
        order.addStatusHistory(new OrderStatusHistory(next, Instant.now(), currentAdminIdentity()));
        // Force flush so @Version bumps before we read it into the DTO.
        // Without this, the client sees stale version=N and the next PATCH 409s.
        Order saved = orderRepository.saveAndFlush(order);
        return adminOrderQueryService.toDto(saved);
    }

    public AdminOrderDto updateEta(Long id, UpdateOrderEtaRequest request) {
        Order order = loadOrThrow(id);
        assertVersion(order, request.version());
        order.setEtaMinutes(request.minutesFromNow());
        Order saved = orderRepository.saveAndFlush(order);
        return adminOrderQueryService.toDto(saved);
    }

    private Order loadOrThrow(Long id) {
        return orderRepository.findWithDetailsById(id)
                .orElseThrow(() -> ApiException.notFound("Nie znaleziono zamówienia o id " + id));
    }

    private static void assertVersion(Order order, Long expectedVersion) {
        if (!expectedVersion.equals(order.getVersion())) {
            throw new OptimisticLockingFailureException("Order " + order.getId() + " version mismatch");
        }
    }

    private static String currentAdminIdentity() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null ? auth.getName() : null;
    }
}
