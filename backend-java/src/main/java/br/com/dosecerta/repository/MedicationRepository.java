package br.com.dosecerta.repository;

import br.com.dosecerta.model.entity.Medication;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MedicationRepository {

    Medication save(Medication medication);

    List<Medication> findAll();

    Optional<Medication> findById(UUID id);

    void deleteById(UUID id);
}
