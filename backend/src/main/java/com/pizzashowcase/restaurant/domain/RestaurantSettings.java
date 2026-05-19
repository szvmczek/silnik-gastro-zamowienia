package com.pizzashowcase.restaurant.domain;

import com.pizzashowcase.shared.domain.AuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Version;

@Entity
@Table(name = "restaurant_settings")
public class RestaurantSettings extends AuditableEntity {

    public static final Long SINGLETON_ID = 1L;

    @Id
    private Long id;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(length = 200)
    private String tagline;

    @Column(name = "primary_color", nullable = false, length = 7)
    private String primaryColor;

    @Column(length = 40)
    private String phone;

    @Column(length = 200)
    private String email;

    @Column(name = "address_line", length = 200)
    private String addressLine;

    @Column(length = 100)
    private String city;

    @Column(name = "postal_code", length = 20)
    private String postalCode;

    @Column(name = "logo_url", length = 500)
    private String logoUrl;

    @Column(nullable = false, length = 3)
    private String currency = "PLN";

    @Column(name = "seo_description", length = 200)
    private String seoDescription;

    @Column(name = "google_maps_url", length = 500)
    private String googleMapsUrl;

    @Column(name = "social_facebook", length = 500)
    private String socialFacebook;

    @Column(name = "social_instagram", length = 500)
    private String socialInstagram;

    @Version
    @Column(nullable = false)
    private Long version;

    protected RestaurantSettings() {
    }

    public Long getVersion() {
        return version;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getTagline() {
        return tagline;
    }

    public void setTagline(String tagline) {
        this.tagline = tagline;
    }

    public String getPrimaryColor() {
        return primaryColor;
    }

    public void setPrimaryColor(String primaryColor) {
        this.primaryColor = primaryColor;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getAddressLine() {
        return addressLine;
    }

    public void setAddressLine(String addressLine) {
        this.addressLine = addressLine;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getPostalCode() {
        return postalCode;
    }

    public void setPostalCode(String postalCode) {
        this.postalCode = postalCode;
    }

    public String getLogoUrl() {
        return logoUrl;
    }

    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getSeoDescription() {
        return seoDescription;
    }

    public void setSeoDescription(String seoDescription) {
        this.seoDescription = seoDescription;
    }

    public String getGoogleMapsUrl() {
        return googleMapsUrl;
    }

    public void setGoogleMapsUrl(String googleMapsUrl) {
        this.googleMapsUrl = googleMapsUrl;
    }

    public String getSocialFacebook() {
        return socialFacebook;
    }

    public void setSocialFacebook(String socialFacebook) {
        this.socialFacebook = socialFacebook;
    }

    public String getSocialInstagram() {
        return socialInstagram;
    }

    public void setSocialInstagram(String socialInstagram) {
        this.socialInstagram = socialInstagram;
    }
}
