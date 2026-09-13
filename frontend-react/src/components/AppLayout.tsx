import { Bell, House, Pill, Settings } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { useMedications } from '../context/MedicationContext';

const navigation = [
  { to: '/', label: 'Início', icon: House, end: true },
  { to: '/medicamentos', label: 'Medicamentos', icon: Pill, end: false },
  { to: '/lembretes', label: 'Lembretes', icon: Bell, end: false },
  { to: '/configuracoes', label: 'Configurações', icon: Settings, end: false },
];

export function AppLayout() {
  const { storageError, reminderError, operationError } = useMedications();
  return (
    <div className="app-frame">
      <main className="app-shell">
        {storageError && <p role="alert">Não foi possível ler ou salvar os dados locais. As alterações podem ser perdidas ao fechar o aplicativo. Os dados anteriores não foram apagados.</p>}
        {operationError && <p role="alert">{operationError}</p>}
        {reminderError && <p role="alert">Não foi possível atualizar os alarmes no Android. O agendamento anterior pode continuar ativo. Confira seus horários e não dependa dos alertas até resolver o problema.</p>}
        <Outlet />
      </main>

      <nav className="bottom-nav" aria-label="Navegação principal">
        {navigation.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => (isActive ? 'active' : undefined)}
          >
            <Icon aria-hidden="true" size={19} strokeWidth={2} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
