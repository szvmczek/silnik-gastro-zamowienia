package com.pizzashowcase.order.infrastructure;

import com.pizzashowcase.order.domain.OrderEdit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OrderEditRepository extends JpaRepository<OrderEdit, Long> {

    /** Historia do detalu zamówienia — od najnowszej edycji. */
    List<OrderEdit> findByOrderIdOrderByEditedAtDescIdDesc(Long orderId);

    /**
     * Wpis, który cofa przycisk „Cofnij ostatnią zmianę": najnowszy
     * jeszcze niecofnięty. Cofanie jest łańcuchowe — po cofnięciu tego
     * wpisu ta sama metoda zwróci edycję wcześniejszą.
     */
    Optional<OrderEdit> findFirstByOrderIdAndUndoneAtIsNullOrderByEditedAtDescIdDesc(Long orderId);
}
