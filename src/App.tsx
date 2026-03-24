import { AnimatePresence, motion } from 'framer-motion';
import { useUIStore } from './store';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';
import ProjectManager from './pages/ProjectManager';
import EditWorkspace from './pages/EditWorkspace';
import AudioWorkspace from './pages/AudioWorkspace';
import ColorWorkspace from './pages/ColorWorkspace';
import ExportPage from './pages/ExportPage';

const pageVariants = {
  initial: { opacity: 0, y: 4 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' as const } },
  exit: { opacity: 0, y: -4, transition: { duration: 0.15 } },
};

function WorkspaceContent() {
  const workspace = useUIStore((s) => s.workspace);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={workspace}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="flex-1 flex overflow-hidden"
      >
        {workspace === 'projects' && <ProjectManager />}
        {workspace === 'edit' && <EditWorkspace />}
        {workspace === 'audio' && <AudioWorkspace />}
        {workspace === 'color' && <ColorWorkspace />}
        {workspace === 'export' && <ExportPage />}
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  const workspace = useUIStore((s) => s.workspace);
  const showSidebar = workspace !== 'projects';

  return (
    <div className="h-screen flex flex-col bg-surface select-none">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        {showSidebar && <Sidebar />}
        <WorkspaceContent />
      </div>
      <Footer />
    </div>
  );
}
