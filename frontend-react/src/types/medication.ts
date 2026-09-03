export type ReminderType = 'alarm' | 'notification';

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  intervalHours: number;
  durationDays: number;
  firstDose: string;
  reminderType: ReminderType;
  active: boolean;
  createdAt: string;
}

export type MedicationDraft = Pick<
  Medication,
  'name' | 'dosage' | 'intervalHours' | 'durationDays' | 'firstDose' | 'reminderType'
>;

export interface DoseReminder {
  id: string;
  medicationId: string;
  medicationName: string;
  dosage: string;
  time: string;
  reminderType: ReminderType;
  taken: boolean;
}

export interface Preferences {
  largeText: boolean;
}
