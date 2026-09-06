package br.com.dosecerta.dto.request;

import br.com.dosecerta.model.enums.ReminderType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalTime;

public record UpdateMedicationRequest(
        @NotBlank @Size(max = 120) String name,
        @NotBlank @Size(max = 60) String dosage,
        @Min(1) @Max(24) int intervalHours,
        @Min(1) @Max(365) int durationDays,
        @NotNull LocalTime firstDose,
        @NotNull ReminderType reminderType
) {
}
