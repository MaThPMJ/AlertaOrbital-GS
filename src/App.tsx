import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { AuthProvider } from './contexts/AuthContext';
import { AuthGuard } from './components/layout/AuthGuard';
import { AppShell } from './components/layout/AppShell';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { OcorrenciasPage } from './pages/OcorrenciasPage';
import { OcorrenciaDetailPage } from './pages/OcorrenciaDetailPage';
import { OcorrenciaFormPage } from './pages/OcorrenciaFormPage';
import { SatelitesPage } from './pages/SatelitesPage';
import { DeteccoesPage } from './pages/DeteccoesPage';
import { AlertasPage } from './pages/AlertasPage';
import { RelatoriosPage } from './pages/RelatoriosPage';
import { UsuariosPage } from './pages/UsuariosPage';
import { IntegrantesPage } from './pages/IntegrantesPage';
import { SobrePage } from './pages/SobrePage';
import { FAQPage } from './pages/FAQPage';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route element={<AuthGuard />}>
              <Route element={<AppShell />}>
                <Route index element={<DashboardPage />} />
                <Route path="ocorrencias">
                  <Route index element={<OcorrenciasPage />} />
                  <Route path="nova" element={<OcorrenciaFormPage />} />
                  <Route path=":id" element={<OcorrenciaDetailPage />} />
                  <Route path=":id/editar" element={<OcorrenciaFormPage />} />
                </Route>
                <Route path="satelites" element={<SatelitesPage />} />
                <Route path="deteccoes" element={<DeteccoesPage />} />
                <Route path="alertas" element={<AlertasPage />} />
                <Route path="relatorios" element={<RelatoriosPage />} />
                <Route path="usuarios" element={<UsuariosPage />} />
                <Route path="integrantes" element={<IntegrantesPage />} />
                <Route path="sobre" element={<SobrePage />} />
                <Route path="faq" element={<FAQPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
