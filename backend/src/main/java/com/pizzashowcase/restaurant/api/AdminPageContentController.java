package com.pizzashowcase.restaurant.api;

import com.pizzashowcase.restaurant.api.dto.PageContentDto;
import com.pizzashowcase.restaurant.api.dto.UpdatePageContentRequest;
import com.pizzashowcase.restaurant.application.PageContentService;
import com.pizzashowcase.restaurant.application.PageContentService.PageContentUpdate;
import com.pizzashowcase.restaurant.domain.SectionKey;
import com.pizzashowcase.shared.error.ApiException;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/page-content")
public class AdminPageContentController {

    private final PageContentService service;

    public AdminPageContentController(PageContentService service) {
        this.service = service;
    }

    @GetMapping("/{section}")
    public PageContentDto get(@PathVariable String section) {
        return PageContentDto.from(service.getSection(parse(section)));
    }

    @PutMapping("/{section}")
    public PageContentDto update(@PathVariable String section, @Valid @RequestBody UpdatePageContentRequest request) {
        SectionKey key = parse(section);
        PageContentUpdate update = new PageContentUpdate(
                request.title(), request.body(), request.imageUrl(), request.ctaLabel(), request.ctaHref());
        return PageContentDto.from(service.update(key, update));
    }

    private SectionKey parse(String section) {
        try {
            return SectionKey.valueOf(section.toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw ApiException.notFound("Unknown section: " + section);
        }
    }
}
