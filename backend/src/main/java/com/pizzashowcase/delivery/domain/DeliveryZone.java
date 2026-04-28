package com.pizzashowcase.delivery.domain;

import com.pizzashowcase.shared.domain.AuditableEntity;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.Version;

import java.math.BigDecimal;
import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Table(name = "delivery_zone")
public class DeliveryZone extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 80)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private DeliveryZoneType type;

    @Column(name = "delivery_fee", nullable = false, precision = 10, scale = 2)
    private BigDecimal deliveryFee = BigDecimal.ZERO;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "display_order", nullable = false)
    private int displayOrder = 0;

    @Version
    @Column(nullable = false)
    private Long version;

    @OneToMany(mappedBy = "zone", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<DeliveryZoneArea> areas = new LinkedHashSet<>();

    protected DeliveryZone() {
    }

    public DeliveryZone(String name, DeliveryZoneType type, BigDecimal deliveryFee, boolean active, int displayOrder) {
        this.name = name;
        this.type = type;
        this.deliveryFee = deliveryFee != null ? deliveryFee : BigDecimal.ZERO;
        this.active = active;
        this.displayOrder = displayOrder;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public DeliveryZoneType getType() { return type; }
    public void setType(DeliveryZoneType type) { this.type = type; }
    public BigDecimal getDeliveryFee() { return deliveryFee; }
    public void setDeliveryFee(BigDecimal deliveryFee) { this.deliveryFee = deliveryFee; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public int getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(int displayOrder) { this.displayOrder = displayOrder; }
    public Long getVersion() { return version; }
    public Set<DeliveryZoneArea> getAreas() { return areas; }

    public void addArea(DeliveryZoneArea area) {
        areas.add(area);
        area.setZone(this);
    }

    public void removeArea(DeliveryZoneArea area) {
        areas.remove(area);
        area.setZone(null);
    }
}
