package com.pizzashowcase.menu.api.dto;

import java.util.List;

public record AdminAddonGroupDto(
        Long id,
        String name,
        int minSelect,
        int maxSelect,
        boolean required,
        long usedByProducts,
        List<AdminAddonDto> addons
) {
}
