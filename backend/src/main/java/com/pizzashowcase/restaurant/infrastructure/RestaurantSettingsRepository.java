package com.pizzashowcase.restaurant.infrastructure;

import com.pizzashowcase.restaurant.domain.RestaurantSettings;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RestaurantSettingsRepository extends JpaRepository<RestaurantSettings, Long> {
}
