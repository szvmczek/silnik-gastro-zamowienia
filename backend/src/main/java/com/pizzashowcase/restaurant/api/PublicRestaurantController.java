package com.pizzashowcase.restaurant.api;

import com.pizzashowcase.restaurant.api.dto.OpeningHoursDto;
import com.pizzashowcase.restaurant.api.dto.PageContentDto;
import com.pizzashowcase.restaurant.api.dto.SettingsDto;
import com.pizzashowcase.restaurant.application.OpeningHoursService;
import com.pizzashowcase.restaurant.application.PageContentService;
import com.pizzashowcase.restaurant.application.RestaurantSettingsService;
import com.pizzashowcase.restaurant.domain.SectionKey;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/public")
public class PublicRestaurantController {

    private final RestaurantSettingsService settingsService;
    private final OpeningHoursService openingHoursService;
    private final PageContentService pageContentService;

    public PublicRestaurantController(RestaurantSettingsService settingsService,
                                      OpeningHoursService openingHoursService,
                                      PageContentService pageContentService) {
        this.settingsService = settingsService;
        this.openingHoursService = openingHoursService;
        this.pageContentService = pageContentService;
    }

    @GetMapping("/settings")
    public SettingsDto settings() {
        return SettingsDto.from(settingsService.getSettings());
    }

    @GetMapping("/opening-hours")
    public List<OpeningHoursDto> openingHours() {
        return openingHoursService.getAllOrdered().stream()
                .map(OpeningHoursDto::from)
                .toList();
    }

    @GetMapping("/page-content")
    public Map<SectionKey, PageContentDto> pageContent() {
        Map<SectionKey, PageContentDto> result = new EnumMap<>(SectionKey.class);
        pageContentService.getAll().forEach((key, content) -> result.put(key, PageContentDto.from(content)));
        return result;
    }
}
