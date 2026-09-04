package br.com.dosecerta.repository;

import br.com.dosecerta.model.entity.Medication;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface MedicationRepository extends JpaRepository<Medication, UUID> {

    List<Medication> findAllByOrderByCreatedAtAsc();
}
