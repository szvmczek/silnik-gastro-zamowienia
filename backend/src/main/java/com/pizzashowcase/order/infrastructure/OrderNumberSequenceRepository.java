package com.pizzashowcase.order.infrastructure;

import com.pizzashowcase.order.domain.OrderNumberSequence;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface OrderNumberSequenceRepository extends JpaRepository<OrderNumberSequence, Integer> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM OrderNumberSequence s WHERE s.year = :year")
    Optional<OrderNumberSequence> findByYearForUpdate(@Param("year") Integer year);
}
