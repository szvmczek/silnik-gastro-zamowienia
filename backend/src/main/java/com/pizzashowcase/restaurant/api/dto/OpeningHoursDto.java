package com.pizzashowcase.restaurant.api.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.pizzashowcase.restaurant.domain.OpeningHours;

import java.time.DayOfWeek;
import java.time.LocalTime;

public record OpeningHoursDto(
        DayOfWeek dayOfWeek,
        boolean closed,
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "HH:mm") LocalTime openTime,
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "HH:mm") LocalTime closeTime
) {
    public static OpeningHoursDto from(OpeningHours oh) {
        return new OpeningHoursDto(oh.getDayOfWeek(), oh.isClosed(), oh.getOpenTime(), oh.getCloseTime());
    }
}
