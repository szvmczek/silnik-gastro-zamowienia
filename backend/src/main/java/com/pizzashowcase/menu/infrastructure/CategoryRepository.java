package com.pizzashowcase.menu.infrastructure;

import com.pizzashowcase.menu.domain.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    Optional<Category> findBySlug(String slug);

    boolean existsBySlug(String slug);

    List<Category> findAllByOrderByDisplayOrderAscIdAsc();

    @Query("SELECT DISTINCT c FROM Category c " +
           "LEFT JOIN FETCH c.products p " +
           "LEFT JOIN FETCH p.variants v " +
           "WHERE c.active = true " +
           "ORDER BY c.displayOrder ASC, c.id ASC, p.displayOrder ASC, p.id ASC, v.displayOrder ASC, v.id ASC")
    List<Category> findActiveMenuWithVariants();

    @Query("SELECT DISTINCT c FROM Category c " +
           "LEFT JOIN FETCH c.products p " +
           "LEFT JOIN FETCH p.variants v " +
           "WHERE c.active = true AND p.slug = :slug")
    Optional<Category> findCategoryWithProductBySlug(String slug);
}
