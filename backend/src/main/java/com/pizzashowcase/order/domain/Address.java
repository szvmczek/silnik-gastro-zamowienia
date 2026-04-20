package com.pizzashowcase.order.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

@Embeddable
public class Address {

    @Column(name = "delivery_street", length = 150)
    private String street;

    @Column(name = "delivery_building_number", length = 20)
    private String buildingNumber;

    @Column(name = "delivery_apartment_number", length = 20)
    private String apartmentNumber;

    @Column(name = "delivery_postal_code", length = 10)
    private String postalCode;

    @Column(name = "delivery_city", length = 80)
    private String city;

    @Column(name = "delivery_notes", length = 255)
    private String notes;

    protected Address() {
    }

    public Address(String street,
                   String buildingNumber,
                   String apartmentNumber,
                   String postalCode,
                   String city,
                   String notes) {
        this.street = street;
        this.buildingNumber = buildingNumber;
        this.apartmentNumber = apartmentNumber;
        this.postalCode = postalCode;
        this.city = city;
        this.notes = notes;
    }

    public static Address empty() {
        return new Address(null, null, null, null, null, null);
    }

    public String getStreet() {
        return street;
    }

    public String getBuildingNumber() {
        return buildingNumber;
    }

    public String getApartmentNumber() {
        return apartmentNumber;
    }

    public String getPostalCode() {
        return postalCode;
    }

    public String getCity() {
        return city;
    }

    public String getNotes() {
        return notes;
    }

    public boolean isEmpty() {
        return street == null && buildingNumber == null && apartmentNumber == null
                && postalCode == null && city == null && notes == null;
    }
}
