package com.pizzashowcase.order.api;

import com.pizzashowcase.order.api.dto.admin.AdminOrderDto;
import com.pizzashowcase.order.api.dto.admin.AdminOrderListItemDto;
import com.pizzashowcase.order.api.dto.admin.AdminOrderStatusCountsDto;
import com.pizzashowcase.order.api.dto.admin.UpdateOrderEtaRequest;
import com.pizzashowcase.order.api.dto.admin.UpdateOrderStatusRequest;
import com.pizzashowcase.order.application.AdminOrderQueryService;
import com.pizzashowcase.order.application.OrderStatusService;
import com.pizzashowcase.order.domain.FulfillmentType;
import com.pizzashowcase.order.domain.OrderStatus;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/admin/orders")
@PreAuthorize("hasRole('ADMIN')")
public class AdminOrderController {

    private final AdminOrderQueryService queryService;
    private final OrderStatusService statusService;

    public AdminOrderController(AdminOrderQueryService queryService,
                                OrderStatusService statusService) {
        this.queryService = queryService;
        this.statusService = statusService;
    }

    @GetMapping
    public Page<AdminOrderListItemDto> list(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) FulfillmentType fulfillmentType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return queryService.list(status, fulfillmentType, dateFrom, dateTo, pageable);
    }

    @GetMapping("/counts")
    public AdminOrderStatusCountsDto counts(
            @RequestParam(required = false) FulfillmentType fulfillmentType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo) {
        return queryService.statusCounts(fulfillmentType, dateFrom, dateTo);
    }

    @GetMapping("/{id}")
    public AdminOrderDto get(@PathVariable Long id) {
        return queryService.getById(id);
    }

    @PatchMapping("/{id}/status")
    public AdminOrderDto changeStatus(@PathVariable Long id,
                                      @Valid @RequestBody UpdateOrderStatusRequest request) {
        return statusService.changeStatus(id, request);
    }

    @PatchMapping("/{id}/eta")
    public AdminOrderDto updateEta(@PathVariable Long id,
                                   @Valid @RequestBody UpdateOrderEtaRequest request) {
        return statusService.updateEta(id, request);
    }
}
