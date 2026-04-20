package com.pizzashowcase.menu.application;

import com.pizzashowcase.menu.api.dto.AttachAddonGroupRequest;
import com.pizzashowcase.menu.api.dto.ProductAddonGroupLinkDto;
import com.pizzashowcase.menu.domain.AddonGroup;
import com.pizzashowcase.menu.domain.Product;
import com.pizzashowcase.menu.domain.ProductAddonGroup;
import com.pizzashowcase.menu.infrastructure.AddonGroupRepository;
import com.pizzashowcase.menu.infrastructure.ProductAddonGroupRepository;
import com.pizzashowcase.menu.infrastructure.ProductRepository;
import com.pizzashowcase.shared.error.ApiException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
@Transactional
public class AdminProductAddonGroupService {

    private final ProductRepository productRepository;
    private final AddonGroupRepository addonGroupRepository;
    private final ProductAddonGroupRepository linkRepository;

    public AdminProductAddonGroupService(ProductRepository productRepository,
                                         AddonGroupRepository addonGroupRepository,
                                         ProductAddonGroupRepository linkRepository) {
        this.productRepository = productRepository;
        this.addonGroupRepository = addonGroupRepository;
        this.linkRepository = linkRepository;
    }

    @Transactional(readOnly = true)
    public List<ProductAddonGroupLinkDto> listForProduct(Long productId) {
        Product product = loadProductOrThrow(productId);
        return product.getAddonGroups().stream()
                .sorted(Comparator.comparingInt(ProductAddonGroup::getDisplayOrder)
                        .thenComparing(ProductAddonGroup::getId))
                .map(AdminProductAddonGroupService::toDto)
                .toList();
    }

    public ProductAddonGroupLinkDto attach(Long productId, AttachAddonGroupRequest request) {
        Product product = loadProductOrThrow(productId);
        AddonGroup group = addonGroupRepository.findById(request.addonGroupId())
                .orElseThrow(() -> ApiException.badRequest("Grupa dodatków nie istnieje."));
        linkRepository.findByProductIdAndAddonGroupId(productId, group.getId()).ifPresent(existing -> {
            throw ApiException.conflict("Grupa \"" + group.getName() + "\" jest już przypisana do tego produktu.");
        });
        ProductAddonGroup link = new ProductAddonGroup(product, group, request.displayOrder());
        product.addAddonGroup(link);
        ProductAddonGroup saved = linkRepository.save(link);
        return toDto(saved);
    }

    public void detach(Long productId, Long addonGroupId) {
        Product product = loadProductOrThrow(productId);
        ProductAddonGroup link = linkRepository.findByProductIdAndAddonGroupId(productId, addonGroupId)
                .orElseThrow(() -> ApiException.notFound("Grupa dodatków nie jest przypisana do tego produktu."));
        product.removeAddonGroup(link);
    }

    private Product loadProductOrThrow(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Produkt nie istnieje."));
    }

    private static ProductAddonGroupLinkDto toDto(ProductAddonGroup link) {
        AddonGroup g = link.getAddonGroup();
        return new ProductAddonGroupLinkDto(
                link.getId(),
                link.getProduct().getId(),
                g.getId(),
                g.getName(),
                link.getDisplayOrder()
        );
    }
}
