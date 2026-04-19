package com.pizzashowcase.menu.infrastructure;

import com.pizzashowcase.menu.domain.Addon;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AddonRepository extends JpaRepository<Addon, Long> {

    List<Addon> findAllByAddonGroupIdOrderByDisplayOrderAscIdAsc(Long addonGroupId);

    boolean existsByAddonGroupIdAndNameIgnoreCase(Long addonGroupId, String name);
}
