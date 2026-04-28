package com.pizzashowcase.delivery.application;

import com.pizzashowcase.delivery.api.dto.CreateAreaRequest;
import com.pizzashowcase.delivery.api.dto.DeliveryZoneAreaDto;
import com.pizzashowcase.delivery.domain.DeliveryZone;
import com.pizzashowcase.delivery.domain.DeliveryZoneType;
import com.pizzashowcase.delivery.infrastructure.DeliveryZoneAreaRepository;
import com.pizzashowcase.delivery.infrastructure.DeliveryZoneRepository;
import com.pizzashowcase.order.infrastructure.OrderRepository;
import com.pizzashowcase.shared.error.ApiException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class DeliveryZoneAdminServiceTest {

    private DeliveryZoneRepository zoneRepository;
    private DeliveryZoneAreaRepository areaRepository;
    private OrderRepository orderRepository;
    private DeliveryZoneAdminService service;

    @BeforeEach
    void setUp() {
        zoneRepository = mock(DeliveryZoneRepository.class);
        areaRepository = mock(DeliveryZoneAreaRepository.class);
        orderRepository = mock(OrderRepository.class);
        service = new DeliveryZoneAdminService(zoneRepository, areaRepository, orderRepository);
        lenient().when(zoneRepository.save(any(DeliveryZone.class))).thenAnswer(inv -> inv.getArgument(0));
    }

    private DeliveryZone zone(String name, DeliveryZoneType type, String fee) {
        return new DeliveryZone(name, type, new BigDecimal(fee), true, 0);
    }

    @Test
    void test01_addAreaWithNullPostalCode_succeedsWhenNotExists() {
        DeliveryZone z = zone("Centrum", DeliveryZoneType.FREE, "0");
        when(zoneRepository.findById(1L)).thenReturn(Optional.of(z));
        when(areaRepository.existsByCityNormalizedAndPostalCodeIsNull("ndm")).thenReturn(false);

        DeliveryZoneAreaDto dto = service.addArea(1L, new CreateAreaRequest("NDM", null));

        assertThat(dto.city()).isEqualTo("NDM");
        assertThat(dto.postalCode()).isNull();
        verify(areaRepository).existsByCityNormalizedAndPostalCodeIsNull("ndm");
        verify(areaRepository, never()).existsByCityNormalizedAndPostalCode(any(), any());
    }

    @Test
    void test02_addAreaWithNullPostalCode_conflictsWhenAlreadyExists() {
        DeliveryZone z = zone("Modlin", DeliveryZoneType.PAID, "5");
        when(zoneRepository.findById(2L)).thenReturn(Optional.of(z));
        when(areaRepository.existsByCityNormalizedAndPostalCodeIsNull("ndm")).thenReturn(true);

        assertThatThrownBy(() -> service.addArea(2L, new CreateAreaRequest("NDM", null)))
                .isInstanceOf(ApiException.class)
                .hasFieldOrPropertyWithValue("status", HttpStatus.CONFLICT)
                .hasMessageContaining("ndm")
                .hasMessageContaining("*");
        verify(areaRepository).existsByCityNormalizedAndPostalCodeIsNull("ndm");
        verify(areaRepository, never()).existsByCityNormalizedAndPostalCode(any(), any());
    }

    @Test
    void test03_addAreaWithPostalCode_usesNonNullExistsCheck() {
        DeliveryZone z = zone("Modlin", DeliveryZoneType.PAID, "5");
        when(zoneRepository.findById(3L)).thenReturn(Optional.of(z));
        when(areaRepository.existsByCityNormalizedAndPostalCode("ndm", "05-160")).thenReturn(false);

        DeliveryZoneAreaDto dto = service.addArea(3L, new CreateAreaRequest("NDM", "05-160"));

        assertThat(dto.postalCode()).isEqualTo("05-160");
        verify(areaRepository).existsByCityNormalizedAndPostalCode("ndm", "05-160");
        verify(areaRepository, never()).existsByCityNormalizedAndPostalCodeIsNull(any());
    }

    @Test
    void test04_addAreaWithPostalCode_conflictsWhenExists() {
        DeliveryZone z = zone("Modlin", DeliveryZoneType.PAID, "5");
        when(zoneRepository.findById(4L)).thenReturn(Optional.of(z));
        when(areaRepository.existsByCityNormalizedAndPostalCode("ndm", "05-160")).thenReturn(true);

        assertThatThrownBy(() -> service.addArea(4L, new CreateAreaRequest("NDM", "05-160")))
                .isInstanceOf(ApiException.class)
                .hasFieldOrPropertyWithValue("status", HttpStatus.CONFLICT)
                .hasMessageContaining("05-160");
    }
}
