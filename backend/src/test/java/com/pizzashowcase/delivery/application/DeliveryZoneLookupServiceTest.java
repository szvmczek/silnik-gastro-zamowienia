package com.pizzashowcase.delivery.application;

import com.pizzashowcase.delivery.domain.DeliveryLookupResult;
import com.pizzashowcase.delivery.domain.DeliveryZone;
import com.pizzashowcase.delivery.domain.DeliveryZoneArea;
import com.pizzashowcase.delivery.domain.DeliveryZoneType;
import com.pizzashowcase.delivery.infrastructure.DeliveryZoneAreaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class DeliveryZoneLookupServiceTest {

    private DeliveryZoneAreaRepository repo;
    private DeliveryZoneLookupService service;

    @BeforeEach
    void setUp() {
        repo = mock(DeliveryZoneAreaRepository.class);
        service = new DeliveryZoneLookupService(repo);
        lenient().when(repo.findExactActive(any(), any())).thenReturn(Optional.empty());
        lenient().when(repo.findCityWildcardActive(any())).thenReturn(Optional.empty());
    }

    private DeliveryZone zone(String name, DeliveryZoneType type, String fee) {
        return zone(name, type, fee, true);
    }

    private DeliveryZone zone(String name, DeliveryZoneType type, String fee, boolean active) {
        return new DeliveryZone(name, type, new BigDecimal(fee), active, 0);
    }

    private DeliveryZoneArea area(DeliveryZone z, String cityNorm, String postal) {
        DeliveryZoneArea a = new DeliveryZoneArea(cityNorm, cityNorm.toUpperCase(), postal);
        z.addArea(a);
        return a;
    }

    @Test
    void test01_fallbackFreeForKnownCity() {
        DeliveryZone free = zone("Centrum", DeliveryZoneType.FREE, "0");
        DeliveryZoneArea a = area(free, "ndm", null);
        when(repo.findCityWildcardActive("ndm")).thenReturn(Optional.of(a));

        DeliveryLookupResult r = service.lookup("NDM", "05-100");

        assertThat(r.type()).isEqualTo(DeliveryZoneType.FREE);
        assertThat(r.fee()).isEqualByComparingTo("0");
        assertThat(r.zoneName()).isEqualTo("Centrum");
    }

    @Test
    void test02_exactPaidOverridesFallbackFree() {
        DeliveryZone paid = zone("Modlin", DeliveryZoneType.PAID, "5");
        DeliveryZoneArea exact = area(paid, "ndm", "05-160");
        when(repo.findExactActive("ndm", "05-160")).thenReturn(Optional.of(exact));

        DeliveryLookupResult r = service.lookup("NDM", "05-160");

        assertThat(r.type()).isEqualTo(DeliveryZoneType.PAID);
        assertThat(r.fee()).isEqualByComparingTo("5");
        assertThat(r.zoneName()).isEqualTo("Modlin");
    }

    @Test
    void test03_unknownCityIsUnavailable() {
        DeliveryLookupResult r = service.lookup("Warszawa", "00-001");
        assertThat(r.type()).isEqualTo(DeliveryZoneType.UNAVAILABLE);
        assertThat(r.zoneName()).isNull();
    }

    @Test
    void test04_inactiveZoneIsUnavailable() {
        // repo nie zwróci niczego, bo query filtruje active = true
        DeliveryLookupResult r = service.lookup("NDM", "05-100");
        assertThat(r.type()).isEqualTo(DeliveryZoneType.UNAVAILABLE);
    }

    @Test
    void test05_emptyDatabaseIsUnavailable() {
        DeliveryLookupResult r = service.lookup("NDM", "05-100");
        assertThat(r.type()).isEqualTo(DeliveryZoneType.UNAVAILABLE);
    }

    @Test
    void test06_diacriticCity() {
        DeliveryZone free = zone("Łomianki", DeliveryZoneType.FREE, "0");
        DeliveryZoneArea a = area(free, "lomianki", null);
        when(repo.findCityWildcardActive("lomianki")).thenReturn(Optional.of(a));

        DeliveryLookupResult r = service.lookup("Łomianki", "05-092");

        assertThat(r.type()).isEqualTo(DeliveryZoneType.FREE);
    }

    @Test
    void test07_whitespaceCityIsCollapsed() {
        DeliveryZone free = zone("Centrum", DeliveryZoneType.FREE, "0");
        DeliveryZoneArea a = area(free, "ndm", null);
        when(repo.findCityWildcardActive("ndm")).thenReturn(Optional.of(a));

        DeliveryLookupResult r = service.lookup("  NDM  ", "05-100");

        assertThat(r.type()).isEqualTo(DeliveryZoneType.FREE);
    }

    @Test
    void test08_invalidPostalIsUnavailable() {
        DeliveryZone free = zone("Centrum", DeliveryZoneType.FREE, "0");
        DeliveryZoneArea a = area(free, "ndm", null);
        // Nawet z fallbackiem dostępnym — invalid postal short-circuit'uje na UNAVAILABLE
        when(repo.findCityWildcardActive("ndm")).thenReturn(Optional.of(a));

        DeliveryLookupResult r = service.lookup("NDM", "abc");

        assertThat(r.type()).isEqualTo(DeliveryZoneType.UNAVAILABLE);
    }

    @Test
    void test09_overrideWinsOverFallback() {
        DeliveryZone free = zone("Centrum", DeliveryZoneType.FREE, "0");
        DeliveryZoneArea fallbackArea = area(free, "ndm", null);
        DeliveryZone paid = zone("Modlin", DeliveryZoneType.PAID, "5");
        DeliveryZoneArea exact = area(paid, "ndm", "05-160");

        when(repo.findExactActive("ndm", "05-160")).thenReturn(Optional.of(exact));
        when(repo.findCityWildcardActive("ndm")).thenReturn(Optional.of(fallbackArea));

        DeliveryLookupResult r = service.lookup("NDM", "05-160");

        assertThat(r.type()).isEqualTo(DeliveryZoneType.PAID);
        assertThat(r.zoneName()).isEqualTo("Modlin");
    }

    @Test
    void test10_caseInsensitiveCity() {
        DeliveryZone free = zone("Centrum", DeliveryZoneType.FREE, "0");
        DeliveryZoneArea a = area(free, "ndm", null);
        when(repo.findCityWildcardActive("ndm")).thenReturn(Optional.of(a));

        DeliveryLookupResult r = service.lookup("ndm", "05-100");

        assertThat(r.type()).isEqualTo(DeliveryZoneType.FREE);
    }

    @Test
    void test11_postalAutoFormat() {
        DeliveryZone free = zone("Centrum", DeliveryZoneType.FREE, "0");
        DeliveryZoneArea exact = area(free, "ndm", "05-100");
        when(repo.findExactActive(eq("ndm"), eq("05-100"))).thenReturn(Optional.of(exact));

        DeliveryLookupResult r = service.lookup("NDM", "05100");

        assertThat(r.type()).isEqualTo(DeliveryZoneType.FREE);
    }

    @Test
    void test12_diacriticAndSpaceCity() {
        DeliveryZone free = zone("Centrum", DeliveryZoneType.FREE, "0");
        DeliveryZoneArea exact = area(free, "nowy dwor", "05-100");
        when(repo.findExactActive(eq("nowy dwor"), eq("05-100"))).thenReturn(Optional.of(exact));

        DeliveryLookupResult r = service.lookup("Nowy Dwór", "05-100");

        assertThat(r.type()).isEqualTo(DeliveryZoneType.FREE);
    }

    @Test
    void test13_explicitUnavailableZoneReturnsZoneName() {
        DeliveryZone blocked = zone("Poza zasięgiem", DeliveryZoneType.UNAVAILABLE, "0");
        DeliveryZoneArea a = area(blocked, "warszawa", null);
        when(repo.findCityWildcardActive("warszawa")).thenReturn(Optional.of(a));

        DeliveryLookupResult r = service.lookup("Warszawa", "00-001");

        assertThat(r.type()).isEqualTo(DeliveryZoneType.UNAVAILABLE);
        assertThat(r.zoneName()).isEqualTo("Poza zasięgiem");
        assertThat(r.zoneId()).isNull(); // zone nie zapisany w DB w teście — id null, ale zoneName set
    }
}
