package com.pizzashowcase.menu.domain;

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
import jakarta.persistence.UniqueConstraint;
import jakarta.persistence.Version;

import java.math.BigDecimal;

@Entity
@Table(
    name = "addons",
    uniqueConstraints = @UniqueConstraint(name = "uq_addons_group_name", columnNames = {"addon_group_id", "name"})
)
public class Addon extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "addon_group_id", nullable = false)
    private AddonGroup addonGroup;

    @Column(nullable = false, length = 80)
    private String name;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "display_order", nullable = false)
    private int displayOrder = 0;

    @Version
    @Column(nullable = false)
    private Long version;

    protected Addon() {
    }

    public Addon(AddonGroup addonGroup, String name, BigDecimal price, int displayOrder) {
        this.addonGroup = addonGroup;
        this.name = name;
        this.price = price;
        this.displayOrder = displayOrder;
    }

    public Long getId() {
        return id;
    }

    public AddonGroup getAddonGroup() {
        return addonGroup;
    }

    void setAddonGroup(AddonGroup addonGroup) {
        this.addonGroup = addonGroup;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public int getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(int displayOrder) {
        this.displayOrder = displayOrder;
    }

    public Long getVersion() {
        return version;
    }
}
