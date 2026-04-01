import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';

const ProjectManager = lazy(() => import('./pages/ProjectManager'));
const EditWorkspace = lazy(() => import('./pages/EditWorkspace'));
const AudioWorkspace = lazy(() => import('./pages/AudioWorkspace'));
const ColorWorkspace = lazy(() => import('./pages/ColorWorkspace'));
const ExportPage = lazy(() => import('./pages/ExportPage'));

const Loading = () => (
  <div className="flex-1 flex items-center justify-center bg-surface text-muted text-sm">
    Chargement de l'espace de travail...
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Navigate to="/projects" replace />} />
          <Route path="/projects" element={<MainLayout showSidebar={false}><ProjectManager /></MainLayout>} />
          <Route path="/edit" element={<MainLayout><EditWorkspace /></MainLayout>} />
          <Route path="/audio" element={<MainLayout><AudioWorkspace /></MainLayout>} />
          <Route path="/color" element={<MainLayout><ColorWorkspace /></MainLayout>} />
          <Route path="/export" element={<MainLayout><ExportPage /></MainLayout>} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
