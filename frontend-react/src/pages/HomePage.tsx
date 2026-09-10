import { ArrowRight, Check, Clock3, Pill, Plus } from 'lucide-react';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { useMedications } from '../context/MedicationContext';
import { buildTodayReminders, getTodayLabel } from '../services/schedule';

function getCurrentTime(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

export function HomePage() {
  const { medications, takenDoseIds, markDoseAsTaken } = useMedications();
  const reminders = useMemo(
    () => buildTodayReminders(medications, takenDoseIds),
    [medications, takenDoseIds],
  );
  const activeMedications = medications.filter((medication) => medication.active).length;
  const takenToday = reminders.filter((reminder) => reminder.taken).length;
  const nextReminder = reminders.find(
    (reminder) => !reminder.taken && reminder.time >= getCurrentTime(),
  );

  return (
    <>
      <PageHeader
        title="Seu tratamento, no horário certo"
        description={`Hoje, ${getTodayLabel()}`}
      />

      <section className="summary-grid" aria-label="Resumo do tratamento">
        <article className="summary-card">
          <span className="summary-icon"><Pill aria-hidden="true" size={18} /></span>
          <strong>{activeMedications}</strong>
          <small>{activeMedications === 1 ? 'medicamento ativo' : 'medicamentos ativos'}</small>
        </article>
        <article className="summary-card">
          <span className="summary-icon success"><Check aria-hidden="true" size={18} /></span>
          <strong>{takenToday}/{reminders.length}</strong>
          <small>doses tomadas hoje</small>
        </article>
      </section>

      <section className="home-section" aria-labelledby="next-dose-title">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Agora</p>
            <h2 id="next-dose-title">Próxima dose</h2>
          </div>
          <Link to="/lembretes">Ver agenda <ArrowRight aria-hidden="true" size={14} /></Link>
        </div>

        {nextReminder ? (
          <article className="next-dose-card">
            <div className="dose-time">
              <Clock3 aria-hidden="true" size={18} />
              <time dateTime={nextReminder.time}>{nextReminder.time}</time>
            </div>
            <div className="dose-copy">
              <h3>{nextReminder.medicationName}</h3>
              <p>{nextReminder.dosage}</p>
            </div>
            <button type="button" onClick={() => markDoseAsTaken(nextReminder.id)}>
              <Check aria-hidden="true" size={15} /> Tomei
            </button>
          </article>
        ) : (
          <div className="empty-state compact">
            <h2>Tudo certo por hoje</h2>
            <p>Não há outra dose programada para este horário.</p>
          </div>
        )}
      </section>

      <Link className="add-medication-card" to="/cadastro">
        <span><Plus aria-hidden="true" size={20} /></span>
        <div>
          <strong>Adicionar medicamento</strong>
          <small>Cadastre dose, intervalo e lembrete.</small>
        </div>
        <ArrowRight aria-hidden="true" size={18} />
      </Link>

      <p className="health-note">
        O Dose Certa ajuda na organização da rotina e não substitui orientação médica.
      </p>
    </>
  );
}
