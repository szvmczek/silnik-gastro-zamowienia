package com.pizzashowcase.menu.api.dto;

public record ProductAddonGroupLinkDto(
        Long id,
        Long productId,
        Long addonGroupId,
        String addonGroupName,
        int displayOrder
) {
}
