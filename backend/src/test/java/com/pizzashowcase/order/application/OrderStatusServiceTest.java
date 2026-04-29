package com.pizzashowcase.order.application;

import com.pizzashowcase.order.api.dto.admin.AdminOrderDto;
import com.pizzashowcase.order.api.dto.admin.UpdateOrderStatusRequest;
import com.pizzashowcase.order.domain.FulfillmentType;
import com.pizzashowcase.order.domain.Order;
import com.pizzashowcase.order.domain.OrderStatus;
import com.pizzashowcase.order.domain.OrderStatusHistory;
import com.pizzashowcase.order.infrastructure.OrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.context.ApplicationEventPublisher;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class OrderStatusServiceTest {

    private OrderRepository orderRepository;
    private AdminOrderQueryService queryService;
    private ApplicationEventPublisher eventPublisher;
    private OrderStatusService service;
    private Order order;

    @BeforeEach
    void setUp() {
        orderRepository = mock(OrderRepository.class);
        queryService = mock(AdminOrderQueryService.class);
        eventPublisher = mock(ApplicationEventPublisher.class);
        service = new OrderStatusService(orderRepository, queryService, eventPublisher);

        order = mock(Order.class);
        when(order.getId()).thenReturn(7L);
        when(order.getOrderNumber()).thenReturn("2026-00007");
        when(order.getVersion()).thenReturn(1L);
        when(order.getStatus()).thenReturn(OrderStatus.IN_PREPARATION);
        when(order.getFulfillmentType()).thenReturn(FulfillmentType.DELIVERY);

        when(orderRepository.findWithDetailsById(7L)).thenReturn(Optional.of(order));
        when(orderRepository.saveAndFlush(any(Order.class))).thenReturn(order);
        when(queryService.toDto(any(Order.class))).thenReturn(mock(AdminOrderDto.class));
    }

    @Test
    void changeStatus_withReason_savesReasonOnHistoryEntry() {
        UpdateOrderStatusRequest request =
                new UpdateOrderStatusRequest(1L, OrderStatus.READY, "Spóźnione, klient zrezygnował");

        service.changeStatus(7L, request);

        ArgumentCaptor<OrderStatusHistory> captor = ArgumentCaptor.forClass(OrderStatusHistory.class);
        verify(order).addStatusHistory(captor.capture());
        assertThat(captor.getValue().getReason()).isEqualTo("Spóźnione, klient zrezygnował");
        assertThat(captor.getValue().getStatus()).isEqualTo(OrderStatus.READY);
    }

    @Test
    void changeStatus_withoutReason_leavesReasonNull() {
        UpdateOrderStatusRequest request = new UpdateOrderStatusRequest(1L, OrderStatus.READY, null);

        service.changeStatus(7L, request);

        ArgumentCaptor<OrderStatusHistory> captor = ArgumentCaptor.forClass(OrderStatusHistory.class);
        verify(order).addStatusHistory(captor.capture());
        assertThat(captor.getValue().getReason()).isNull();
    }

    @Test
    void changeStatus_blankReason_normalizedToNull() {
        UpdateOrderStatusRequest request = new UpdateOrderStatusRequest(1L, OrderStatus.READY, "   ");

        service.changeStatus(7L, request);

        ArgumentCaptor<OrderStatusHistory> captor = ArgumentCaptor.forClass(OrderStatusHistory.class);
        verify(order).addStatusHistory(captor.capture());
        assertThat(captor.getValue().getReason()).isNull();
    }

    @Test
    void changeStatus_newToInPreparation_isAllowedAndAppendsHistory() {
        // AD-023: kitchen single-tap "Przyjmij" jumps NEW -> IN_PREPARATION
        // skipping CONFIRMED. State machine accepts it; history gets one entry.
        when(order.getStatus()).thenReturn(OrderStatus.NEW);
        UpdateOrderStatusRequest request =
                new UpdateOrderStatusRequest(1L, OrderStatus.IN_PREPARATION, null);

        service.changeStatus(7L, request);

        ArgumentCaptor<OrderStatusHistory> captor = ArgumentCaptor.forClass(OrderStatusHistory.class);
        verify(order).addStatusHistory(captor.capture());
        assertThat(captor.getValue().getStatus()).isEqualTo(OrderStatus.IN_PREPARATION);
        verify(order).setStatus(OrderStatus.IN_PREPARATION);
    }
}
