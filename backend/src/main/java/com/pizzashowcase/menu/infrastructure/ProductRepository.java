package com.pizzashowcase.menu.infrastructure;

import com.pizzashowcase.menu.domain.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    Optional<Product> findBySlug(String slug);

    boolean existsBySlug(String slug);

    long countByCategoryId(Long categoryId);

    List<Product> findAllByCategoryIdOrderByDisplayOrderAscIdAsc(Long categoryId);

    @Query("SELECT p FROM Product p ORDER BY p.category.displayOrder ASC, p.displayOrder ASC, p.id ASC")
    List<Product> findAllOrdered();

    @Query(value = "SELECT p FROM Product p WHERE " +
                   "(:categoryId IS NULL OR p.category.id = :categoryId) AND " +
                   "(:available IS NULL OR p.available = :available)",
           countQuery = "SELECT COUNT(p) FROM Product p WHERE " +
                        "(:categoryId IS NULL OR p.category.id = :categoryId) AND " +
                        "(:available IS NULL OR p.available = :available)")
    Page<Product> findAllFiltered(@Param("categoryId") Long categoryId,
                                  @Param("available") Boolean available,
                                  Pageable pageable);

    @Query("SELECT DISTINCT p FROM Product p " +
           "LEFT JOIN FETCH p.variants v " +
           "WHERE p.slug = :slug")
    Optional<Product> findBySlugWithVariants(String slug);

    @Query("SELECT DISTINCT p FROM Product p " +
           "JOIN FETCH p.category c " +
           "LEFT JOIN FETCH p.variants v " +
           "WHERE p.id IN :ids")
    List<Product> findAllByIdInWithVariants(@Param("ids") Collection<Long> ids);
}
