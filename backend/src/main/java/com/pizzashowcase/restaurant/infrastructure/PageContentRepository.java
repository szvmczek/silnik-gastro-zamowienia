package com.pizzashowcase.restaurant.infrastructure;

import com.pizzashowcase.restaurant.domain.PageContent;
import com.pizzashowcase.restaurant.domain.SectionKey;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PageContentRepository extends JpaRepository<PageContent, Long> {
    Optional<PageContent> findBySectionKey(SectionKey sectionKey);
}
