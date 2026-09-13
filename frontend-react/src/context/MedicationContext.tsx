import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { hasStorageErrors, readStorage, writeStorage } from '../services/storage';
import { buildScheduledReminders, MAX_SCHEDULED_REMINDERS } from '../services/schedule';
import {
  isMedication,
  isMedicationList,
  isPreferences,
  isTakenDoseList,
} from '../services/validation';
import {
  requestInitialNotificationPermission,
  syncNativeReminders,
} from '../services/androidReminders';
import type { Medication, MedicationDraft, Preferences } from '../types/medication';

const MEDICATIONS_KEY = 'dose-certa:medications';
const TAKEN_DOSES_KEY = 'dose-certa:taken-doses';
const PREFERENCES_KEY = 'dose-certa:preferences';
const REMINDER_SYNC_DELAY_MS = 150;

const initialMedications: Medication[] = [];

const initialPreferences: Preferences = {
  largeText: false,
};

interface MedicationContextValue {
  storageError: boolean;
  reminderError: boolean;
  operationError: string;
  medications: Medication[];
  takenDoseIds: string[];
  preferences: Preferences;
  addMedication: (draft: MedicationDraft) => boolean;
  toggleMedication: (id: string) => boolean;
  removeMedication: (id: string) => boolean;
  markDoseAsTaken: (id: string) => boolean;
  updatePreference: <Key extends keyof Preferences>(key: Key, value: Preferences[Key]) => boolean;
}

const MedicationContext = createContext<MedicationContextValue | null>(null);

function createMedicationId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `med-${Date.now()}`;
}

function exceedsNativeReminderLimit(medications: Medication[], takenDoseIds: string[]): boolean {
  return buildScheduledReminders(
    medications,
    new Date(),
    MAX_SCHEDULED_REMINDERS + 1,
    new Set(takenDoseIds),
  ).length > MAX_SCHEDULED_REMINDERS;
}

export function MedicationProvider({ children }: { children: ReactNode }) {
  const [medications, setMedications] = useState<Medication[]>(() =>
    readStorage(MEDICATIONS_KEY, initialMedications, isMedicationList),
  );
  const [takenDoseIds, setTakenDoseIds] = useState<string[]>(() =>
    readStorage(TAKEN_DOSES_KEY, [], isTakenDoseList),
  );
  const [preferences, setPreferences] = useState<Preferences>(() =>
    readStorage(PREFERENCES_KEY, initialPreferences, isPreferences),
  );

  const [storageError, setStorageError] = useState(hasStorageErrors);
  const [reminderError, setReminderError] = useState(false);
  const [operationError, setOperationError] = useState('');

  useEffect(() => {
    void requestInitialNotificationPermission();
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (hasStorageErrors(MEDICATIONS_KEY, TAKEN_DOSES_KEY)
        || !isMedicationList(medications) || !isTakenDoseList(takenDoseIds)) return;
      void syncNativeReminders(medications, takenDoseIds)
        .then(() => setReminderError(false))
        .catch(() => setReminderError(true));
    }, REMINDER_SYNC_DELAY_MS);

    return () => window.clearTimeout(timeoutId);
  }, [medications, takenDoseIds]);

  useEffect(() => {
    document.documentElement.classList.toggle('large-text', preferences.largeText);
  }, [preferences.largeText]);

  const value = useMemo<MedicationContextValue>(
    () => ({
      storageError,
      reminderError,
      operationError,
      medications,
      takenDoseIds,
      preferences,
      addMedication: (draft) => {
        const medication: Medication = {
          ...draft,
          id: createMedicationId(),
          active: true,
          createdAt: new Date().toISOString(),
        };
        const next = [...medications, medication];
        if (!isMedication(medication) || !isMedicationList(next)) {
          setOperationError('Os dados do medicamento são inválidos ou o limite de cadastros foi atingido.');
          return false;
        }
        if (exceedsNativeReminderLimit(next, takenDoseIds)) {
          setOperationError(`O cadastro ultrapassaria o limite de ${MAX_SCHEDULED_REMINDERS} lembretes futuros. Reduza a duração ou pause outro tratamento.`);
          return false;
        }
        if (!writeStorage(MEDICATIONS_KEY, next)) {
          setStorageError(true);
          setOperationError('Não foi possível salvar o medicamento. Nenhum alarme foi alterado.');
          return false;
        }
        setMedications(next);
        setStorageError(hasStorageErrors());
        setOperationError('');
        return true;
      },
      toggleMedication: (id) => {
        const selected = medications.find((medication) => medication.id === id);
        if (!selected) return false;
        const next = medications.map((medication) =>
          medication.id === id ? { ...medication, active: !medication.active } : medication);
        const resuming = !selected.active;
        if (!isMedicationList(next) || (resuming && exceedsNativeReminderLimit(next, takenDoseIds))) {
          setOperationError(`Não foi possível retomar: o cronograma ultrapassaria ${MAX_SCHEDULED_REMINDERS} lembretes futuros.`);
          return false;
        }
        if (!writeStorage(MEDICATIONS_KEY, next)) {
          setStorageError(true);
          setOperationError('Não foi possível salvar a alteração. Os alarmes foram preservados.');
          return false;
        }
        setMedications(next);
        setStorageError(hasStorageErrors());
        setOperationError('');
        return true;
      },
      removeMedication: (id) => {
        if (!medications.some((medication) => medication.id === id)) return false;
        const nextMedications = medications.filter((medication) => medication.id !== id);
        const nextTakenDoseIds = takenDoseIds.filter((doseId) => !doseId.startsWith(`${id}-`));
        const takenChanged = nextTakenDoseIds.length !== takenDoseIds.length;
        if (takenChanged && !writeStorage(TAKEN_DOSES_KEY, nextTakenDoseIds)) {
          setStorageError(true);
          setOperationError('Não foi possível salvar a exclusão. Os dados e alarmes foram preservados.');
          return false;
        }
        if (!writeStorage(MEDICATIONS_KEY, nextMedications)) {
          if (takenChanged) writeStorage(TAKEN_DOSES_KEY, takenDoseIds);
          setStorageError(true);
          setOperationError('Não foi possível salvar a exclusão. Os dados e alarmes foram preservados.');
          return false;
        }
        setMedications(nextMedications);
        if (takenChanged) setTakenDoseIds(nextTakenDoseIds);
        setStorageError(hasStorageErrors());
        setOperationError('');
        return true;
      },
      markDoseAsTaken: (id) => {
        if (takenDoseIds.includes(id)) return true;
        const next = [...takenDoseIds, id];
        if (!isTakenDoseList(next) || !writeStorage(TAKEN_DOSES_KEY, next)) {
          setStorageError(true);
          setOperationError('Não foi possível registrar a dose. Os alarmes foram preservados.');
          return false;
        }
        setTakenDoseIds(next);
        setStorageError(hasStorageErrors());
        setOperationError('');
        return true;
      },
      updatePreference: (key, preferenceValue) => {
        const next = { ...preferences, [key]: preferenceValue };
        if (!isPreferences(next) || !writeStorage(PREFERENCES_KEY, next)) {
          setStorageError(true);
          setOperationError('Não foi possível salvar a preferência.');
          return false;
        }
        setPreferences(next);
        setStorageError(hasStorageErrors());
        setOperationError('');
        return true;
      },
    }),
    [medications, preferences, takenDoseIds, storageError, reminderError, operationError],
  );

  return <MedicationContext.Provider value={value}>{children}</MedicationContext.Provider>;
}

export function useMedications(): MedicationContextValue {
  const context = useContext(MedicationContext);

  if (!context) {
    throw new Error('useMedications deve ser usado dentro de MedicationProvider.');
  }

  return context;
}
