import type { DoseReminder, Medication } from '../types/medication';

const MINUTES_PER_DAY = 24 * 60;

function timeToMinutes(time: string): number {
  const [hours = 0, minutes = 0] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(totalMinutes: number): string {
  const normalized = ((totalMinutes % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function getDosePreview(firstDose: string, intervalHours: number, count = 4): string[] {
  const firstDoseMinutes = timeToMinutes(firstDose);
  return Array.from({ length: count }, (_, index) =>
    minutesToTime(firstDoseMinutes + index * intervalHours * 60),
  );
}

export function getTodayKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTodayLabel(): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'long',
  }).format(new Date());
}

export function buildTodayReminders(
  medications: Medication[],
  takenDoseIds: string[],
): DoseReminder[] {
  const today = getTodayKey();
  const taken = new Set(takenDoseIds);
  const startOfToday = new Date(`${today}T00:00:00`);

  return medications
    .filter((medication) => {
      const treatmentStart = new Date(medication.createdAt);
      treatmentStart.setHours(0, 0, 0, 0);
      const treatmentEnd = new Date(treatmentStart);
      treatmentEnd.setDate(treatmentEnd.getDate() + medication.durationDays - 1);
      return medication.active && startOfToday <= treatmentEnd;
    })
    .flatMap((medication) => {
      const dosesPerDay = Math.max(1, Math.floor(24 / medication.intervalHours));

      return getDosePreview(medication.firstDose, medication.intervalHours, dosesPerDay).map(
        (time) => {
          const id = `${medication.id}-${today}-${time}`;
          return {
            id,
            medicationId: medication.id,
            medicationName: medication.name,
            dosage: medication.dosage,
            time,
            reminderType: medication.reminderType,
            taken: taken.has(id),
          } satisfies DoseReminder;
        },
      );
    })
    .sort((a, b) => a.time.localeCompare(b.time));
}
