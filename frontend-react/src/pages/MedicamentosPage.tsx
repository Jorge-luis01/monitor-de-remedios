import { Bell, Pause, Play, Trash2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { useMedications } from '../context/MedicationContext';

interface LocationState {
  created?: string;
}

export function MedicamentosPage() {
  const location = useLocation();
  const { medications, removeMedication, toggleMedication } = useMedications();
  const activeCount = medications.filter((medication) => medication.active).length;
  const created = (location.state as LocationState | null)?.created;

  function handleDelete(id: string, name: string): void {
    if (window.confirm(`Excluir ${name}? Esta ação não poderá ser desfeita.`)) {
      removeMedication(id);
    }
  }

  return (
    <>
      <PageHeader
        title="Meus medicamentos"
        description={`${activeCount} ${activeCount === 1 ? 'medicamento ativo' : 'medicamentos ativos'}`}
      />

      {created && <p className="success-message" role="status">{created} foi cadastrado com sucesso.</p>}

      <section className="cards" aria-label="Medicamentos cadastrados">
        {medications.length === 0 ? (
          <div className="empty-state">
            <h2>Nenhum medicamento cadastrado</h2>
            <p>Use a tela inicial para adicionar seu primeiro medicamento.</p>
          </div>
        ) : medications.map((medication) => (
          <article
            className={`medicine-card ${medication.active ? '' : 'paused'}`}
            key={medication.id}
          >
            <div className="card-top">
              <h2>{medication.name}</h2>
              <span className="pill">{medication.active ? 'Ativo' : 'Pausado'}</span>
            </div>
            <p>
              A cada {medication.intervalHours}h
              <span>Primeira dose · {medication.firstDose}</span>
            </p>
            <strong>{medication.durationDays} dias de tratamento</strong>
            <small>
              <Bell aria-hidden="true" size={13} />
              {medication.reminderType === 'alarm' ? 'Alarme' : 'Notificação'}
            </small>
            <footer>
              <button type="button" onClick={() => toggleMedication(medication.id)}>
                {medication.active
                  ? <><Pause aria-hidden="true" size={14} /> Pausar</>
                  : <><Play aria-hidden="true" size={14} /> Retomar</>}
              </button>
              <button
                type="button"
                className="delete-button"
                onClick={() => handleDelete(medication.id, medication.name)}
              >
                <Trash2 aria-hidden="true" size={14} /> Excluir
              </button>
            </footer>
          </article>
        ))}
      </section>
    </>
  );
}
