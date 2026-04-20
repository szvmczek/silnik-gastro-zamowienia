package com.pizzashowcase.order.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "order_number_sequence")
public class OrderNumberSequence {

    @Id
    @Column(nullable = false)
    private Integer year;

    @Column(name = "last_number", nullable = false)
    private int lastNumber;

    protected OrderNumberSequence() {
    }

    public OrderNumberSequence(Integer year, int lastNumber) {
        this.year = year;
        this.lastNumber = lastNumber;
    }

    public Integer getYear() {
        return year;
    }

    public int getLastNumber() {
        return lastNumber;
    }

    public int incrementAndGet() {
        this.lastNumber += 1;
        return this.lastNumber;
    }
}
