package br.com.dosecerta.service;

import br.com.dosecerta.dto.request.CreateMedicationRequest;
import br.com.dosecerta.dto.response.MedicationResponse;
import br.com.dosecerta.exception.MedicationNotFoundException;
import br.com.dosecerta.model.enums.MedicationStatus;
import br.com.dosecerta.model.enums.ReminderType;
import br.com.dosecerta.repository.InMemoryMedicationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class MedicationServiceTest {

    private MedicationService service;

    @BeforeEach
    void setUp() {
        service = new MedicationService(new InMemoryMedicationRepository());
    }

    @Test
    void shouldCreateAndListMedication() {
        MedicationResponse created = service.create(sampleRequest());

        assertEquals("Dipirona", created.name());
        assertEquals(MedicationStatus.ACTIVE, created.status());
        assertEquals(1, service.findAll().size());
    }

    @Test
    void shouldPauseMedication() {
        MedicationResponse created = service.create(sampleRequest());

        MedicationResponse paused = service.updateStatus(
                created.id(),
                MedicationStatus.PAUSED
        );

        assertEquals(MedicationStatus.PAUSED, paused.status());
    }

    @Test
    void shouldDeleteMedication() {
        MedicationResponse created = service.create(sampleRequest());

        service.delete(created.id());

        assertThrows(MedicationNotFoundException.class, () -> service.findById(created.id()));
    }

    private CreateMedicationRequest sampleRequest() {
        return new CreateMedicationRequest(
                "Dipirona",
                "500 mg",
                8,
                7,
                LocalTime.of(8, 0),
                ReminderType.ALARM
        );
    }
}
