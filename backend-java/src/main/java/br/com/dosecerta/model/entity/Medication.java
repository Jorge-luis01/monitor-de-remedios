package br.com.dosecerta.model.entity;

import br.com.dosecerta.model.enums.MedicationStatus;
import br.com.dosecerta.model.enums.ReminderType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "medications")
public class Medication {

    @Id
    private UUID id;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(nullable = false, length = 60)
    private String dosage;

    @Column(name = "interval_hours", nullable = false)
    private int intervalHours;

    @Column(name = "duration_days", nullable = false)
    private int durationDays;

    @Column(name = "first_dose", nullable = false)
    private LocalTime firstDose;

    @Enumerated(EnumType.STRING)
    @Column(name = "reminder_type", nullable = false, length = 20)
    private ReminderType reminderType;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MedicationStatus status;

    protected Medication() {
    }

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

    public void update(
            String name,
            String dosage,
            int intervalHours,
            int durationDays,
            LocalTime firstDose,
            ReminderType reminderType
    ) {
        this.name = name;
        this.dosage = dosage;
        this.intervalHours = intervalHours;
        this.durationDays = durationDays;
        this.firstDose = firstDose;
        this.reminderType = reminderType;
    }
}
