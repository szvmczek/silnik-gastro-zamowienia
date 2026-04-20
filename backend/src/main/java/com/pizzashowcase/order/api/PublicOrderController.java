package com.pizzashowcase.order.api;

import com.pizzashowcase.order.api.dto.CreateOrderRequest;
import com.pizzashowcase.order.api.dto.OrderConfirmationDto;
import com.pizzashowcase.order.api.dto.OrderTrackingDto;
import com.pizzashowcase.order.application.CheckoutService;
import com.pizzashowcase.order.application.PublicOrderQueryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/public/orders")
public class PublicOrderController {

    private final CheckoutService checkoutService;
    private final PublicOrderQueryService publicOrderQueryService;

    public PublicOrderController(CheckoutService checkoutService,
                                 PublicOrderQueryService publicOrderQueryService) {
        this.checkoutService = checkoutService;
        this.publicOrderQueryService = publicOrderQueryService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrderConfirmationDto placeOrder(@Valid @RequestBody CreateOrderRequest request) {
        return checkoutService.placeOrder(request);
    }

    @GetMapping("/track/{token}")
    public OrderTrackingDto track(@PathVariable UUID token) {
        return publicOrderQueryService.findByToken(token);
    }
}
