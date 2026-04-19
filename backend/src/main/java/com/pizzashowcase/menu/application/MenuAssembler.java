package com.pizzashowcase.menu.application;

import com.pizzashowcase.menu.api.dto.AddonDto;
import com.pizzashowcase.menu.api.dto.AddonGroupDto;
import com.pizzashowcase.menu.api.dto.CategoryDto;
import com.pizzashowcase.menu.api.dto.ProductDto;
import com.pizzashowcase.menu.api.dto.ProductVariantDto;
import com.pizzashowcase.menu.domain.Addon;
import com.pizzashowcase.menu.domain.AddonGroup;
import com.pizzashowcase.menu.domain.Category;
import com.pizzashowcase.menu.domain.Product;
import com.pizzashowcase.menu.domain.ProductAddonGroup;
import com.pizzashowcase.menu.domain.ProductVariant;

import java.util.Collection;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public final class MenuAssembler {

    private MenuAssembler() {
    }

    public static List<CategoryDto> toCategoryDtos(Collection<Category> categories,
                                                   Map<Long, List<ProductAddonGroup>> addonsByProduct) {
        return categories.stream()
                .sorted(Comparator.comparingInt(Category::getDisplayOrder).thenComparing(Category::getId))
                .map(c -> new CategoryDto(
                        c.getId(),
                        c.getSlug(),
                        c.getName(),
                        c.getDescription(),
                        c.getDisplayOrder(),
                        c.isActive(),
                        c.getProducts().stream()
                                .sorted(Comparator.comparingInt(Product::getDisplayOrder).thenComparing(Product::getId))
                                .map(p -> toProductDto(p, addonsByProduct.getOrDefault(p.getId(), List.of())))
                                .toList()
                ))
                .toList();
    }

    public static ProductDto toProductDto(Product product, List<ProductAddonGroup> addonGroupLinks) {
        Category category = product.getCategory();
        return new ProductDto(
                product.getId(),
                category.getId(),
                category.getSlug(),
                category.getName(),
                product.getSlug(),
                product.getName(),
                product.getDescription(),
                product.getBasePrice(),
                product.getImageUrl(),
                product.getDisplayOrder(),
                product.isAvailable(),
                product.getVariants().stream()
                        .sorted(Comparator.comparingInt(ProductVariant::getDisplayOrder).thenComparing(ProductVariant::getId))
                        .map(MenuAssembler::toVariantDto)
                        .toList(),
                addonGroupLinks.stream()
                        .sorted(Comparator.comparingInt(ProductAddonGroup::getDisplayOrder).thenComparing(ProductAddonGroup::getId))
                        .map(MenuAssembler::toAddonGroupDto)
                        .toList()
        );
    }

    public static Map<Long, List<ProductAddonGroup>> groupByProductId(Collection<ProductAddonGroup> links) {
        return links.stream().collect(Collectors.groupingBy(l -> l.getProduct().getId()));
    }

    public static ProductVariantDto toVariantDto(ProductVariant v) {
        return new ProductVariantDto(v.getId(), v.getName(), v.getPrice(), v.getDisplayOrder());
    }

    public static AddonGroupDto toAddonGroupDto(ProductAddonGroup link) {
        AddonGroup group = link.getAddonGroup();
        return new AddonGroupDto(
                group.getId(),
                group.getName(),
                group.getMinSelect(),
                group.getMaxSelect(),
                group.isRequired(),
                link.getDisplayOrder(),
                group.getAddons().stream()
                        .sorted(Comparator.comparingInt(Addon::getDisplayOrder).thenComparing(Addon::getId))
                        .map(MenuAssembler::toAddonDto)
                        .toList()
        );
    }

    public static AddonDto toAddonDto(Addon a) {
        return new AddonDto(a.getId(), a.getName(), a.getPrice(), a.getDisplayOrder());
    }
}
