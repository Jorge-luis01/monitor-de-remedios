package br.com.dosecerta.exception;

import java.util.UUID;

public class MedicationNotFoundException extends RuntimeException {

    public MedicationNotFoundException(UUID id) {
        super("Medicamento não encontrado: " + id);
    }
}
