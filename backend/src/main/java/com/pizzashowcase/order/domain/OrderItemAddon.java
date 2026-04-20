package com.pizzashowcase.order.domain;

import com.pizzashowcase.shared.domain.AuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.math.BigDecimal;

@Entity
@Table(name = "order_item_addons")
public class OrderItemAddon extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_item_id", nullable = false)
    private OrderItem orderItem;

    @Column(name = "addon_id", nullable = false)
    private Long addonId;

    @Column(name = "addon_group_name_snapshot", nullable = false, length = 100)
    private String addonGroupNameSnapshot;

    @Column(name = "addon_name_snapshot", nullable = false, length = 80)
    private String addonNameSnapshot;

    @Column(name = "unit_price_snapshot", nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPriceSnapshot;

    protected OrderItemAddon() {
    }

    public OrderItemAddon(Long addonId,
                          String addonGroupNameSnapshot,
                          String addonNameSnapshot,
                          BigDecimal unitPriceSnapshot) {
        this.addonId = addonId;
        this.addonGroupNameSnapshot = addonGroupNameSnapshot;
        this.addonNameSnapshot = addonNameSnapshot;
        this.unitPriceSnapshot = unitPriceSnapshot;
    }

    public Long getId() {
        return id;
    }

    public OrderItem getOrderItem() {
        return orderItem;
    }

    void setOrderItem(OrderItem orderItem) {
        this.orderItem = orderItem;
    }

    public Long getAddonId() {
        return addonId;
    }

    public String getAddonGroupNameSnapshot() {
        return addonGroupNameSnapshot;
    }

    public String getAddonNameSnapshot() {
        return addonNameSnapshot;
    }

    public BigDecimal getUnitPriceSnapshot() {
        return unitPriceSnapshot;
    }
}
