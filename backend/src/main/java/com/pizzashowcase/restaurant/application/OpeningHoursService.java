package com.pizzashowcase.restaurant.application;

import com.pizzashowcase.restaurant.domain.OpeningHours;
import com.pizzashowcase.restaurant.infrastructure.OpeningHoursRepository;
import com.pizzashowcase.shared.error.ApiException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class OpeningHoursService {

    private final OpeningHoursRepository repository;

    public OpeningHoursService(OpeningHoursRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<OpeningHours> getAllOrdered() {
        return repository.findAllByOrderByDayOfWeekAsc();
    }

    @Transactional
    public List<OpeningHours> replaceAll(List<OpeningHoursUpdate> updates) {
        if (updates == null || updates.size() != 7) {
            throw ApiException.unprocessable("Exactly 7 opening-hour entries are required");
        }
        Set<DayOfWeek> uniqueDays = updates.stream().map(OpeningHoursUpdate::dayOfWeek).collect(Collectors.toSet());
        if (uniqueDays.size() != 7 || !uniqueDays.containsAll(EnumSet.allOf(DayOfWeek.class))) {
            throw ApiException.unprocessable("Each day of the week must appear exactly once");
        }
        for (OpeningHoursUpdate update : updates) {
            if (!update.closed()) {
                if (update.openTime() == null || update.closeTime() == null) {
                    throw ApiException.unprocessable("openTime and closeTime are required when not closed (" + update.dayOfWeek() + ")");
                }
                if (!update.openTime().isBefore(update.closeTime())) {
                    throw ApiException.unprocessable("openTime must be before closeTime (" + update.dayOfWeek() + ")");
                }
            }
        }

        Map<DayOfWeek, OpeningHours> existing = repository.findAll().stream()
                .collect(Collectors.toMap(OpeningHours::getDayOfWeek, oh -> oh));

        for (OpeningHoursUpdate update : updates) {
            OpeningHours entity = existing.get(update.dayOfWeek());
            if (entity == null) {
                entity = new OpeningHours(update.dayOfWeek(), update.closed(),
                        update.closed() ? null : update.openTime(),
                        update.closed() ? null : update.closeTime());
                repository.save(entity);
            } else {
                entity.setClosed(update.closed());
                entity.setOpenTime(update.closed() ? null : update.openTime());
                entity.setCloseTime(update.closed() ? null : update.closeTime());
            }
        }
        return getAllOrdered();
    }

    public record OpeningHoursUpdate(DayOfWeek dayOfWeek, boolean closed, LocalTime openTime, LocalTime closeTime) {}
}
