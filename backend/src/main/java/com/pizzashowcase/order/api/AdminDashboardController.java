package com.pizzashowcase.order.api;

import com.pizzashowcase.order.api.dto.admin.AdminDashboardStatsDto;
import com.pizzashowcase.order.api.dto.admin.AdminDashboardSummaryDto;
import com.pizzashowcase.order.application.AdminOrderQueryService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/dashboard")
@PreAuthorize("hasRole('ADMIN')")
public class AdminDashboardController {

    private final AdminOrderQueryService queryService;

    public AdminDashboardController(AdminOrderQueryService queryService) {
        this.queryService = queryService;
    }

    /**
     * @deprecated Faza 4.5: zostaje jako alias dla pre-4.5 frontendu.
     * Frontend Fazy 4.5 używa {@link #stats()}. Do usunięcia w przyszłej fazie
     * (tech debt zarejestrowany w docs/ROADMAP.md).
     */
    @Deprecated
    @GetMapping("/summary")
    public AdminDashboardSummaryDto summary() {
        return queryService.summary();
    }

    @GetMapping("/stats")
    public AdminDashboardStatsDto stats() {
        return queryService.stats();
    }
}
