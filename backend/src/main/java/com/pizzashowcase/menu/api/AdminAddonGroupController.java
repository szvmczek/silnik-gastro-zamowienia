package com.pizzashowcase.menu.api;

import com.pizzashowcase.menu.api.dto.AdminAddonDto;
import com.pizzashowcase.menu.api.dto.AdminAddonGroupDto;
import com.pizzashowcase.menu.api.dto.CreateAddonGroupRequest;
import com.pizzashowcase.menu.api.dto.CreateAddonRequest;
import com.pizzashowcase.menu.api.dto.UpdateAddonGroupRequest;
import com.pizzashowcase.menu.application.AdminAddonGroupService;
import com.pizzashowcase.menu.application.AdminAddonService;
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
@RequestMapping("/api/admin/addon-groups")
@PreAuthorize("hasRole('ADMIN')")
public class AdminAddonGroupController {

    private final AdminAddonGroupService groupService;
    private final AdminAddonService addonService;

    public AdminAddonGroupController(AdminAddonGroupService groupService,
                                     AdminAddonService addonService) {
        this.groupService = groupService;
        this.addonService = addonService;
    }

    @GetMapping
    public List<AdminAddonGroupDto> list() {
        return groupService.list();
    }

    @GetMapping("/{id}")
    public AdminAddonGroupDto get(@PathVariable Long id) {
        return groupService.get(id);
    }

    @PostMapping
    public ResponseEntity<AdminAddonGroupDto> create(@Valid @RequestBody CreateAddonGroupRequest request) {
        AdminAddonGroupDto created = groupService.create(request);
        return ResponseEntity
                .created(URI.create("/api/admin/addon-groups/" + created.id()))
                .body(created);
    }

    @PutMapping("/{id}")
    public AdminAddonGroupDto update(@PathVariable Long id,
                                     @Valid @RequestBody UpdateAddonGroupRequest request) {
        return groupService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        groupService.delete(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @PostMapping("/{groupId}/addons")
    public ResponseEntity<AdminAddonDto> createAddon(@PathVariable Long groupId,
                                                     @Valid @RequestBody CreateAddonRequest request) {
        AdminAddonDto created = addonService.create(groupId, request);
        return ResponseEntity
                .created(URI.create("/api/admin/addons/" + created.id()))
                .body(created);
    }
}
