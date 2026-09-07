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

  const nextReminder = reminders.find(
    (reminder) => !reminder.taken && reminder.time >= currentTime,
  );

  return (
    <>
      <PageHeader title="Lembretes" description={`Hoje, ${getTodayLabel()}`} />

      <section className="schedule" aria-label="Próxima dose de hoje">
        {!nextReminder ? (
          <div className="empty-state">
            <h2>Nenhuma próxima dose para hoje</h2>
            <p>As doses tomadas ou já encerradas não aparecem nesta tela.</p>
          </div>
        ) : (
          <article
            key={nextReminder.id}
            className="schedule-item current"
          >
            <time dateTime={nextReminder.time}>{nextReminder.time}</time>
            <div>
              <h2>{nextReminder.medicationName}</h2>
              <p>
                {nextReminder.reminderType === 'alarm'
                  ? <Clock3 aria-hidden="true" size={13} />
                  : <Bell aria-hidden="true" size={13} />}
                {nextReminder.dosage} · {nextReminder.reminderType === 'alarm' ? 'Alarme' : 'Notificação'}
              </p>
            </div>
            <button
              type="button"
              className="take-button"
              onClick={() => markDoseAsTaken(nextReminder.id)}
            >
              <Check aria-hidden="true" size={14} /> Tomar
            </button>
          </article>
        )}
      </section>
    </>
  );
}
