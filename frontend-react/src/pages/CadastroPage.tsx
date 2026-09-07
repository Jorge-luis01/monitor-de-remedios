import { useMemo, useState, type FormEvent } from 'react';
import { Bell, Clock3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { useMedications } from '../context/MedicationContext';
import { getDosePreview } from '../services/schedule';
import { requestExactAlarmAccessOnce } from '../services/androidReminders';
import type { ReminderType } from '../types/medication';

export function CadastroPage() {
  const navigate = useNavigate();
  const { addMedication } = useMedications();
  const [intervalHours, setIntervalHours] = useState(8);
  const [firstDose, setFirstDose] = useState('08:00');
  const [reminderType, setReminderType] = useState<ReminderType>('alarm');

  const dosePreview = useMemo(
    () => getDosePreview(firstDose, intervalHours),
    [firstDose, intervalHours],
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get('name') ?? '').trim();
    const dosage = String(data.get('dosage') ?? '').trim();
    const durationDays = Number(data.get('durationDays'));

    if (!name || !dosage || !Number.isFinite(durationDays)) {
      return;
    }

    addMedication({
      name,
      dosage,
      intervalHours,
      durationDays,
      firstDose,
      reminderType,
    });
    void requestExactAlarmAccessOnce(reminderType);
    navigate('/medicamentos', { state: { created: name } });
  }

  return (
    <>
      <PageHeader
        title="Cadastrar medicamento"
        description="Preencha os dados para organizar seu tratamento."
      />

      <form className="medication-form" onSubmit={handleSubmit}>
        <label htmlFor="name">Nome ou marca</label>
        <input id="name" name="name" placeholder="Ex.: Dipirona" required />

        <label htmlFor="dosage">Dose</label>
        <input id="dosage" name="dosage" placeholder="Ex.: 500 mg" required />

        <label htmlFor="intervalHours">Intervalo entre as doses</label>
        <div className="select-wrap">
          <select
            id="intervalHours"
            name="intervalHours"
            value={intervalHours}
            onChange={(event) => setIntervalHours(Number(event.target.value))}
          >
            {[4, 6, 8, 12, 24].map((hours) => (
              <option key={hours} value={hours}>{hours} horas</option>
            ))}
          </select>
        </div>

        <label htmlFor="durationDays">Quantidade de dias</label>
        <div className="select-wrap">
          <select id="durationDays" name="durationDays" defaultValue="7">
            {[1, 3, 5, 7, 10, 14, 21, 30].map((days) => (
              <option key={days} value={days}>{days} {days === 1 ? 'dia' : 'dias'}</option>
            ))}
          </select>
        </div>

        <label htmlFor="firstDose">Horário da primeira dose</label>
        <input
          id="firstDose"
          name="firstDose"
          type="time"
          value={firstDose}
          onChange={(event) => setFirstDose(event.target.value)}
          required
        />

        <fieldset>
          <legend>Tipo de lembrete</legend>
          <div className="reminder-type">
            <button
              type="button"
              className={`choice ${reminderType === 'alarm' ? 'active' : ''}`}
              aria-pressed={reminderType === 'alarm'}
              onClick={() => setReminderType('alarm')}
            >
              <Clock3 aria-hidden="true" size={18} /> Alarme
            </button>
            <button
              type="button"
              className={`choice ${reminderType === 'notification' ? 'active' : ''}`}
              aria-pressed={reminderType === 'notification'}
              onClick={() => setReminderType('notification')}
            >
              <Bell aria-hidden="true" size={18} /> Notificação
            </button>
          </div>
        </fieldset>

        <section className="next-doses" aria-live="polite">
          <span>Próximas doses</span>
          <strong>{dosePreview.join(' · ')}</strong>
        </section>

        <button className="primary-button" type="submit">
          Cadastrar medicamento
        </button>
      </form>
    </>
  );
}
