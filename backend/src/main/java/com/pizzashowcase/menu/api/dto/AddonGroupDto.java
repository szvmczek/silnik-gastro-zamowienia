package com.pizzashowcase.menu.api.dto;

import java.util.List;

public record AddonGroupDto(
        Long id,
        String name,
        int minSelect,
        int maxSelect,
        boolean required,
        int displayOrder,
        List<AddonDto> addons
) {
}
