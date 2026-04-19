package com.pizzashowcase.menu.domain;

import com.pizzashowcase.shared.domain.AuditableEntity;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import jakarta.persistence.Version;

import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Table(name = "addon_groups")
public class AddonGroup extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "min_select", nullable = false)
    private int minSelect = 0;

    @Column(name = "max_select", nullable = false)
    private int maxSelect = 1;

    @Column(nullable = false)
    private boolean required = false;

    @Version
    @Column(nullable = false)
    private Long version;

    @OneToMany(mappedBy = "addonGroup", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC, id ASC")
    private Set<Addon> addons = new LinkedHashSet<>();

    protected AddonGroup() {
    }

    public AddonGroup(String name, int minSelect, int maxSelect, boolean required) {
        this.name = name;
        this.minSelect = minSelect;
        this.maxSelect = maxSelect;
        this.required = required;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getMinSelect() {
        return minSelect;
    }

    public void setMinSelect(int minSelect) {
        this.minSelect = minSelect;
    }

    public int getMaxSelect() {
        return maxSelect;
    }

    public void setMaxSelect(int maxSelect) {
        this.maxSelect = maxSelect;
    }

    public boolean isRequired() {
        return required;
    }

    public void setRequired(boolean required) {
        this.required = required;
    }

    public Long getVersion() {
        return version;
    }

    public Set<Addon> getAddons() {
        return addons;
    }

    public void addAddon(Addon addon) {
        addons.add(addon);
        addon.setAddonGroup(this);
    }

    public void removeAddon(Addon addon) {
        addons.remove(addon);
        addon.setAddonGroup(null);
    }
}
