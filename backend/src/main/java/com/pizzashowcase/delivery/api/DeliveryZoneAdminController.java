package com.pizzashowcase.delivery.api;

import com.pizzashowcase.delivery.api.dto.CreateAreaRequest;
import com.pizzashowcase.delivery.api.dto.CreateDeliveryZoneRequest;
import com.pizzashowcase.delivery.api.dto.DeliveryZoneAreaDto;
import com.pizzashowcase.delivery.api.dto.DeliveryZoneDto;
import com.pizzashowcase.delivery.api.dto.UpdateDeliveryZoneRequest;
import com.pizzashowcase.delivery.application.DeliveryZoneAdminService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/admin/delivery-zones")
public class DeliveryZoneAdminController {

    private final DeliveryZoneAdminService service;

    public DeliveryZoneAdminController(DeliveryZoneAdminService service) {
        this.service = service;
    }

    @GetMapping
    public List<DeliveryZoneDto> list() {
        return service.list();
    }

    @PostMapping
    public ResponseEntity<DeliveryZoneDto> create(@Valid @RequestBody CreateDeliveryZoneRequest request) {
        DeliveryZoneDto created = service.create(request);
        return ResponseEntity.created(URI.create("/api/admin/delivery-zones/" + created.id())).body(created);
    }

    @PatchMapping("/{id}")
    public DeliveryZoneDto update(@PathVariable Long id,
                                  @Valid @RequestBody UpdateDeliveryZoneRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @PostMapping("/{id}/areas")
    public ResponseEntity<DeliveryZoneAreaDto> addArea(@PathVariable Long id,
                                                       @Valid @RequestBody CreateAreaRequest request) {
        DeliveryZoneAreaDto created = service.addArea(id, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @DeleteMapping("/{id}/areas/{areaId}")
    public ResponseEntity<Void> deleteArea(@PathVariable Long id, @PathVariable Long areaId) {
        service.deleteArea(id, areaId);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
