package br.com.devl.mybooknotes.controller;

import java.time.Year;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import br.com.devl.mybooknotes.dto.MetricsResponseDTO;
import br.com.devl.mybooknotes.dto.ReadingGoalRequestDTO;
import br.com.devl.mybooknotes.service.MetricsService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

@RestController
@RequestMapping("/api/metrics")
public class MetricsController {

    private final MetricsService service;

    public MetricsController(MetricsService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<MetricsResponseDTO> getMetrics(@AuthenticationPrincipal Jwt jwt,
            @RequestParam(required = false) @Min(1000) @Max(9998) Integer year) {
        int selectedYear = year != null ? year : Year.now().getValue();
        return ResponseEntity.ok(service.getMetrics(userId(jwt), selectedYear));
    }

    @PutMapping("/goals/{year}")
    public ResponseEntity<Void> setGoal(@AuthenticationPrincipal Jwt jwt,
            @PathVariable @Min(1000) @Max(9998) int year, @Valid @RequestBody ReadingGoalRequestDTO request) {
        service.setGoal(userId(jwt), year, request.target());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/goals/{year}")
    public ResponseEntity<Void> deleteGoal(@AuthenticationPrincipal Jwt jwt,
            @PathVariable @Min(1000) @Max(9998) int year) {
        service.deleteGoal(userId(jwt), year);
        return ResponseEntity.noContent().build();
    }

    private static UUID userId(Jwt jwt) {
        return UUID.fromString(jwt.getSubject());
    }

}
