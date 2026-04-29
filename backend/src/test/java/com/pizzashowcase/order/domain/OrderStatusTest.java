package com.pizzashowcase.order.domain;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Stream;

import static com.pizzashowcase.order.domain.FulfillmentType.DELIVERY;
import static com.pizzashowcase.order.domain.FulfillmentType.PICKUP;
import static com.pizzashowcase.order.domain.OrderStatus.CANCELED;
import static com.pizzashowcase.order.domain.OrderStatus.CONFIRMED;
import static com.pizzashowcase.order.domain.OrderStatus.DELIVERED;
import static com.pizzashowcase.order.domain.OrderStatus.IN_PREPARATION;
import static com.pizzashowcase.order.domain.OrderStatus.NEW;
import static com.pizzashowcase.order.domain.OrderStatus.OUT_FOR_DELIVERY;
import static com.pizzashowcase.order.domain.OrderStatus.READY;
import static org.assertj.core.api.Assertions.assertThat;

class OrderStatusTest {

    static Stream<Arguments> allowedDeliveryTransitions() {
        return Stream.of(
                Arguments.of(NEW, CONFIRMED),
                Arguments.of(NEW, IN_PREPARATION),
                Arguments.of(NEW, CANCELED),
                Arguments.of(CONFIRMED, IN_PREPARATION),
                Arguments.of(CONFIRMED, CANCELED),
                Arguments.of(IN_PREPARATION, READY),
                Arguments.of(IN_PREPARATION, CANCELED),
                Arguments.of(READY, OUT_FOR_DELIVERY),
                Arguments.of(READY, CANCELED),
                Arguments.of(OUT_FOR_DELIVERY, DELIVERED),
                Arguments.of(OUT_FOR_DELIVERY, CANCELED)
        );
    }

    static Stream<Arguments> allowedPickupTransitions() {
        return Stream.of(
                Arguments.of(NEW, CONFIRMED),
                Arguments.of(NEW, IN_PREPARATION),
                Arguments.of(NEW, CANCELED),
                Arguments.of(CONFIRMED, IN_PREPARATION),
                Arguments.of(CONFIRMED, CANCELED),
                Arguments.of(IN_PREPARATION, READY),
                Arguments.of(IN_PREPARATION, CANCELED),
                Arguments.of(READY, DELIVERED),
                Arguments.of(READY, CANCELED)
        );
    }

    @ParameterizedTest(name = "[DELIVERY] {0} -> {1} allowed")
    @MethodSource("allowedDeliveryTransitions")
    void allowsDeliveryHappyPathAndCancelFromAnyLiveState(OrderStatus from, OrderStatus to) {
        assertThat(from.canTransitionTo(to, DELIVERY)).isTrue();
    }

    @ParameterizedTest(name = "[PICKUP] {0} -> {1} allowed")
    @MethodSource("allowedPickupTransitions")
    void allowsPickupHappyPathAndCancelFromAnyLiveState(OrderStatus from, OrderStatus to) {
        assertThat(from.canTransitionTo(to, PICKUP)).isTrue();
    }

    @Test
    @DisplayName("PICKUP: READY -> OUT_FOR_DELIVERY is NOT allowed")
    void pickupCannotGoOutForDelivery() {
        assertThat(READY.canTransitionTo(OUT_FOR_DELIVERY, PICKUP)).isFalse();
    }

    @Test
    @DisplayName("DELIVERY: READY -> DELIVERED skips OUT_FOR_DELIVERY and is NOT allowed")
    void deliveryCannotSkipOutForDelivery() {
        assertThat(READY.canTransitionTo(DELIVERED, DELIVERY)).isFalse();
    }

    @Test
    @DisplayName("Cannot skip stages (NEW->READY, CONFIRMED->DELIVERED, ...)")
    void cannotSkipStages() {
        assertThat(NEW.canTransitionTo(READY, DELIVERY)).isFalse();
        assertThat(NEW.canTransitionTo(OUT_FOR_DELIVERY, DELIVERY)).isFalse();
        assertThat(NEW.canTransitionTo(DELIVERED, DELIVERY)).isFalse();
        assertThat(CONFIRMED.canTransitionTo(READY, DELIVERY)).isFalse();
        assertThat(CONFIRMED.canTransitionTo(OUT_FOR_DELIVERY, DELIVERY)).isFalse();
        assertThat(CONFIRMED.canTransitionTo(DELIVERED, DELIVERY)).isFalse();
        assertThat(IN_PREPARATION.canTransitionTo(OUT_FOR_DELIVERY, DELIVERY)).isFalse();
        assertThat(IN_PREPARATION.canTransitionTo(DELIVERED, DELIVERY)).isFalse();
    }

    @Test
    @DisplayName("AD-023: NEW -> IN_PREPARATION is allowed for both fulfillment types")
    void newCanGoDirectlyToInPreparation() {
        assertThat(NEW.canTransitionTo(IN_PREPARATION, DELIVERY)).isTrue();
        assertThat(NEW.canTransitionTo(IN_PREPARATION, PICKUP)).isTrue();
    }

    @Test
    @DisplayName("Cannot go backwards")
    void cannotGoBackwards() {
        assertThat(CONFIRMED.canTransitionTo(NEW, DELIVERY)).isFalse();
        assertThat(IN_PREPARATION.canTransitionTo(CONFIRMED, DELIVERY)).isFalse();
        assertThat(IN_PREPARATION.canTransitionTo(NEW, DELIVERY)).isFalse();
        assertThat(READY.canTransitionTo(IN_PREPARATION, DELIVERY)).isFalse();
        assertThat(READY.canTransitionTo(CONFIRMED, PICKUP)).isFalse();
        assertThat(OUT_FOR_DELIVERY.canTransitionTo(READY, DELIVERY)).isFalse();
        assertThat(DELIVERED.canTransitionTo(OUT_FOR_DELIVERY, DELIVERY)).isFalse();
        assertThat(DELIVERED.canTransitionTo(NEW, DELIVERY)).isFalse();
    }

    @Test
    @DisplayName("Self-transition is not allowed from any state, for any fulfillment type")
    void selfTransitionNotAllowed() {
        for (OrderStatus s : OrderStatus.values()) {
            assertThat(s.canTransitionTo(s, DELIVERY))
                    .as("self-transition %s (delivery)", s).isFalse();
            assertThat(s.canTransitionTo(s, PICKUP))
                    .as("self-transition %s (pickup)", s).isFalse();
        }
    }

    @Test
    @DisplayName("DELIVERED is terminal — no transitions allowed")
    void deliveredIsTerminal() {
        for (OrderStatus next : OrderStatus.values()) {
            assertThat(DELIVERED.canTransitionTo(next, DELIVERY))
                    .as("DELIVERED -> %s (delivery)", next).isFalse();
            assertThat(DELIVERED.canTransitionTo(next, PICKUP))
                    .as("DELIVERED -> %s (pickup)", next).isFalse();
        }
    }

    @Test
    @DisplayName("CANCELED is terminal — no transitions allowed")
    void canceledIsTerminal() {
        for (OrderStatus next : OrderStatus.values()) {
            assertThat(CANCELED.canTransitionTo(next, DELIVERY))
                    .as("CANCELED -> %s (delivery)", next).isFalse();
            assertThat(CANCELED.canTransitionTo(next, PICKUP))
                    .as("CANCELED -> %s (pickup)", next).isFalse();
        }
    }

    @Test
    @DisplayName("isTerminal is true only for DELIVERED and CANCELED")
    void isTerminalCoverage() {
        assertThat(DELIVERED.isTerminal()).isTrue();
        assertThat(CANCELED.isTerminal()).isTrue();
        assertThat(NEW.isTerminal()).isFalse();
        assertThat(CONFIRMED.isTerminal()).isFalse();
        assertThat(IN_PREPARATION.isTerminal()).isFalse();
        assertThat(READY.isTerminal()).isFalse();
        assertThat(OUT_FOR_DELIVERY.isTerminal()).isFalse();
    }

    @Test
    @DisplayName("null next status is not allowed")
    void nullNextIsNotAllowed() {
        assertThat(NEW.canTransitionTo(null, DELIVERY)).isFalse();
        assertThat(READY.canTransitionTo(null, PICKUP)).isFalse();
    }

    @Test
    @DisplayName("null fulfillment type is not allowed")
    void nullFulfillmentIsNotAllowed() {
        assertThat(NEW.canTransitionTo(CONFIRMED, null)).isFalse();
        assertThat(READY.canTransitionTo(OUT_FOR_DELIVERY, null)).isFalse();
    }

    @Test
    @DisplayName("Full matrix: every (from, to, ft) combo matches the expected allowed set")
    void fullMatrixCoverage() {
        for (FulfillmentType ft : FulfillmentType.values()) {
            Set<Pair> allowed = allowedSetFor(ft);
            for (OrderStatus from : OrderStatus.values()) {
                for (OrderStatus to : OrderStatus.values()) {
                    boolean expected = allowed.contains(new Pair(from, to));
                    assertThat(from.canTransitionTo(to, ft))
                            .as("%s -> %s (%s)", from, to, ft)
                            .isEqualTo(expected);
                }
            }
        }
    }

    private Set<Pair> allowedSetFor(FulfillmentType ft) {
        Set<Pair> set = new HashSet<>();
        set.add(new Pair(NEW, CONFIRMED));
        set.add(new Pair(NEW, IN_PREPARATION)); // AD-023
        set.add(new Pair(CONFIRMED, IN_PREPARATION));
        set.add(new Pair(IN_PREPARATION, READY));
        if (ft == DELIVERY) {
            set.add(new Pair(READY, OUT_FOR_DELIVERY));
            set.add(new Pair(OUT_FOR_DELIVERY, DELIVERED));
        } else {
            set.add(new Pair(READY, DELIVERED));
        }
        for (OrderStatus s : OrderStatus.values()) {
            if (!s.isTerminal()) {
                set.add(new Pair(s, CANCELED));
            }
        }
        return set;
    }

    private record Pair(OrderStatus from, OrderStatus to) {
    }
}
