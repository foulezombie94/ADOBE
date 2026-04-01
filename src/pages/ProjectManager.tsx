import { useNavigate } from 'react-router-dom';
import ProjectCard from '../components/projects/ProjectCard';
import ProjectFilters from '../components/projects/ProjectFilters';
import { Project } from '../types';

export default function ProjectManager() {
  const navigate = useNavigate();

  // Mock data for demonstration
  const projects: Project[] = [
    {
      id: 'p1',
      name: 'Cinematic_Sequence_01',
      version: '1.0',
      createdAt: new Date(),
      modifiedAt: new Date(),
      settings: {
        resolution: { width: 3840, height: 2160 },
        frameRate: 24,
        sampleRate: 48000,
        colorSpace: 'Rec.709',
        previewQuality: 'full'
      },
      assets: [],
      timeline: { tracks: [], duration: 124, markers: [] },
      exportPresets: []
    }
  ];

  return (
    <main className="flex-1 overflow-y-auto bg-surface">
      <section className="max-w-[1400px] mx-auto p-8 space-y-10">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-outline-variant/10 pb-8">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tighter text-on-surface">Project Manager</h1>
            <p className="text-on-surface-variant text-sm">Welcome. Start a new production or import a project file.</p>
          </div>
          <div className="flex gap-2">
            <button className="bg-surface-container-high hover:bg-surface-container-highest text-on-surface px-6 py-2.5 rounded-sm flex items-center gap-2 border border-outline-variant/20 transition-all font-medium text-sm cursor-pointer active:scale-95">
              <span className="material-symbols-outlined">file_open</span>
              Import Project
            </button>
            <button
              className="bg-gradient-to-br from-primary to-primary-container text-on-primary px-6 py-2.5 rounded-sm flex items-center gap-2 font-bold text-sm shadow-lg shadow-primary/10 hover:brightness-110 transition-all cursor-pointer active:scale-95"
              onClick={() => navigate('/edit')}
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>add_box</span>
              Create New Project
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xs uppercase tracking-[0.2em] font-bold text-on-surface-variant">Recent Projects</h2>
            <ProjectFilters />
          </div>
          
          {projects.length === 0 ? (
            <div className="h-64 border border-dashed border-outline-variant/20 rounded-sm flex flex-col items-center justify-center gap-4 bg-surface-container-low/30 group hover:border-primary/20 transition-colors pointer-events-none">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant/20 group-hover:text-primary/20 transition-colors">video_library</span>
              <div className="text-center">
                <p className="text-on-surface-variant/40 text-sm font-medium">No projects found</p>
                <p className="text-on-surface-variant/20 text-[0.65rem]">Your recent work will appear here</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {projects.map(p => (
                <ProjectCard key={p.id} project={p} onClick={() => navigate('/edit')} />
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-4">
            <h2 className="text-xs uppercase tracking-[0.2em] font-bold text-on-surface-variant">System Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-surface-container p-4 rounded-sm border border-outline-variant/10">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-primary text-sm">memory</span>
                  <span className="text-[0.65rem] font-bold uppercase tracking-widest text-on-surface-variant">Cache Load</span>
                </div>
                <div className="text-2xl font-bold font-mono text-on-surface">0%</div>
                <div className="w-full bg-surface-container-lowest h-1 mt-2 rounded-full overflow-hidden">
                  <div className="bg-primary h-full rounded-full" style={{ width: '0%' }} />
                </div>
              </div>
              <div className="bg-surface-container p-4 rounded-sm border border-outline-variant/10">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-secondary text-sm">storage</span>
                  <span className="text-[0.65rem] font-bold uppercase tracking-widest text-on-surface-variant">Disk Speed</span>
                </div>
                <div className="text-2xl font-bold font-mono text-on-surface">---</div>
                <div className="flex items-center gap-1 mt-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-surface-container-highest" />
                  <span className="text-[10px] text-on-surface-variant uppercase">Standby</span>
                </div>
              </div>
              <div className="bg-surface-container p-4 rounded-sm border border-outline-variant/10">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-error text-sm">output</span>
                  <span className="text-[0.65rem] font-bold uppercase tracking-widest text-on-surface-variant">Render Queue</span>
                </div>
                <div className="text-2xl font-bold font-mono text-on-surface">00</div>
                <div className="text-[10px] text-on-surface-variant mt-2 uppercase tracking-tighter">Queue Empty</div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xs uppercase tracking-[0.2em] font-bold text-on-surface-variant">Recent Activity</h2>
            <div className="bg-surface-container-lowest border border-outline-variant/10 p-8 rounded-sm flex flex-col items-center justify-center text-center opacity-30">
              <span className="material-symbols-outlined text-2xl mb-2">history</span>
              <p className="text-[0.6rem] uppercase tracking-widest font-bold">No Activity</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
