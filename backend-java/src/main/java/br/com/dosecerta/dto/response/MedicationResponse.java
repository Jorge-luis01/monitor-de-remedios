package br.com.dosecerta.dto.response;

import br.com.dosecerta.model.enums.MedicationStatus;
import br.com.dosecerta.model.enums.ReminderType;
import br.com.dosecerta.model.entity.Medication;

import java.time.Instant;
import java.time.LocalTime;
import java.util.UUID;

public record MedicationResponse(
        UUID id,
        String name,
        String dosage,
        int intervalHours,
        int durationDays,
        LocalTime firstDose,
        ReminderType reminderType,
        MedicationStatus status,
        Instant createdAt
) {
    public static MedicationResponse from(Medication medication) {
        return new MedicationResponse(
                medication.getId(),
                medication.getName(),
                medication.getDosage(),
                medication.getIntervalHours(),
                medication.getDurationDays(),
                medication.getFirstDose(),
                medication.getReminderType(),
                medication.getStatus(),
                medication.getCreatedAt()
        );
    }
}
