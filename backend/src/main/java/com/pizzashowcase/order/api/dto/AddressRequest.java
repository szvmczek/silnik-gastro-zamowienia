package com.pizzashowcase.order.api.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record AddressRequest(
        @Size(max = 150) String street,
        @Size(max = 20) String buildingNumber,
        @Size(max = 20) String apartmentNumber,
        @Size(max = 10) @Pattern(regexp = "^$|^\\d{2}-\\d{3}$", message = "postalCode musi być w formacie XX-XXX") String postalCode,
        @Size(max = 80) String city,
        @Size(max = 255) String notes
) {
}
