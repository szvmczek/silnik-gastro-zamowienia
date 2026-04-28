package com.pizzashowcase.delivery.application;

import com.pizzashowcase.delivery.domain.DeliveryLookupResult;
import com.pizzashowcase.delivery.domain.DeliveryZoneArea;
import com.pizzashowcase.delivery.infrastructure.DeliveryZoneAreaRepository;
import com.pizzashowcase.shared.util.AddressNormalizer;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class DeliveryZoneLookupService {

    private final DeliveryZoneAreaRepository areaRepository;

    public DeliveryZoneLookupService(DeliveryZoneAreaRepository areaRepository) {
        this.areaRepository = areaRepository;
    }

    @Transactional(readOnly = true)
    public DeliveryLookupResult lookup(String cityRaw, String postalCodeRaw) {
        String cityNorm;
        String postalNorm;
        try {
            cityNorm = AddressNormalizer.normalizeCity(cityRaw);
            postalNorm = AddressNormalizer.normalizePostalCode(postalCodeRaw);
        } catch (IllegalArgumentException ex) {
            return DeliveryLookupResult.unavailableMiss();
        }

        if (postalNorm != null) {
            Optional<DeliveryZoneArea> exact = areaRepository.findExactActive(cityNorm, postalNorm);
            if (exact.isPresent()) {
                return DeliveryLookupResult.of(exact.get().getZone());
            }
        }

        Optional<DeliveryZoneArea> fallback = areaRepository.findCityWildcardActive(cityNorm);
        return fallback.map(area -> DeliveryLookupResult.of(area.getZone()))
                .orElseGet(DeliveryLookupResult::unavailableMiss);
    }
}
