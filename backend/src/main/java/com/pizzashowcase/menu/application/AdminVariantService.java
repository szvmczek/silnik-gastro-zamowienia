package com.pizzashowcase.menu.application;

import com.pizzashowcase.menu.api.dto.AdminVariantDto;
import com.pizzashowcase.menu.api.dto.CreateVariantRequest;
import com.pizzashowcase.menu.api.dto.UpdateVariantRequest;
import com.pizzashowcase.menu.domain.Product;
import com.pizzashowcase.menu.domain.ProductVariant;
import com.pizzashowcase.menu.infrastructure.ProductRepository;
import com.pizzashowcase.menu.infrastructure.ProductVariantRepository;
import com.pizzashowcase.shared.error.ApiException;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class AdminVariantService {

    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;

    public AdminVariantService(ProductRepository productRepository,
                               ProductVariantRepository variantRepository) {
        this.productRepository = productRepository;
        this.variantRepository = variantRepository;
    }

    @Transactional(readOnly = true)
    public List<AdminVariantDto> listForProduct(Long productId) {
        loadProductOrThrow(productId);
        return variantRepository.findAllByProductIdOrderByDisplayOrderAscIdAsc(productId).stream()
                .map(this::toDto)
                .toList();
    }

    public AdminVariantDto create(Long productId, CreateVariantRequest request) {
        Product product = loadProductOrThrow(productId);
        String name = request.name().trim();
        if (variantRepository.existsByProductIdAndNameIgnoreCase(productId, name)) {
            throw ApiException.conflict("Wariant o nazwie \"" + name + "\" już istnieje dla tego produktu.");
        }
        ProductVariant variant = new ProductVariant(product, name, request.price(), request.displayOrder());
        product.addVariant(variant);
        ProductVariant saved = variantRepository.save(variant);
        return toDto(saved);
    }

    public AdminVariantDto update(Long id, UpdateVariantRequest request) {
        ProductVariant variant = loadVariantOrThrow(id);
        if (!request.version().equals(variant.getVersion())) {
            throw new OptimisticLockingFailureException("Variant " + id + " version mismatch");
        }
        String name = request.name().trim();
        if (!variant.getName().equalsIgnoreCase(name)
                && variantRepository.existsByProductIdAndNameIgnoreCase(variant.getProduct().getId(), name)) {
            throw ApiException.conflict("Wariant o nazwie \"" + name + "\" już istnieje dla tego produktu.");
        }
        variant.setName(name);
        variant.setPrice(request.price());
        variant.setDisplayOrder(request.displayOrder());
        return toDto(variant);
    }

    public void delete(Long id) {
        ProductVariant variant = loadVariantOrThrow(id);
        variant.getProduct().removeVariant(variant);
    }

    private Product loadProductOrThrow(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Produkt nie istnieje."));
    }

    private ProductVariant loadVariantOrThrow(Long id) {
        return variantRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Wariant nie istnieje."));
    }

    private AdminVariantDto toDto(ProductVariant v) {
        return new AdminVariantDto(
                v.getId(),
                v.getVersion(),
                v.getProduct().getId(),
                v.getName(),
                v.getPrice(),
                v.getDisplayOrder()
        );
    }
}
