package com.pizzashowcase.order.infrastructure;

import com.pizzashowcase.order.domain.FulfillmentType;
import com.pizzashowcase.order.domain.Order;
import com.pizzashowcase.order.domain.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Collection;
import java.util.Optional;
import java.util.UUID;

public interface OrderRepository extends JpaRepository<Order, Long> {

    @EntityGraph(attributePaths = {"items", "items.addons"})
    Optional<Order> findByPublicTrackingToken(UUID publicTrackingToken);

    @EntityGraph(attributePaths = {"items", "items.addons", "statusHistory"})
    Optional<Order> findWithDetailsById(Long id);

    @Query(value = "SELECT o FROM Order o WHERE " +
                   "(:status IS NULL OR o.status = :status) AND " +
                   "(:fulfillmentType IS NULL OR o.fulfillmentType = :fulfillmentType) AND " +
                   "(:fromInclusive IS NULL OR o.createdAt >= :fromInclusive) AND " +
                   "(:toExclusive IS NULL OR o.createdAt < :toExclusive)",
           countQuery = "SELECT COUNT(o) FROM Order o WHERE " +
                        "(:status IS NULL OR o.status = :status) AND " +
                        "(:fulfillmentType IS NULL OR o.fulfillmentType = :fulfillmentType) AND " +
                        "(:fromInclusive IS NULL OR o.createdAt >= :fromInclusive) AND " +
                        "(:toExclusive IS NULL OR o.createdAt < :toExclusive)")
    @EntityGraph(attributePaths = "items")
    Page<Order> findAllFiltered(@Param("status") OrderStatus status,
                                @Param("fulfillmentType") FulfillmentType fulfillmentType,
                                @Param("fromInclusive") Instant fromInclusive,
                                @Param("toExclusive") Instant toExclusive,
                                Pageable pageable);

    @Query("SELECT COUNT(o) FROM Order o " +
           "WHERE o.status = :status " +
           "AND o.createdAt >= :fromInclusive " +
           "AND o.createdAt < :toExclusive")
    long countByStatusAndCreatedAtInRange(@Param("status") OrderStatus status,
                                          @Param("fromInclusive") Instant fromInclusive,
                                          @Param("toExclusive") Instant toExclusive);

    long countByStatusIn(Collection<OrderStatus> statuses);
}
