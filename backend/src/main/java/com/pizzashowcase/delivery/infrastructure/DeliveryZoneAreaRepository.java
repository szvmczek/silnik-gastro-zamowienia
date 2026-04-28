package com.pizzashowcase.delivery.infrastructure;

import com.pizzashowcase.delivery.domain.DeliveryZoneArea;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface DeliveryZoneAreaRepository extends JpaRepository<DeliveryZoneArea, Long> {

    @Query("SELECT a FROM DeliveryZoneArea a JOIN FETCH a.zone z " +
           "WHERE a.cityNormalized = :city AND a.postalCode = :postalCode AND z.active = true")
    Optional<DeliveryZoneArea> findExactActive(String city, String postalCode);

    @Query("SELECT a FROM DeliveryZoneArea a JOIN FETCH a.zone z " +
           "WHERE a.cityNormalized = :city AND a.postalCode IS NULL AND z.active = true")
    Optional<DeliveryZoneArea> findCityWildcardActive(String city);

    @Query("SELECT DISTINCT a.cityDisplay FROM DeliveryZoneArea a " +
           "WHERE a.zone.active = true ORDER BY a.cityDisplay ASC")
    List<String> findDistinctActiveCityDisplays();

    boolean existsByCityNormalizedAndPostalCode(String city, String postalCode);

    @Query("SELECT COUNT(a) FROM DeliveryZoneArea a WHERE a.zone.id = :zoneId")
    long countByZoneId(Long zoneId);
}
