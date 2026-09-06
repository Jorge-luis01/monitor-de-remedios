package br.com.dosecerta.controller;

import br.com.dosecerta.dto.request.CreateMedicationRequest;
import br.com.dosecerta.dto.request.UpdateMedicationRequest;
import br.com.dosecerta.dto.request.UpdateMedicationStatusRequest;
import br.com.dosecerta.dto.response.MedicationResponse;
import br.com.dosecerta.service.MedicationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/medications")
public class MedicationController {

    private final MedicationService service;

    public MedicationController(MedicationService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<MedicationResponse> create(
            @Valid @RequestBody CreateMedicationRequest request
    ) {
        MedicationResponse medication = service.create(request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(medication.id())
                .toUri();

        return ResponseEntity.created(location).body(medication);
    }

    @GetMapping
    public List<MedicationResponse> findAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public MedicationResponse findById(@PathVariable UUID id) {
        return service.findById(id);
    }

    @PutMapping("/{id}")
    public MedicationResponse update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateMedicationRequest request
    ) {
        return service.update(id, request);
    }

    @PatchMapping("/{id}/status")
    public MedicationResponse updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateMedicationStatusRequest request
    ) {
        return service.updateStatus(id, request.status());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
