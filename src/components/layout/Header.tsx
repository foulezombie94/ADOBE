import { useNavigate, useLocation } from 'react-router-dom';
import { useTimelineStore } from '../../store';
import { secondsToTimecode } from '../../utils';

const navItems = [
  { label: 'File' },
  { label: 'Edit', path: '/edit' },
  { label: 'Clip' },
  { label: 'Sequence', path: '/audio' },
  { label: 'Markers' },
  { label: 'Graphics', path: '/color' },
  { label: 'Window' },
  { label: 'Help' },
];

export default function Header() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const playheadTime = useTimelineStore((s) => s.playheadTime);

  return (
    <header className="bg-[#0e0e10] flex items-center justify-between w-full px-2 h-10 z-50 shrink-0">
      <div className="flex items-center gap-6">
        <span
          className="text-lg font-bold text-[#e6e4ec] tracking-tighter cursor-pointer"
          onClick={() => navigate('/projects')}
        >
          Obsidian Engine
        </span>
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <a
              key={item.label}
              className={`nav-link cursor-pointer ${
                item.path && pathname === item.path ? 'active' : ''
              }`}
              onClick={() => item.path && navigate(item.path)}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-3">
        {pathname !== '/projects' && (
          <div className="bg-[#19191d] rounded px-2 py-0.5 flex items-center gap-2 mr-2">
            <span className="text-[0.625rem] text-on-surface-variant font-mono">
              {secondsToTimecode(playheadTime)}
            </span>
          </div>
        )}
        <button
          className="bg-gradient-to-br from-primary to-primary-container text-on-primary text-[0.7rem] font-bold px-4 py-1 rounded-sm transition-transform active:scale-95 cursor-pointer"
          onClick={() => navigate('/export')}
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
