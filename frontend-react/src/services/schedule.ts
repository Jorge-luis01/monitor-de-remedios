import type { DoseReminder, Medication } from '../types/medication';
import { isMedication } from './validation';

const HOUR_MS = 60 * 60 * 1000;
export const MAX_SCHEDULED_REMINDERS = 1000;
const pad = (value: number): string => String(value).padStart(2, '0');
const dateKey = (date: Date): string => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const timeKey = (date: Date): string => `${pad(date.getHours())}:${pad(date.getMinutes())}`;

export function getDosePreview(firstDose: string, intervalHours: number, count = 4): string[] {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(firstDose) || !Number.isInteger(intervalHours)
    || intervalHours < 1 || intervalHours > 24 || !Number.isInteger(count) || count < 1 || count > 100) return [];
  const [hour = 0, minute = 0] = firstDose.split(':').map(Number);
  return Array.from({ length: count }, (_, index) => `${pad((hour + index * intervalHours) % 24)}:${pad(minute)}`);
}

export function getTodayKey(): string { return dateKey(new Date()); }
export function getTodayLabel(): string {
  return new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long' }).format(new Date());
}

export interface ScheduledNativeReminder {
  id: string;
  medicationName: string;
  dosage: string;
  reminderType: Medication['reminderType'];
  triggerAt: number;
}

// One timeline for both the screen and Android; intervals are elapsed hours.
function dosesBetween(medication: Medication, from: number, until: number): ScheduledNativeReminder[] {
  if (!isMedication(medication) || !medication.active) return [];
  const start = new Date(medication.createdAt);
  const [hour = 0, minute = 0] = medication.firstDose.split(':').map(Number);
  start.setHours(hour, minute, 0, 0);
  const interval = medication.intervalHours * HOUR_MS;
  const count = Math.ceil(medication.durationDays * 24 / medication.intervalHours);
  const first = Math.max(0, Math.ceil((from - start.getTime()) / interval));
  const reminders: ScheduledNativeReminder[] = [];
  for (let index = first; index < count; index++) {
    const triggerAt = start.getTime() + index * interval;
    if (triggerAt >= until) break;
    const trigger = new Date(triggerAt);
    reminders.push({ id: `${medication.id}-${dateKey(trigger)}-${timeKey(trigger)}`,
      medicationName: medication.name, dosage: medication.dosage,
      reminderType: medication.reminderType, triggerAt });
  }
  return reminders;
}

export function buildTodayReminders(medications: Medication[], takenDoseIds: string[], now = new Date()): DoseReminder[] {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  const taken = new Set(takenDoseIds);
  return medications.flatMap(medication => dosesBetween(medication, start.getTime(), end.getTime())
    .map(dose => ({ id: dose.id, medicationId: medication.id, medicationName: dose.medicationName,
      dosage: dose.dosage, time: timeKey(new Date(dose.triggerAt)), reminderType: dose.reminderType,
      taken: taken.has(dose.id) })))
    .sort((first, second) => first.time.localeCompare(second.time));
}

interface DoseCursor {
  medication: Medication;
  start: number;
  interval: number;
  index: number;
  count: number;
}

function createCursor(medication: Medication, from: number): DoseCursor | null {
  if (!isMedication(medication) || !medication.active) return null;
  const start = new Date(medication.createdAt);
  const [hour = 0, minute = 0] = medication.firstDose.split(':').map(Number);
  start.setHours(hour, minute, 0, 0);
  const interval = medication.intervalHours * HOUR_MS;
  const count = Math.ceil(medication.durationDays * 24 / medication.intervalHours);
  const index = Math.max(0, Math.ceil((from - start.getTime()) / interval));
  return index < count
    ? { medication, start: start.getTime(), interval, index, count }
    : null;
}

export function buildScheduledReminders(
  medications: Medication[],
  now = new Date(),
  limit = MAX_SCHEDULED_REMINDERS + 1,
  excludedIds: ReadonlySet<string> = new Set(),
): ScheduledNativeReminder[] {
  if (!Number.isInteger(limit) || limit < 1) return [];
  const safeLimit = Math.min(limit, MAX_SCHEDULED_REMINDERS + 1);
  const cursors = medications
    .map((medication) => createCursor(medication, now.getTime() + 1))
    .filter((cursor): cursor is DoseCursor => cursor !== null);
  const reminders: ScheduledNativeReminder[] = [];

  while (cursors.length > 0 && reminders.length < safeLimit) {
    const firstCursor = cursors[0];
    if (!firstCursor) break;
    let nextIndex = 0;
    let nextTrigger = firstCursor.start + firstCursor.index * firstCursor.interval;
    for (let index = 1; index < cursors.length; index++) {
      const candidate = cursors[index];
      if (!candidate) continue;
      const trigger = candidate.start + candidate.index * candidate.interval;
      if (trigger < nextTrigger) {
        nextIndex = index;
        nextTrigger = trigger;
      }
    }

    const cursor = cursors[nextIndex];
    if (!cursor) break;
    const trigger = new Date(nextTrigger);
    const reminder: ScheduledNativeReminder = {
      id: `${cursor.medication.id}-${dateKey(trigger)}-${timeKey(trigger)}`,
      medicationName: cursor.medication.name,
      dosage: cursor.medication.dosage,
      reminderType: cursor.medication.reminderType,
      triggerAt: nextTrigger,
    };
    if (!excludedIds.has(reminder.id)) reminders.push(reminder);

    cursor.index++;
    if (cursor.index >= cursor.count) cursors.splice(nextIndex, 1);
  }

  return reminders;
}
