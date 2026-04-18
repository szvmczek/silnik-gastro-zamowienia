package com.pizzashowcase.restaurant.application;

import com.pizzashowcase.restaurant.domain.PageContent;
import com.pizzashowcase.restaurant.domain.SectionKey;
import com.pizzashowcase.restaurant.infrastructure.PageContentRepository;
import com.pizzashowcase.shared.error.ApiException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;

@Service
public class PageContentService {

    private final PageContentRepository repository;

    public PageContentService(PageContentRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public Map<SectionKey, PageContent> getAll() {
        Map<SectionKey, PageContent> result = new EnumMap<>(SectionKey.class);
        List<PageContent> all = repository.findAll();
        for (PageContent content : all) {
            result.put(content.getSectionKey(), content);
        }
        return result;
    }

    @Transactional(readOnly = true)
    public PageContent getSection(SectionKey key) {
        return repository.findBySectionKey(key)
                .orElseThrow(() -> ApiException.notFound("Page content section not found: " + key));
    }

    @Transactional
    public PageContent update(SectionKey key, PageContentUpdate update) {
        PageContent content = getSection(key);
        content.setTitle(update.title());
        content.setBody(update.body());
        content.setImageUrl(update.imageUrl());
        content.setCtaLabel(key == SectionKey.HERO ? update.ctaLabel() : null);
        content.setCtaHref(key == SectionKey.HERO ? update.ctaHref() : null);
        return content;
    }

    public record PageContentUpdate(String title, String body, String imageUrl, String ctaLabel, String ctaHref) {}
}
