package com.pizzashowcase.delivery.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(name = "delivery_zone_area")
public class DeliveryZoneArea {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "zone_id", nullable = false)
    private DeliveryZone zone;

    @Column(name = "city_normalized", nullable = false, length = 120)
    private String cityNormalized;

    @Column(name = "city_display", nullable = false, length = 120)
    private String cityDisplay;

    @Column(name = "postal_code", length = 6)
    private String postalCode;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected DeliveryZoneArea() {
    }

    public DeliveryZoneArea(String cityNormalized, String cityDisplay, String postalCode) {
        this.cityNormalized = cityNormalized;
        this.cityDisplay = cityDisplay;
        this.postalCode = postalCode;
    }

    public Long getId() { return id; }
    public DeliveryZone getZone() { return zone; }
    public void setZone(DeliveryZone zone) { this.zone = zone; }
    public String getCityNormalized() { return cityNormalized; }
    public String getCityDisplay() { return cityDisplay; }
    public String getPostalCode() { return postalCode; }
    public Instant getCreatedAt() { return createdAt; }
}
