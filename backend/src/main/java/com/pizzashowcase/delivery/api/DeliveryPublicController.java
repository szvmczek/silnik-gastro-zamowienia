package com.pizzashowcase.delivery.api;

import com.pizzashowcase.delivery.api.dto.DeliveryCheckRequest;
import com.pizzashowcase.delivery.api.dto.DeliveryCheckResponse;
import com.pizzashowcase.delivery.api.dto.DeliveryCityDto;
import com.pizzashowcase.delivery.application.DeliveryZoneLookupService;
import com.pizzashowcase.delivery.infrastructure.DeliveryZoneAreaRepository;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/public/delivery")
public class DeliveryPublicController {

    private final DeliveryZoneLookupService lookupService;
    private final DeliveryZoneAreaRepository areaRepository;

    public DeliveryPublicController(DeliveryZoneLookupService lookupService,
                                    DeliveryZoneAreaRepository areaRepository) {
        this.lookupService = lookupService;
        this.areaRepository = areaRepository;
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
}
