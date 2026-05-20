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
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OrderRepository extends JpaRepository<Order, Long> {

    @EntityGraph(attributePaths = {"items", "items.addons"})
    Optional<Order> findByPublicTrackingToken(UUID publicTrackingToken);

    @EntityGraph(attributePaths = {"items", "items.addons", "statusHistory"})
    Optional<Order> findWithDetailsById(Long id);

    // Date range is always bound (service layer fills sentinel values when
    // filter is not applied). Hibernate 6 + PostgreSQL cannot infer Instant
    // type for `:param IS NULL`, so we drop the null-checks for timestamps.
    // Enum null-checks work because $= :status provides the type on the same
    // parameter bind.
    @Query(value = "SELECT o FROM Order o WHERE " +
                   "(:status IS NULL OR o.status = :status) AND " +
                   "(:fulfillmentType IS NULL OR o.fulfillmentType = :fulfillmentType) AND " +
                   "o.createdAt >= :fromInclusive AND o.createdAt < :toExclusive",
           countQuery = "SELECT COUNT(o) FROM Order o WHERE " +
                        "(:status IS NULL OR o.status = :status) AND " +
                        "(:fulfillmentType IS NULL OR o.fulfillmentType = :fulfillmentType) AND " +
                        "o.createdAt >= :fromInclusive AND o.createdAt < :toExclusive")
    // items + items.addons fetched together to avoid N+1 when the list now
    // returns the operational-card detail shape (AD-022).
    @EntityGraph(attributePaths = {"items", "items.addons"})
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

    long countByStatus(OrderStatus status);

    long countByStatusAndFulfillmentType(OrderStatus status, FulfillmentType fulfillmentType);

    // Per-status order counts for the admin orders-list filter chips (M-043,
    // resolves PHASE5_FINDINGS #17 / AD-Δ14). One GROUP BY replaces the eight
    // client-side count round-trips OrdersListPage fired on every 10s poll.
    // Date range always bound (service fills sentinels) — see findAllFiltered.
    @Query("SELECT o.status, COUNT(o) FROM Order o WHERE " +
           "(:fulfillmentType IS NULL OR o.fulfillmentType = :fulfillmentType) AND " +
           "o.createdAt >= :fromInclusive AND o.createdAt < :toExclusive " +
           "GROUP BY o.status")
    List<Object[]> countGroupedByStatus(@Param("fulfillmentType") FulfillmentType fulfillmentType,
                                        @Param("fromInclusive") Instant fromInclusive,
                                        @Param("toExclusive") Instant toExclusive);

    @Query("SELECT o FROM Order o WHERE o.createdAt >= :fromInclusive AND o.createdAt < :toExclusive")
    List<Order> findInCreatedAtRange(@Param("fromInclusive") Instant fromInclusive,
                                     @Param("toExclusive") Instant toExclusive);

    // @EntityGraph na items dla unikania N+1 przy agregacji topProducts30Days.
    @Query("SELECT o FROM Order o WHERE o.createdAt >= :fromInclusive AND o.createdAt < :toExclusive")
    @EntityGraph(attributePaths = "items")
    List<Order> findInCreatedAtRangeWithItems(@Param("fromInclusive") Instant fromInclusive,
                                              @Param("toExclusive") Instant toExclusive);

    boolean existsByDeliveryZoneName(String deliveryZoneName);
}
