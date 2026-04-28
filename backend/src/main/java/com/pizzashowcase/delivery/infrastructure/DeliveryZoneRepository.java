package com.pizzashowcase.delivery.infrastructure;

import com.pizzashowcase.delivery.domain.DeliveryZone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface DeliveryZoneRepository extends JpaRepository<DeliveryZone, Long> {

    @Query("SELECT DISTINCT z FROM DeliveryZone z LEFT JOIN FETCH z.areas ORDER BY z.name ASC")
    List<DeliveryZone> findAllWithAreas();
}
