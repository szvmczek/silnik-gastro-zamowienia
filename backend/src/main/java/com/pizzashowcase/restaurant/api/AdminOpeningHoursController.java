package com.pizzashowcase.restaurant.api;

import com.pizzashowcase.restaurant.api.dto.OpeningHoursDto;
import com.pizzashowcase.restaurant.api.dto.UpdateOpeningHoursRequest;
import com.pizzashowcase.restaurant.application.OpeningHoursService;
import com.pizzashowcase.restaurant.application.OpeningHoursService.OpeningHoursUpdate;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/opening-hours")
@PreAuthorize("hasRole('ADMIN')")
public class AdminOpeningHoursController {

    private final OpeningHoursService service;

    public AdminOpeningHoursController(OpeningHoursService service) {
        this.service = service;
    }

    @GetMapping
    public List<OpeningHoursDto> get() {
        return service.getAllOrdered().stream().map(OpeningHoursDto::from).toList();
    }

    @PutMapping
    public List<OpeningHoursDto> update(@Valid @RequestBody UpdateOpeningHoursRequest request) {
        List<OpeningHoursUpdate> updates = request.days().stream()
                .map(e -> new OpeningHoursUpdate(e.dayOfWeek(), e.closed(), e.openTime(), e.closeTime()))
                .toList();
        return service.replaceAll(updates).stream().map(OpeningHoursDto::from).toList();
    }
}
