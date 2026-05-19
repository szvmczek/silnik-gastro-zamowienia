package com.pizzashowcase.restaurant.api.dto;

import com.pizzashowcase.restaurant.domain.PageContent;
import com.pizzashowcase.restaurant.domain.SectionKey;

public record PageContentDto(
        SectionKey sectionKey,
        String title,
        String body,
        String imageUrl,
        String ctaLabel,
        String ctaHref,
        boolean active
) {
    public static PageContentDto from(PageContent p) {
        return new PageContentDto(
                p.getSectionKey(),
                p.getTitle(),
                p.getBody(),
                p.getImageUrl(),
                p.getCtaLabel(),
                p.getCtaHref(),
                p.isActive()
        );
    }
}
