package com.pizzashowcase.menu.api.dto;

import jakarta.validation.constraints.NotNull;

public record AttachAddonGroupRequest(
        @NotNull Long addonGroupId,
        int displayOrder
) {
}
