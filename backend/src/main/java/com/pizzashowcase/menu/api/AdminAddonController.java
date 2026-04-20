package com.pizzashowcase.menu.api;

import com.pizzashowcase.menu.api.dto.AdminAddonDto;
import com.pizzashowcase.menu.api.dto.UpdateAddonRequest;
import com.pizzashowcase.menu.application.AdminAddonService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/addons")
@PreAuthorize("hasRole('ADMIN')")
public class AdminAddonController {

    private final AdminAddonService service;

    public AdminAddonController(AdminAddonService service) {
        this.service = service;
    }

    @PutMapping("/{id}")
    public AdminAddonDto update(@PathVariable Long id,
                                @Valid @RequestBody UpdateAddonRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
