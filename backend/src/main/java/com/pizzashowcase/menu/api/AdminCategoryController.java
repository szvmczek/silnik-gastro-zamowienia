package com.pizzashowcase.menu.api;

import com.pizzashowcase.menu.api.dto.AdminCategoryDto;
import com.pizzashowcase.menu.api.dto.CreateCategoryRequest;
import com.pizzashowcase.menu.api.dto.UpdateCategoryRequest;
import com.pizzashowcase.menu.application.AdminCategoryService;
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
@RequestMapping("/api/admin/categories")
@PreAuthorize("hasRole('ADMIN')")
public class AdminCategoryController {

    private final AdminCategoryService service;

    public AdminCategoryController(AdminCategoryService service) {
        this.service = service;
    }

    @GetMapping
    public List<AdminCategoryDto> list() {
        return service.list();
    }

    @GetMapping("/{id}")
    public AdminCategoryDto get(@PathVariable Long id) {
        return service.get(id);
    }

    @PostMapping
    public ResponseEntity<AdminCategoryDto> create(@Valid @RequestBody CreateCategoryRequest request) {
        AdminCategoryDto created = service.create(request);
        return ResponseEntity
                .created(URI.create("/api/admin/categories/" + created.id()))
                .body(created);
    }

    @PutMapping("/{id}")
    public AdminCategoryDto update(@PathVariable Long id,
                                   @Valid @RequestBody UpdateCategoryRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
