package com.pizzashowcase.menu.application;

import com.pizzashowcase.menu.api.dto.AdminAddonDto;
import com.pizzashowcase.menu.api.dto.AdminAddonGroupDto;
import com.pizzashowcase.menu.api.dto.CreateAddonGroupRequest;
import com.pizzashowcase.menu.api.dto.UpdateAddonGroupRequest;
import com.pizzashowcase.menu.domain.Addon;
import com.pizzashowcase.menu.domain.AddonGroup;
import com.pizzashowcase.menu.infrastructure.AddonGroupRepository;
import com.pizzashowcase.menu.infrastructure.ProductAddonGroupRepository;
import com.pizzashowcase.shared.error.ApiException;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class AdminAddonGroupService {

    private final AddonGroupRepository groupRepository;
    private final ProductAddonGroupRepository productAddonGroupRepository;

    public AdminAddonGroupService(AddonGroupRepository groupRepository,
                                  ProductAddonGroupRepository productAddonGroupRepository) {
        this.groupRepository = groupRepository;
        this.productAddonGroupRepository = productAddonGroupRepository;
    }

    @Transactional(readOnly = true)
    public List<AdminAddonGroupDto> list() {
        return groupRepository.findAllByOrderByNameAsc().stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public AdminAddonGroupDto get(Long id) {
        return toDto(loadOrThrow(id));
    }

    public AdminAddonGroupDto create(CreateAddonGroupRequest request) {
        validateSelectRange(request.minSelect(), request.maxSelect());
        boolean required = Boolean.TRUE.equals(request.required());
        if (required && request.minSelect() < 1) {
            throw ApiException.badRequest("Grupa wymagana musi mieć minSelect >= 1.");
        }
        AddonGroup group = new AddonGroup(
                request.name().trim(),
                request.minSelect(),
                request.maxSelect(),
                required
        );
        AddonGroup saved = groupRepository.save(group);
        return toDto(saved);
    }

    public AdminAddonGroupDto update(Long id, UpdateAddonGroupRequest request) {
        AddonGroup group = loadOrThrow(id);
        if (!request.version().equals(group.getVersion())) {
            throw new OptimisticLockingFailureException("AddonGroup " + id + " version mismatch");
        }
        validateSelectRange(request.minSelect(), request.maxSelect());
        boolean required = Boolean.TRUE.equals(request.required());
        if (required && request.minSelect() < 1) {
            throw ApiException.badRequest("Grupa wymagana musi mieć minSelect >= 1.");
        }
        group.setName(request.name().trim());
        group.setMinSelect(request.minSelect());
        group.setMaxSelect(request.maxSelect());
        group.setRequired(required);
        return toDto(group);
    }

    public void delete(Long id) {
        AddonGroup group = loadOrThrow(id);
        long usedBy = productAddonGroupRepository.countByAddonGroupId(id);
        if (usedBy > 0) {
            throw ApiException.conflict("Grupa dodatków jest przypisana do " + usedBy + " produktów. Najpierw odłącz ją od produktów.");
        }
        groupRepository.delete(group);
    }

    AddonGroup loadOrThrow(Long id) {
        return groupRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Grupa dodatków nie istnieje."));
    }

    private static void validateSelectRange(int minSelect, int maxSelect) {
        if (maxSelect < minSelect) {
            throw ApiException.badRequest("maxSelect musi być >= minSelect.");
        }
        if (maxSelect < 1) {
            throw ApiException.badRequest("maxSelect musi być >= 1.");
        }
    }

    private AdminAddonGroupDto toDto(AddonGroup g) {
        List<AdminAddonDto> addons = g.getAddons().stream()
                .map(AdminAddonGroupService::toAddonDto)
                .toList();
        long usedBy = productAddonGroupRepository.countByAddonGroupId(g.getId());
        return new AdminAddonGroupDto(
                g.getId(),
                g.getVersion(),
                g.getName(),
                g.getMinSelect(),
                g.getMaxSelect(),
                g.isRequired(),
                usedBy,
                addons
        );
    }

    static AdminAddonDto toAddonDto(Addon a) {
        return new AdminAddonDto(
                a.getId(),
                a.getVersion(),
                a.getAddonGroup().getId(),
                a.getName(),
                a.getPrice(),
                a.getDisplayOrder()
        );
    }
}
