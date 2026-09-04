package br.com.dosecerta.service;

import br.com.dosecerta.dto.request.CreateMedicationRequest;
import br.com.dosecerta.dto.response.MedicationResponse;
import br.com.dosecerta.exception.MedicationNotFoundException;
import br.com.dosecerta.model.entity.Medication;
import br.com.dosecerta.model.enums.MedicationStatus;
import br.com.dosecerta.repository.MedicationRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class MedicationService {

    private final MedicationRepository repository;

    public MedicationService(MedicationRepository repository) {
        this.repository = repository;
    }

    public MedicationResponse create(CreateMedicationRequest request) {
        Medication medication = new Medication(
                UUID.randomUUID(),
                request.name().trim(),
                request.dosage().trim(),
                request.intervalHours(),
                request.durationDays(),
                request.firstDose(),
                request.reminderType(),
                MedicationStatus.ACTIVE,
                Instant.now()
        );

        return MedicationResponse.from(repository.save(medication));
    }

    public List<MedicationResponse> findAll() {
        return repository.findAllByOrderByCreatedAtAsc().stream()
                .map(MedicationResponse::from)
                .toList();
    }

    public MedicationResponse findById(UUID id) {
        return MedicationResponse.from(findEntity(id));
    }

    public MedicationResponse updateStatus(UUID id, MedicationStatus status) {
        Medication medication = findEntity(id);
        medication.changeStatus(status);
        return MedicationResponse.from(repository.save(medication));
    }

    public void delete(UUID id) {
        findEntity(id);
        repository.deleteById(id);
    }

    private Medication findEntity(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new MedicationNotFoundException(id));
    }
}
