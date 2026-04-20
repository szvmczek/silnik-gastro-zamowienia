package com.pizzashowcase.menu.api.dto;

import java.util.List;

public record AdminAddonGroupDto(
        Long id,
        Long version,
        String name,
        int minSelect,
        int maxSelect,
        boolean required,
        long usedByProducts,
        List<AdminAddonDto> addons
) {
}
