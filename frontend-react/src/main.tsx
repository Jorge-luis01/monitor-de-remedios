import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import { MedicationProvider } from './context/MedicationContext';
import './styles/style.css';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Elemento raiz da aplicação não encontrado.');
}

createRoot(root).render(
  <StrictMode>
    <HashRouter>
      <MedicationProvider>
        <App />
      </MedicationProvider>
    </HashRouter>
  </StrictMode>,
);
