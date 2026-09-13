import type { Medication, MedicationDraft, Preferences } from '../types/medication';

export const MAX_MEDICATIONS = 100;
export const MAX_MEDICATION_NAME_LENGTH = 120;
export const MAX_DOSAGE_LENGTH = 60;

const record = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const text = (value: unknown, max: number): value is string =>
  typeof value === 'string' && value.trim().length > 0 && value.length <= max;
const integer = (value: unknown, max: number): boolean =>
  typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= max;

export function isMedication(value: unknown): value is Medication {
  if (!record(value) || !text(value.id, 100) || !isMedicationDraft(value)) return false;
  const complete = value as MedicationDraft & Record<string, unknown>;
  return typeof complete.active === 'boolean' && typeof complete.createdAt === 'string'
    && Number.isFinite(Date.parse(complete.createdAt));
}

export function isMedicationDraft(value: unknown): value is MedicationDraft {
  return record(value) && text(value.name, MAX_MEDICATION_NAME_LENGTH)
    && text(value.dosage, MAX_DOSAGE_LENGTH)
    && integer(value.intervalHours, 24) && integer(value.durationDays, 365)
    && typeof value.firstDose === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value.firstDose)
    && (value.reminderType === 'alarm' || value.reminderType === 'notification');
}

export const isMedicationList = (value: unknown): value is Medication[] =>
  Array.isArray(value) && value.length <= MAX_MEDICATIONS && value.every(isMedication)
  && new Set(value.map(item => item.id)).size === value.length;

export const isTakenDoseList = (value: unknown): value is string[] =>
  Array.isArray(value) && value.length <= 100000 && value.every(item => text(item, 160));

export const isPreferences = (value: unknown): value is Preferences =>
  record(value) && typeof value.largeText === 'boolean';
