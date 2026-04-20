package com.pizzashowcase.menu.application;

import com.pizzashowcase.menu.api.dto.AdminAddonDto;
import com.pizzashowcase.menu.api.dto.CreateAddonRequest;
import com.pizzashowcase.menu.api.dto.UpdateAddonRequest;
import com.pizzashowcase.menu.domain.Addon;
import com.pizzashowcase.menu.domain.AddonGroup;
import com.pizzashowcase.menu.infrastructure.AddonRepository;
import com.pizzashowcase.shared.error.ApiException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AdminAddonService {

    private final AdminAddonGroupService groupService;
    private final AddonRepository addonRepository;

    public AdminAddonService(AdminAddonGroupService groupService,
                             AddonRepository addonRepository) {
        this.groupService = groupService;
        this.addonRepository = addonRepository;
    }

    public AdminAddonDto create(Long groupId, CreateAddonRequest request) {
        AddonGroup group = groupService.loadOrThrow(groupId);
        String name = request.name().trim();
        if (addonRepository.existsByAddonGroupIdAndNameIgnoreCase(groupId, name)) {
            throw ApiException.conflict("Dodatek o nazwie \"" + name + "\" już istnieje w tej grupie.");
        }
        Addon addon = new Addon(group, name, request.price(), request.displayOrder());
        group.addAddon(addon);
        Addon saved = addonRepository.save(addon);
        return AdminAddonGroupService.toAddonDto(saved);
    }

    public AdminAddonDto update(Long id, UpdateAddonRequest request) {
        Addon addon = loadOrThrow(id);
        String name = request.name().trim();
        Long groupId = addon.getAddonGroup().getId();
        if (!addon.getName().equalsIgnoreCase(name)
                && addonRepository.existsByAddonGroupIdAndNameIgnoreCase(groupId, name)) {
            throw ApiException.conflict("Dodatek o nazwie \"" + name + "\" już istnieje w tej grupie.");
        }
        addon.setName(name);
        addon.setPrice(request.price());
        addon.setDisplayOrder(request.displayOrder());
        return AdminAddonGroupService.toAddonDto(addon);
    }

    public void delete(Long id) {
        Addon addon = loadOrThrow(id);
        addon.getAddonGroup().removeAddon(addon);
    }

    private Addon loadOrThrow(Long id) {
        return addonRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Dodatek nie istnieje."));
    }
}
