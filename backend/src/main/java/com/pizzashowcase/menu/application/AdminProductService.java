package com.pizzashowcase.menu.application;

import com.pizzashowcase.menu.api.dto.AdminProductDto;
import com.pizzashowcase.menu.api.dto.CreateProductRequest;
import com.pizzashowcase.menu.api.dto.UpdateAvailabilityRequest;
import com.pizzashowcase.menu.api.dto.UpdateProductRequest;
import com.pizzashowcase.menu.domain.Category;
import com.pizzashowcase.menu.domain.Product;
import com.pizzashowcase.menu.infrastructure.CategoryRepository;
import com.pizzashowcase.menu.infrastructure.ProductRepository;
import com.pizzashowcase.shared.error.ApiException;
import com.pizzashowcase.shared.util.SlugGenerator;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AdminProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public AdminProductService(ProductRepository productRepository,
                               CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    @Transactional(readOnly = true)
    public Page<AdminProductDto> list(Long categoryId, Boolean available, Pageable pageable) {
        return productRepository.findAllFiltered(categoryId, available, pageable)
                .map(this::toDto);
    }

    @Transactional(readOnly = true)
    public AdminProductDto get(Long id) {
        return toDto(loadOrThrow(id));
    }

    public AdminProductDto create(CreateProductRequest request) {
        if (request.basePrice() == null) {
            throw ApiException.badRequest(
                    "Produkt musi mieć basePrice przy tworzeniu. Dodaj warianty po utworzeniu, potem wyczyść basePrice w edycji.");
        }
        Category category = loadCategoryOrThrow(request.categoryId());
        String slug = SlugGenerator.uniqueSlug(request.name(), productRepository::existsBySlug);
        boolean available = request.available() == null || request.available();
        Product product = new Product(
                category,
                request.name().trim(),
                slug,
                normalize(request.description()),
                request.basePrice(),
                normalize(request.imageUrl()),
                request.displayOrder(),
                available
        );
        Product saved = productRepository.save(product);
        return toDto(saved);
    }

    public AdminProductDto update(Long id, UpdateProductRequest request) {
        Product product = loadOrThrow(id);
        if (!request.version().equals(product.getVersion())) {
            throw new OptimisticLockingFailureException("Product " + id + " version mismatch");
        }
        Category category = loadCategoryOrThrow(request.categoryId());
        validatePriceStructure(request.basePrice(), product.getVariants().size());
        product.setCategory(category);
        product.setName(request.name().trim());
        product.setDescription(normalize(request.description()));
        product.setBasePrice(request.basePrice());
        product.setImageUrl(normalize(request.imageUrl()));
        product.setDisplayOrder(request.displayOrder());
        product.setAvailable(Boolean.TRUE.equals(request.available()));
        return toDto(product);
    }

    private static void validatePriceStructure(java.math.BigDecimal basePrice, int variantsCount) {
        boolean hasBasePrice = basePrice != null;
        boolean hasVariants = variantsCount > 0;
        if (hasBasePrice && hasVariants) {
            throw ApiException.badRequest(
                    "Produkt z wariantami nie może mieć basePrice. Usuń basePrice albo usuń warianty.");
        }
        if (!hasBasePrice && !hasVariants) {
            throw ApiException.badRequest(
                    "Produkt musi mieć basePrice lub co najmniej jeden wariant.");
        }
    }

    public AdminProductDto updateAvailability(Long id, UpdateAvailabilityRequest request) {
        Product product = loadOrThrow(id);
        product.setAvailable(Boolean.TRUE.equals(request.available()));
        return toDto(product);
    }

    public void delete(Long id) {
        Product product = loadOrThrow(id);
        productRepository.delete(product);
    }

    private Product loadOrThrow(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Produkt nie istnieje."));
    }

    private Category loadCategoryOrThrow(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> ApiException.badRequest("Kategoria nie istnieje."));
    }

    private AdminProductDto toDto(Product p) {
        Category c = p.getCategory();
        return new AdminProductDto(
                p.getId(),
                p.getVersion(),
                c.getId(),
                c.getSlug(),
                c.getName(),
                p.getSlug(),
                p.getName(),
                p.getDescription(),
                p.getBasePrice(),
                p.getImageUrl(),
                p.getDisplayOrder(),
                p.isAvailable(),
                p.getVariants().size(),
                p.getAddonGroups().size()
        );
    }

    private static String normalize(String s) {
        if (s == null) return null;
        String trimmed = s.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
