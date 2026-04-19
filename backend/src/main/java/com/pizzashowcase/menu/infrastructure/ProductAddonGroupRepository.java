package com.pizzashowcase.menu.infrastructure;

import com.pizzashowcase.menu.domain.ProductAddonGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface ProductAddonGroupRepository extends JpaRepository<ProductAddonGroup, Long> {

    long countByAddonGroupId(Long addonGroupId);

    Optional<ProductAddonGroup> findByProductIdAndAddonGroupId(Long productId, Long addonGroupId);

    @Query("SELECT DISTINCT pag FROM ProductAddonGroup pag " +
           "JOIN FETCH pag.addonGroup ag " +
           "LEFT JOIN FETCH ag.addons a " +
           "WHERE pag.product.id IN :productIds " +
           "ORDER BY pag.product.id ASC, pag.displayOrder ASC, pag.id ASC, a.displayOrder ASC, a.id ASC")
    List<ProductAddonGroup> findAllByProductIdsWithAddons(Collection<Long> productIds);
}
