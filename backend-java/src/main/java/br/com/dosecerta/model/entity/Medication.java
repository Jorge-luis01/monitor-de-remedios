package br.com.dosecerta.model.entity;

import br.com.dosecerta.model.enums.MedicationStatus;
import br.com.dosecerta.model.enums.ReminderType;

import java.time.Instant;
import java.time.LocalTime;
import java.util.UUID;

public class Medication {

    private final UUID id;
    private final String name;
    private final String dosage;
    private final int intervalHours;
    private final int durationDays;
    private final LocalTime firstDose;
    private final ReminderType reminderType;
    private final Instant createdAt;
    private MedicationStatus status;

    public Medication(
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
        this.id = id;
        this.name = name;
        this.dosage = dosage;
        this.intervalHours = intervalHours;
        this.durationDays = durationDays;
        this.firstDose = firstDose;
        this.reminderType = reminderType;
        this.status = status;
        this.createdAt = createdAt;
    }

    public UUID getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getDosage() {
        return dosage;
    }

    public int getIntervalHours() {
        return intervalHours;
    }

    public int getDurationDays() {
        return durationDays;
    }

    public LocalTime getFirstDose() {
        return firstDose;
    }

    public ReminderType getReminderType() {
        return reminderType;
    }

    public MedicationStatus getStatus() {
        return status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void changeStatus(MedicationStatus newStatus) {
        this.status = newStatus;
    }
}
