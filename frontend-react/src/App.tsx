import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { CadastroPage } from './pages/CadastroPage';
import { ConfiguracoesPage } from './pages/ConfiguracoesPage';
import { LembretesPage } from './pages/LembretesPage';
import { MedicamentosPage } from './pages/MedicamentosPage';

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<CadastroPage />} />
        <Route path="medicamentos" element={<MedicamentosPage />} />
        <Route path="lembretes" element={<LembretesPage />} />
        <Route path="configuracoes" element={<ConfiguracoesPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
