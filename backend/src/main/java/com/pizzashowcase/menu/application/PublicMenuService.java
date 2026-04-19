package com.pizzashowcase.menu.application;

import com.pizzashowcase.menu.api.dto.MenuDto;
import com.pizzashowcase.menu.api.dto.ProductDto;
import com.pizzashowcase.menu.domain.Category;
import com.pizzashowcase.menu.domain.Product;
import com.pizzashowcase.menu.domain.ProductAddonGroup;
import com.pizzashowcase.menu.infrastructure.CategoryRepository;
import com.pizzashowcase.menu.infrastructure.ProductAddonGroupRepository;
import com.pizzashowcase.shared.error.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class PublicMenuService {

    private final CategoryRepository categoryRepository;
    private final ProductAddonGroupRepository productAddonGroupRepository;

    public PublicMenuService(CategoryRepository categoryRepository,
                             ProductAddonGroupRepository productAddonGroupRepository) {
        this.categoryRepository = categoryRepository;
        this.productAddonGroupRepository = productAddonGroupRepository;
    }

    public MenuDto getMenu() {
        List<Category> categories = categoryRepository.findActiveMenuWithVariants();
        Set<Long> productIds = categories.stream()
                .flatMap(c -> c.getProducts().stream())
                .map(Product::getId)
                .collect(Collectors.toSet());
        Map<Long, List<ProductAddonGroup>> addonsByProduct = productIds.isEmpty()
                ? Map.of()
                : MenuAssembler.groupByProductId(productAddonGroupRepository.findAllByProductIdsWithAddons(productIds));
        return new MenuDto(MenuAssembler.toCategoryDtos(categories, addonsByProduct));
    }

    public ProductDto getProductBySlug(String slug) {
        Category category = categoryRepository.findCategoryWithProductBySlug(slug)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Produkt nie istnieje."));
        Product product = category.getProducts().stream()
                .filter(p -> slug.equals(p.getSlug()))
                .findFirst()
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Produkt nie istnieje."));
        List<ProductAddonGroup> links = productAddonGroupRepository.findAllByProductIdsWithAddons(List.of(product.getId()));
        return MenuAssembler.toProductDto(product, links);
    }
}
