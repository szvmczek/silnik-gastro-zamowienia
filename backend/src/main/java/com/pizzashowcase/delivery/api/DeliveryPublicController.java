package com.pizzashowcase.delivery.api;

import com.pizzashowcase.delivery.api.dto.DeliveryCheckRequest;
import com.pizzashowcase.delivery.api.dto.DeliveryCheckResponse;
import com.pizzashowcase.delivery.api.dto.DeliveryCityDto;
import com.pizzashowcase.delivery.api.dto.DeliveryZonePublicDto;
import com.pizzashowcase.delivery.application.DeliveryZoneLookupService;
import com.pizzashowcase.delivery.domain.DeliveryZone;
import com.pizzashowcase.delivery.domain.DeliveryZoneArea;
import com.pizzashowcase.delivery.domain.DeliveryZoneType;
import com.pizzashowcase.delivery.infrastructure.DeliveryZoneAreaRepository;
import com.pizzashowcase.delivery.infrastructure.DeliveryZoneRepository;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Comparator;
import java.util.List;

@RestController
@RequestMapping("/api/public/delivery")
public class DeliveryPublicController {

    private final DeliveryZoneLookupService lookupService;
    private final DeliveryZoneAreaRepository areaRepository;
    private final DeliveryZoneRepository zoneRepository;

    public DeliveryPublicController(DeliveryZoneLookupService lookupService,
                                    DeliveryZoneAreaRepository areaRepository,
                                    DeliveryZoneRepository zoneRepository) {
        this.lookupService = lookupService;
        this.areaRepository = areaRepository;
        this.zoneRepository = zoneRepository;
    }

    @PostMapping("/check")
    public DeliveryCheckResponse check(@Valid @RequestBody DeliveryCheckRequest request) {
        return DeliveryCheckResponse.from(lookupService.lookup(request.city(), request.postalCode()));
    }

    @GetMapping("/cities")
    public List<DeliveryCityDto> cities() {
        return areaRepository.findDistinctActiveCityDisplays().stream()
                .map(DeliveryCityDto::new)
                .toList();
    }

    /**
     * Aktywne strefy z listą miejscowości — kafle „Dostawa i odbiór"
     * na stronie głównej (D-01). Strefy UNAVAILABLE odfiltrowane:
     * to techniczne placeholdery, nie oferta dla klienta.
     */
    @GetMapping("/zones")
    public List<DeliveryZonePublicDto> zones() {
        return zoneRepository.findAllWithAreas().stream()
                .filter(DeliveryZone::isActive)
                .filter(zone -> zone.getType() != DeliveryZoneType.UNAVAILABLE)
                .sorted(Comparator.comparingInt(DeliveryZone::getDisplayOrder)
                        .thenComparing(DeliveryZone::getName))
                .map(zone -> new DeliveryZonePublicDto(
                        zone.getName(),
                        zone.getType(),
                        zone.getDeliveryFee(),
                        zone.getAreas().stream()
                                .map(DeliveryZoneArea::getCityDisplay)
                                .distinct()
                                .sorted()
                                .toList()))
                .toList();
    }
}
