package com.pizzashowcase.menu.infrastructure;

import com.pizzashowcase.menu.domain.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {

    List<ProductVariant> findAllByProductIdOrderByDisplayOrderAscIdAsc(Long productId);

    boolean existsByProductIdAndNameIgnoreCase(Long productId, String name);
}
