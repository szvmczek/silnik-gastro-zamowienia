package com.pizzashowcase.order.api.dto;

import com.pizzashowcase.order.domain.FulfillmentType;
import com.pizzashowcase.order.domain.PaymentMethod;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;

public record CreateOrderRequest(
        @NotBlank @Size(min = 2, max = 120) String customerName,
        @NotBlank @Pattern(regexp = "^\\+?\\d{9,11}$", message = "customerPhone musi być w formacie 9-11 cyfr (opcjonalnie z prefiksem +)") String customerPhone,
        @Email @Size(max = 160) String customerEmail,
        @NotNull FulfillmentType fulfillmentType,
        @NotNull PaymentMethod paymentMethod,
        @Valid AddressRequest deliveryAddress,
        @Size(max = 500) String customerNotes,
        // D-03: nominał, z którego klient chce resztę. null = odliczona kwota.
        @DecimalMin(value = "0.01") @Digits(integer = 8, fraction = 2) BigDecimal cashChangeFrom,
        @NotEmpty @Size(max = 50) @Valid List<CreateOrderItemRequest> items
) {
}
