package br.com.dosecerta.dto.request;

import br.com.dosecerta.model.enums.MedicationStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateMedicationStatusRequest(
        @NotNull MedicationStatus status
) {
}
