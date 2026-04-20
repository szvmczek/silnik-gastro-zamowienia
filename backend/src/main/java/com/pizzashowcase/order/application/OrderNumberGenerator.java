package com.pizzashowcase.order.application;

import com.pizzashowcase.order.domain.OrderNumberSequence;
import com.pizzashowcase.order.infrastructure.OrderNumberSequenceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Year;
import java.time.ZoneId;

@Service
public class OrderNumberGenerator {

    private static final ZoneId ORDER_NUMBER_ZONE = ZoneId.of("Europe/Warsaw");

    private final OrderNumberSequenceRepository sequenceRepository;

    public OrderNumberGenerator(OrderNumberSequenceRepository sequenceRepository) {
        this.sequenceRepository = sequenceRepository;
    }

    @Transactional(propagation = Propagation.MANDATORY)
    public String next() {
        int year = Year.now(ORDER_NUMBER_ZONE).getValue();
        OrderNumberSequence sequence = sequenceRepository.findByYearForUpdate(year)
                .orElseGet(() -> sequenceRepository.save(new OrderNumberSequence(year, 0)));
        int next = sequence.incrementAndGet();
        return String.format("%d-%05d", year, next);
    }
}
