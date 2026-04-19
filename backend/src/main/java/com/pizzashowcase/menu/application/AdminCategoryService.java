package com.pizzashowcase.menu.application;

import com.pizzashowcase.menu.api.dto.AdminCategoryDto;
import com.pizzashowcase.menu.api.dto.CreateCategoryRequest;
import com.pizzashowcase.menu.api.dto.UpdateCategoryRequest;
import com.pizzashowcase.menu.domain.Category;
import com.pizzashowcase.menu.infrastructure.CategoryRepository;
import com.pizzashowcase.menu.infrastructure.ProductRepository;
import com.pizzashowcase.shared.error.ApiException;
import com.pizzashowcase.shared.util.SlugGenerator;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class AdminCategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    public AdminCategoryService(CategoryRepository categoryRepository,
                                ProductRepository productRepository) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public List<AdminCategoryDto> list() {
        return categoryRepository.findAllByOrderByDisplayOrderAscIdAsc().stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public AdminCategoryDto get(Long id) {
        return toDto(loadOrThrow(id));
    }

    public AdminCategoryDto create(CreateCategoryRequest request) {
        String slug = SlugGenerator.uniqueSlug(request.name(), categoryRepository::existsBySlug);
        boolean active = request.active() == null || request.active();
        Category category = new Category(
                request.name().trim(),
                slug,
                normalize(request.description()),
                request.displayOrder(),
                active
        );
        Category saved = categoryRepository.save(category);
        return toDto(saved);
    }

    public AdminCategoryDto update(Long id, UpdateCategoryRequest request) {
        Category category = loadOrThrow(id);
        category.setName(request.name().trim());
        category.setDescription(normalize(request.description()));
        category.setDisplayOrder(request.displayOrder());
        category.setActive(Boolean.TRUE.equals(request.active()));
        return toDto(category);
    }

    public void delete(Long id) {
        Category category = loadOrThrow(id);
        long productsCount = productRepository.countByCategoryId(id);
        if (productsCount > 0) {
            throw ApiException.conflict("Kategoria zawiera " + productsCount + " produktów. Najpierw usuń produkty.");
        }
        categoryRepository.delete(category);
    }

    private Category loadOrThrow(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Kategoria nie istnieje."));
    }

    private AdminCategoryDto toDto(Category c) {
        return new AdminCategoryDto(
                c.getId(),
                c.getSlug(),
                c.getName(),
                c.getDescription(),
                c.getDisplayOrder(),
                c.isActive(),
                productRepository.countByCategoryId(c.getId())
        );
    }

    private static String normalize(String s) {
        if (s == null) return null;
        String trimmed = s.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
