import { Bell, House, Pill, Settings } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';

const navigation = [
  { to: '/', label: 'Início', icon: House, end: true },
  { to: '/medicamentos', label: 'Medicamentos', icon: Pill, end: false },
  { to: '/lembretes', label: 'Lembretes', icon: Bell, end: false },
  { to: '/configuracoes', label: 'Configurações', icon: Settings, end: false },
];

export function AppLayout() {
  return (
    <div className="app-frame">
      <main className="app-shell">
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
