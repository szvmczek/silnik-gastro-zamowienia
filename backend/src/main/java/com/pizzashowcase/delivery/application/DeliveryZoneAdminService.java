package com.pizzashowcase.delivery.application;

import com.pizzashowcase.delivery.api.dto.CreateAreaRequest;
import com.pizzashowcase.delivery.api.dto.CreateDeliveryZoneRequest;
import com.pizzashowcase.delivery.api.dto.DeliveryZoneAreaDto;
import com.pizzashowcase.delivery.api.dto.DeliveryZoneDto;
import com.pizzashowcase.delivery.api.dto.UpdateDeliveryZoneRequest;
import com.pizzashowcase.delivery.domain.DeliveryZone;
import com.pizzashowcase.delivery.domain.DeliveryZoneArea;
import com.pizzashowcase.delivery.domain.DeliveryZoneType;
import com.pizzashowcase.delivery.infrastructure.DeliveryZoneAreaRepository;
import com.pizzashowcase.delivery.infrastructure.DeliveryZoneRepository;
import com.pizzashowcase.order.infrastructure.OrderRepository;
import com.pizzashowcase.shared.error.ApiException;
import com.pizzashowcase.shared.util.AddressNormalizer;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;

@Service
public class DeliveryZoneAdminService {

    private final DeliveryZoneRepository zoneRepository;
    private final DeliveryZoneAreaRepository areaRepository;
    private final OrderRepository orderRepository;

    public DeliveryZoneAdminService(DeliveryZoneRepository zoneRepository,
                                    DeliveryZoneAreaRepository areaRepository,
                                    OrderRepository orderRepository) {
        this.zoneRepository = zoneRepository;
        this.areaRepository = areaRepository;
        this.orderRepository = orderRepository;
    }

    @Transactional(readOnly = true)
    public List<DeliveryZoneDto> list() {
        return zoneRepository.findAllWithAreas().stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public DeliveryZoneDto create(CreateDeliveryZoneRequest req) {
        validateTypeFee(req.type(), req.deliveryFee());
        boolean active = req.active() == null || req.active();
        DeliveryZone zone = new DeliveryZone(req.name().trim(), req.type(), req.deliveryFee(), active, 0);
        DeliveryZone saved = zoneRepository.save(zone);
        return toDto(saved);
    }

    @Transactional
    public DeliveryZoneDto update(Long id, UpdateDeliveryZoneRequest req) {
        DeliveryZone zone = zoneRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Strefa " + id + " nie istnieje."));

        if (req.name() != null) zone.setName(req.name().trim());
        if (req.type() != null) zone.setType(req.type());
        if (req.deliveryFee() != null) zone.setDeliveryFee(req.deliveryFee());
        if (req.active() != null) zone.setActive(req.active());

        validateTypeFee(zone.getType(), zone.getDeliveryFee());
        return toDto(zone);
    }

    @Transactional
    public boolean delete(Long id) {
        DeliveryZone zone = zoneRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Strefa " + id + " nie istnieje."));

        boolean hasAreas = !zone.getAreas().isEmpty();
        boolean referencedByOrders = orderRepository.existsByDeliveryZoneName(zone.getName());

        if (hasAreas || referencedByOrders) {
            zone.setActive(false);
            return false; // soft delete
        }
        zoneRepository.delete(zone);
        return true; // hard delete
    }

    @Transactional
    public DeliveryZoneAreaDto addArea(Long zoneId, CreateAreaRequest req) {
        DeliveryZone zone = zoneRepository.findById(zoneId)
                .orElseThrow(() -> ApiException.notFound("Strefa " + zoneId + " nie istnieje."));

        String cityNorm;
        String postalNorm;
        try {
            cityNorm = AddressNormalizer.normalizeCity(req.city());
            postalNorm = AddressNormalizer.normalizePostalCode(req.postalCode());
        } catch (IllegalArgumentException ex) {
            throw ApiException.unprocessable(ex.getMessage());
        }

        if (areaRepository.existsByCityNormalizedAndPostalCode(cityNorm, postalNorm)) {
            throw ApiException.conflict(
                    "Wpis (" + cityNorm + ", " + (postalNorm != null ? postalNorm : "*") + ") istnieje już w innej strefie.");
        }

        DeliveryZoneArea area = new DeliveryZoneArea(cityNorm, req.city().trim(), postalNorm);
        zone.addArea(area);
        DeliveryZone saved = zoneRepository.save(zone);
        DeliveryZoneArea persisted = saved.getAreas().stream()
                .filter(a -> equalsKey(a, cityNorm, postalNorm))
                .findFirst()
                .orElseThrow();
        return toAreaDto(persisted);
    }

    @Transactional
    public void deleteArea(Long zoneId, Long areaId) {
        DeliveryZone zone = zoneRepository.findById(zoneId)
                .orElseThrow(() -> ApiException.notFound("Strefa " + zoneId + " nie istnieje."));
        DeliveryZoneArea area = zone.getAreas().stream()
                .filter(a -> a.getId().equals(areaId))
                .findFirst()
                .orElseThrow(() -> ApiException.notFound("Obszar " + areaId + " nie należy do strefy " + zoneId + "."));
        zone.removeArea(area);
    }

    private void validateTypeFee(DeliveryZoneType type, BigDecimal fee) {
        if (type == DeliveryZoneType.PAID) {
            if (fee == null || fee.compareTo(BigDecimal.ZERO) <= 0) {
                throw ApiException.unprocessable("Strefa typu PAID wymaga deliveryFee > 0.");
            }
        } else {
            if (fee != null && fee.compareTo(BigDecimal.ZERO) != 0) {
                throw ApiException.unprocessable("Strefa typu " + type + " wymaga deliveryFee = 0.");
            }
        }
    }

    private static boolean equalsKey(DeliveryZoneArea a, String city, String postal) {
        if (!a.getCityNormalized().equals(city)) return false;
        if (postal == null) return a.getPostalCode() == null;
        return postal.equals(a.getPostalCode());
    }

    private DeliveryZoneDto toDto(DeliveryZone z) {
        List<DeliveryZoneAreaDto> areas = z.getAreas().stream()
                .sorted(Comparator.comparing(DeliveryZoneArea::getCityDisplay)
                        .thenComparing(a -> a.getPostalCode() == null ? "" : a.getPostalCode()))
                .map(this::toAreaDto)
                .toList();
        return new DeliveryZoneDto(z.getId(), z.getName(), z.getType(), z.getDeliveryFee(),
                z.isActive(), z.getDisplayOrder(), areas);
    }

    private DeliveryZoneAreaDto toAreaDto(DeliveryZoneArea a) {
        return new DeliveryZoneAreaDto(a.getId(), a.getCityDisplay(), a.getPostalCode());
    }
}
