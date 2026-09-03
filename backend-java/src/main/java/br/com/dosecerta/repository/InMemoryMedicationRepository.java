package br.com.dosecerta.repository;

import br.com.dosecerta.model.entity.Medication;
import org.springframework.stereotype.Repository;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Repository
public class InMemoryMedicationRepository implements MedicationRepository {

    private final Map<UUID, Medication> medications = new ConcurrentHashMap<>();

    @Override
    public Medication save(Medication medication) {
        medications.put(medication.getId(), medication);
        return medication;
    }

    @Override
    public List<Medication> findAll() {
        return medications.values().stream()
                .sorted(Comparator.comparing(Medication::getCreatedAt))
                .toList();
    }

    @Override
    public Optional<Medication> findById(UUID id) {
        return Optional.ofNullable(medications.get(id));
    }

    @Override
    public void deleteById(UUID id) {
        medications.remove(id);
    }
}
