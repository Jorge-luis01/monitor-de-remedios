import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { readStorage, writeStorage } from '../services/storage';
import type { Medication, MedicationDraft, Preferences } from '../types/medication';

const MEDICATIONS_KEY = 'dose-certa:medications';
const TAKEN_DOSES_KEY = 'dose-certa:taken-doses';
const PREFERENCES_KEY = 'dose-certa:preferences';

const initialMedications: Medication[] = [];

const initialPreferences: Preferences = {
  largeText: false,
};

interface MedicationContextValue {
  medications: Medication[];
  takenDoseIds: string[];
  preferences: Preferences;
  addMedication: (draft: MedicationDraft) => void;
  toggleMedication: (id: string) => void;
  removeMedication: (id: string) => void;
  markDoseAsTaken: (id: string) => void;
  updatePreference: <Key extends keyof Preferences>(key: Key, value: Preferences[Key]) => void;
}

const MedicationContext = createContext<MedicationContextValue | null>(null);

function createMedicationId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `med-${Date.now()}`;
}

export function MedicationProvider({ children }: { children: ReactNode }) {
  const [medications, setMedications] = useState<Medication[]>(() =>
    readStorage(MEDICATIONS_KEY, initialMedications),
  );
  const [takenDoseIds, setTakenDoseIds] = useState<string[]>(() =>
    readStorage(TAKEN_DOSES_KEY, []),
  );
  const [preferences, setPreferences] = useState<Preferences>(() =>
    readStorage(PREFERENCES_KEY, initialPreferences),
  );

  useEffect(() => writeStorage(MEDICATIONS_KEY, medications), [medications]);
  useEffect(() => writeStorage(TAKEN_DOSES_KEY, takenDoseIds), [takenDoseIds]);
  useEffect(() => writeStorage(PREFERENCES_KEY, preferences), [preferences]);

  useEffect(() => {
    document.documentElement.classList.toggle('large-text', preferences.largeText);
  }, [preferences.largeText]);

  const value = useMemo<MedicationContextValue>(
    () => ({
      medications,
      takenDoseIds,
      preferences,
      addMedication: (draft) => {
        setMedications((current) => [
          ...current,
          {
            ...draft,
            id: createMedicationId(),
            active: true,
            createdAt: new Date().toISOString(),
          },
        ]);
      },
      toggleMedication: (id) => {
        setMedications((current) =>
          current.map((medication) =>
            medication.id === id
              ? { ...medication, active: !medication.active }
              : medication,
          ),
        );
      },
      removeMedication: (id) => {
        setMedications((current) => current.filter((medication) => medication.id !== id));
      },
      markDoseAsTaken: (id) => {
        setTakenDoseIds((current) => (current.includes(id) ? current : [...current, id]));
      },
      updatePreference: (key, preferenceValue) => {
        setPreferences((current) => ({ ...current, [key]: preferenceValue }));
      },
    }),
    [medications, preferences, takenDoseIds],
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
