package com.pizzashowcase.order.api;

import com.pizzashowcase.order.api.dto.admin.AdminOrderDto;
import com.pizzashowcase.order.api.dto.admin.AdminOrderListItemDto;
import com.pizzashowcase.order.api.dto.admin.AdminOrderStatusCountsDto;
import com.pizzashowcase.order.api.dto.admin.EditOrderRequest;
import com.pizzashowcase.order.api.dto.admin.OrderEditPreviewDto;
import com.pizzashowcase.order.api.dto.admin.UndoOrderEditRequest;
import com.pizzashowcase.order.api.dto.admin.UpdateOrderEtaRequest;
import com.pizzashowcase.order.api.dto.admin.UpdateOrderStatusRequest;
import com.pizzashowcase.order.application.AdminOrderQueryService;
import com.pizzashowcase.order.application.OrderEditService;
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
import org.springframework.web.bind.annotation.PostMapping;
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
    private final OrderEditService editService;

    public AdminOrderController(AdminOrderQueryService queryService,
                                OrderStatusService statusService,
                                OrderEditService editService) {
        this.queryService = queryService;
        this.statusService = statusService;
        this.editService = editService;
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

    // Edycja treści zamówienia (klient dzwoni i chce coś zmienić).
    // Podgląd liczy nową sumę bez zapisu, żeby admin widział cenę na żywo
    // w trakcie rozmowy — zero niespodzianek po zapisaniu.
    @PostMapping("/{id}/edit/preview")
    public OrderEditPreviewDto previewEdit(@PathVariable Long id,
                                           @Valid @RequestBody EditOrderRequest request) {
        return editService.preview(id, request);
    }

    @PatchMapping("/{id}/items")
    public AdminOrderDto editItems(@PathVariable Long id,
                                   @Valid @RequestBody EditOrderRequest request) {
        return editService.edit(id, request);
    }

    @PostMapping("/{id}/edits/undo")
    public AdminOrderDto undoLastEdit(@PathVariable Long id,
                                      @Valid @RequestBody UndoOrderEditRequest request) {
        return editService.undoLast(id, request.version());
    }

    @PatchMapping("/{id}/eta")
    public AdminOrderDto updateEta(@PathVariable Long id,
                                   @Valid @RequestBody UpdateOrderEtaRequest request) {
        return statusService.updateEta(id, request);
    }
}
