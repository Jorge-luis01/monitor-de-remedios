import { Bell, Check, Clock3 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { useMedications } from '../context/MedicationContext';
import { buildTodayReminders, getTodayLabel } from '../services/schedule';

function getCurrentTime(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

export function LembretesPage() {
  const { medications, takenDoseIds, markDoseAsTaken } = useMedications();
  const [currentTime, setCurrentTime] = useState(getCurrentTime);
  const reminders = useMemo(
    () => buildTodayReminders(medications, takenDoseIds),
    [medications, takenDoseIds],
  );

  useEffect(() => {
    const intervalId = window.setInterval(() => setCurrentTime(getCurrentTime()), 60_000);
    return () => window.clearInterval(intervalId);
  }, []);

  const nextReminderId = reminders.find(
    (reminder) => !reminder.taken && reminder.time >= currentTime,
  )?.id;

  return (
    <>
      <PageHeader title="Lembretes" description={`Hoje, ${getTodayLabel()}`} />

      <section className="schedule" aria-label="Doses de hoje">
        {reminders.length === 0 ? (
          <div className="empty-state">
            <h2>Nenhuma dose para hoje</h2>
            <p>Cadastre ou retome um medicamento para criar lembretes.</p>
          </div>
        ) : reminders.map((reminder) => (
          <article
            key={reminder.id}
            className={`schedule-item ${reminder.id === nextReminderId ? 'current' : ''} ${reminder.taken ? 'taken' : ''}`}
          >
            <time dateTime={reminder.time}>{reminder.time}</time>
            <div>
              <h2>{reminder.medicationName}</h2>
              <p>
                {reminder.reminderType === 'alarm'
                  ? <Clock3 aria-hidden="true" size={13} />
                  : <Bell aria-hidden="true" size={13} />}
                {reminder.dosage} · {reminder.reminderType === 'alarm' ? 'Alarme' : 'Notificação'}
              </p>
            </div>
            <button
              type="button"
              className="take-button"
              disabled={reminder.taken}
              onClick={() => markDoseAsTaken(reminder.id)}
            >
              {reminder.taken ? <><Check aria-hidden="true" size={14} /> Tomado</> : 'Tomar'}
            </button>
          </article>
        ))}
      </section>
    </>
  );
}
