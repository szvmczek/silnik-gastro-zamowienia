package com.pizzashowcase.menu.infrastructure;

import com.pizzashowcase.menu.domain.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    Optional<Product> findBySlug(String slug);

    boolean existsBySlug(String slug);

    long countByCategoryId(Long categoryId);

    List<Product> findAllByCategoryIdOrderByDisplayOrderAscIdAsc(Long categoryId);

    @Query("SELECT p FROM Product p ORDER BY p.category.displayOrder ASC, p.displayOrder ASC, p.id ASC")
    List<Product> findAllOrdered();

    @Query("SELECT DISTINCT p FROM Product p " +
           "LEFT JOIN FETCH p.variants v " +
           "WHERE p.slug = :slug")
    Optional<Product> findBySlugWithVariants(String slug);
}
