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

@Entity
@Table(
    name = "product_addon_groups",
    uniqueConstraints = @UniqueConstraint(
        name = "uq_product_addon_groups_product_group",
        columnNames = {"product_id", "addon_group_id"}
    )
)
public class ProductAddonGroup extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "addon_group_id", nullable = false)
    private AddonGroup addonGroup;

    @Column(name = "display_order", nullable = false)
    private int displayOrder = 0;

    @Version
    @Column(nullable = false)
    private Long version;

    protected ProductAddonGroup() {
    }

    public ProductAddonGroup(Product product, AddonGroup addonGroup, int displayOrder) {
        this.product = product;
        this.addonGroup = addonGroup;
        this.displayOrder = displayOrder;
    }

    public Long getId() {
        return id;
    }

    public Product getProduct() {
        return product;
    }

    void setProduct(Product product) {
        this.product = product;
    }

    public AddonGroup getAddonGroup() {
        return addonGroup;
    }

    public void setAddonGroup(AddonGroup addonGroup) {
        this.addonGroup = addonGroup;
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
