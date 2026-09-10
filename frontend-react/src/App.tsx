import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';

const HomePage = lazy(() =>
  import('./pages/HomePage').then(({ HomePage: Page }) => ({ default: Page })),
);
const CadastroPage = lazy(() =>
  import('./pages/CadastroPage').then(({ CadastroPage: Page }) => ({ default: Page })),
);
const MedicamentosPage = lazy(() =>
  import('./pages/MedicamentosPage').then(({ MedicamentosPage: Page }) => ({ default: Page })),
);
const LembretesPage = lazy(() =>
  import('./pages/LembretesPage').then(({ LembretesPage: Page }) => ({ default: Page })),
);
const ConfiguracoesPage = lazy(() =>
  import('./pages/ConfiguracoesPage').then(({ ConfiguracoesPage: Page }) => ({ default: Page })),
);

function PageLoader() {
  return <p className="page-loading" role="status">Carregando…</p>;
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Suspense fallback={<PageLoader />}><HomePage /></Suspense>} />
        <Route path="cadastro" element={<Suspense fallback={<PageLoader />}><CadastroPage /></Suspense>} />
        <Route path="medicamentos" element={<Suspense fallback={<PageLoader />}><MedicamentosPage /></Suspense>} />
        <Route path="lembretes" element={<Suspense fallback={<PageLoader />}><LembretesPage /></Suspense>} />
        <Route path="configuracoes" element={<Suspense fallback={<PageLoader />}><ConfiguracoesPage /></Suspense>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
