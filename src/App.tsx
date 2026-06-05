import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { AppShell } from './components/layout/AppShell';
import { DashboardPage } from './pages/DashboardPage';
import { OcorrenciasPage } from './pages/OcorrenciasPage';
import { OcorrenciaDetailPage } from './pages/OcorrenciaDetailPage';
import { OcorrenciaFormPage } from './pages/OcorrenciaFormPage';
import { SatelitesPage } from './pages/SatelitesPage';
import { RelatoriosPage } from './pages/RelatoriosPage';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<DashboardPage />} />
            <Route path="ocorrencias">
              <Route index element={<OcorrenciasPage />} />
              <Route path="nova" element={<OcorrenciaFormPage />} />
              <Route path=":id" element={<OcorrenciaDetailPage />} />
            </Route>
            <Route path="satelites" element={<SatelitesPage />} />
            <Route path="relatorios" element={<RelatoriosPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
