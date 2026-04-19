package com.pizzashowcase.menu.api;

import com.pizzashowcase.menu.api.dto.AdminProductDto;
import com.pizzashowcase.menu.api.dto.CreateProductRequest;
import com.pizzashowcase.menu.api.dto.UpdateAvailabilityRequest;
import com.pizzashowcase.menu.api.dto.UpdateProductRequest;
import com.pizzashowcase.menu.application.AdminProductService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/admin/products")
@PreAuthorize("hasRole('ADMIN')")
public class AdminProductController {

    private final AdminProductService service;

    public AdminProductController(AdminProductService service) {
        this.service = service;
    }

    @GetMapping
    public List<AdminProductDto> list(@RequestParam(required = false) Long categoryId,
                                      @RequestParam(required = false) Boolean available) {
        return service.list(categoryId, available);
    }

    @GetMapping("/{id}")
    public AdminProductDto get(@PathVariable Long id) {
        return service.get(id);
    }

    @PostMapping
    public ResponseEntity<AdminProductDto> create(@Valid @RequestBody CreateProductRequest request) {
        AdminProductDto created = service.create(request);
        return ResponseEntity
                .created(URI.create("/api/admin/products/" + created.id()))
                .body(created);
    }

    @PutMapping("/{id}")
    public AdminProductDto update(@PathVariable Long id,
                                  @Valid @RequestBody UpdateProductRequest request) {
        return service.update(id, request);
    }

    @PatchMapping("/{id}/availability")
    public AdminProductDto updateAvailability(@PathVariable Long id,
                                              @Valid @RequestBody UpdateAvailabilityRequest request) {
        return service.updateAvailability(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
