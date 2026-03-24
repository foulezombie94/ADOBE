import { useUIStore } from '../../store';
import type { ToolType } from '../../types';

const tools: { key: ToolType; icon: string; label: string }[] = [
  { key: 'select', icon: 'near_me', label: 'Select (V)' },
  { key: 'track_select', icon: 'view_column', label: 'Track Select' },
  { key: 'ripple_edit', icon: 'swap_horiz', label: 'Ripple Edit (B)' },
  { key: 'razor', icon: 'content_cut', label: 'Razor (C)' },
  { key: 'slip', icon: 'straighten', label: 'Slip (X)' },
  { key: 'pen', icon: 'edit', label: 'Pen (P)' },
];

export default function Sidebar() {
  const { activeTool, setActiveTool } = useUIStore();

  return (
    <aside className="bg-[#131316] w-12 flex flex-col items-center py-4 space-y-1 z-40 shrink-0 border-r border-outline-variant/10">
      {tools.map((tool) => (
        <div
          key={tool.key}
          className={`tool-button ${activeTool === tool.key ? 'active' : ''}`}
          title={tool.label}
          onClick={() => setActiveTool(tool.key)}
        >
          <span className="material-symbols-outlined">{tool.icon}</span>
        </div>
      ))}
      <div className="flex-1" />
      <div className="tool-button">
        <span className="material-symbols-outlined">more_vert</span>
      </div>
    </aside>
  );
}
