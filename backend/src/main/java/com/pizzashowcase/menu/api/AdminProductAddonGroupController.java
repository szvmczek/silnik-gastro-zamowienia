package com.pizzashowcase.menu.api;

import com.pizzashowcase.menu.api.dto.AttachAddonGroupRequest;
import com.pizzashowcase.menu.api.dto.ProductAddonGroupLinkDto;
import com.pizzashowcase.menu.application.AdminProductAddonGroupService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/products/{productId}/addon-groups")
@PreAuthorize("hasRole('ADMIN')")
public class AdminProductAddonGroupController {

    private final AdminProductAddonGroupService service;

    public AdminProductAddonGroupController(AdminProductAddonGroupService service) {
        this.service = service;
    }

    @GetMapping
    public List<ProductAddonGroupLinkDto> list(@PathVariable Long productId) {
        return service.listForProduct(productId);
    }

    @PostMapping
    public ResponseEntity<ProductAddonGroupLinkDto> attach(@PathVariable Long productId,
                                                           @Valid @RequestBody AttachAddonGroupRequest request) {
        ProductAddonGroupLinkDto created = service.attach(productId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @DeleteMapping("/{addonGroupId}")
    public ResponseEntity<Void> detach(@PathVariable Long productId,
                                       @PathVariable Long addonGroupId) {
        service.detach(productId, addonGroupId);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
