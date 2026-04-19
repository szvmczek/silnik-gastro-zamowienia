package com.pizzashowcase.menu.api;

import com.pizzashowcase.menu.api.dto.MenuDto;
import com.pizzashowcase.menu.api.dto.ProductDto;
import com.pizzashowcase.menu.application.PublicMenuService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public")
public class PublicMenuController {

    private final PublicMenuService publicMenuService;

    public PublicMenuController(PublicMenuService publicMenuService) {
        this.publicMenuService = publicMenuService;
    }

    @GetMapping("/menu")
    public MenuDto getMenu() {
        return publicMenuService.getMenu();
    }

    @GetMapping("/products/{slug}")
    public ProductDto getProductBySlug(@PathVariable String slug) {
        return publicMenuService.getProductBySlug(slug);
    }
}
