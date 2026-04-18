package com.pizzashowcase.restaurant.infrastructure;

import com.pizzashowcase.restaurant.domain.OpeningHours;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.DayOfWeek;
import java.util.List;
import java.util.Optional;

public interface OpeningHoursRepository extends JpaRepository<OpeningHours, Long> {
    Optional<OpeningHours> findByDayOfWeek(DayOfWeek dayOfWeek);

    List<OpeningHours> findAllByOrderByDayOfWeekAsc();
}
