import { useUIStore } from '../../store';
import { useTimelineStore } from '../../store';
import { secondsToTimecode } from '../../utils';
import type { Workspace } from '../../types';

const navItems: { label: string; workspace?: Workspace }[] = [
  { label: 'File' },
  { label: 'Edit', workspace: 'edit' },
  { label: 'Clip' },
  { label: 'Sequence', workspace: 'audio' },
  { label: 'Markers' },
  { label: 'Graphics', workspace: 'color' },
  { label: 'Window' },
  { label: 'Help' },
];

export default function Header() {
  const { workspace, setWorkspace } = useUIStore();
  const playheadTime = useTimelineStore((s) => s.playheadTime);

  return (
    <header className="bg-[#0e0e10] flex items-center justify-between w-full px-2 h-10 z-50 shrink-0">
      <div className="flex items-center gap-6">
        <span
          className="text-lg font-bold text-[#e6e4ec] tracking-tighter cursor-pointer"
          onClick={() => setWorkspace('projects')}
        >
          Obsidian Engine
        </span>
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <a
              key={item.label}
              className={`nav-link cursor-pointer ${
                item.workspace && workspace === item.workspace ? 'active' : ''
              }`}
              onClick={() => item.workspace && setWorkspace(item.workspace)}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-3">
        {workspace !== 'projects' && (
          <div className="bg-[#19191d] rounded px-2 py-0.5 flex items-center gap-2 mr-2">
            <span className="text-[0.625rem] text-on-surface-variant font-mono">
              {secondsToTimecode(playheadTime)}
            </span>
          </div>
        )}
        <button
          className="bg-gradient-to-br from-primary to-primary-container text-on-primary text-[0.7rem] font-bold px-4 py-1 rounded-sm transition-transform active:scale-95 cursor-pointer"
          onClick={() => setWorkspace('export')}
        >
          Export
        </button>
        <div className="flex items-center gap-1 ml-2">
          <button className="w-8 h-8 flex items-center justify-center hover:bg-[#19191d] rounded-full text-[#abaab1] hover:text-[#e6e4ec] transition-all cursor-pointer">
            <span className="material-symbols-outlined">settings</span>
          </button>
          <button className="w-8 h-8 flex items-center justify-center hover:bg-[#19191d] rounded-full text-[#abaab1] hover:text-[#e6e4ec] transition-all cursor-pointer">
            <span className="material-symbols-outlined">account_circle</span>
          </button>
        </div>
      </div>
    </header>
  );
}
