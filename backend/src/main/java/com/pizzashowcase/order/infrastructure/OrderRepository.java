package com.pizzashowcase.order.infrastructure;

import com.pizzashowcase.order.domain.Order;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface OrderRepository extends JpaRepository<Order, Long> {

    @EntityGraph(attributePaths = {"items", "items.addons"})
    Optional<Order> findByPublicTrackingToken(UUID publicTrackingToken);
}
