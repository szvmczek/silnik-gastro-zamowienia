package com.pizzashowcase.menu.infrastructure;

import com.pizzashowcase.menu.domain.AddonGroup;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AddonGroupRepository extends JpaRepository<AddonGroup, Long> {

    List<AddonGroup> findAllByOrderByNameAsc();
}
