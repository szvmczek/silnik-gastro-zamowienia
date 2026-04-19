package com.pizzashowcase.menu.api;

import com.pizzashowcase.menu.api.dto.AdminVariantDto;
import com.pizzashowcase.menu.api.dto.CreateVariantRequest;
import com.pizzashowcase.menu.api.dto.UpdateVariantRequest;
import com.pizzashowcase.menu.application.AdminVariantService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminVariantController {

    private final AdminVariantService service;

    public AdminVariantController(AdminVariantService service) {
        this.service = service;
    }

    @GetMapping("/products/{productId}/variants")
    public List<AdminVariantDto> list(@PathVariable Long productId) {
        return service.listForProduct(productId);
    }

    @PostMapping("/products/{productId}/variants")
    public ResponseEntity<AdminVariantDto> create(@PathVariable Long productId,
                                                  @Valid @RequestBody CreateVariantRequest request) {
        AdminVariantDto created = service.create(productId, request);
        return ResponseEntity
                .created(URI.create("/api/admin/variants/" + created.id()))
                .body(created);
    }

    @PutMapping("/variants/{id}")
    public AdminVariantDto update(@PathVariable Long id,
                                  @Valid @RequestBody UpdateVariantRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/variants/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
