import React from 'react';
import { useTimelineStore } from '../../store';

const TimelineToolbar: React.FC = () => {
  const { zoom, setZoom } = useTimelineStore();

  return (
    <div className="h-8 bg-surface-container flex items-center justify-between px-4 border-t border-outline-variant/10">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1 border-b-2 border-secondary px-2 py-1">
          <span className="text-[0.65rem] font-bold text-on-surface">Timeline: Main_Edit</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={() => setZoom(zoom - 0.2)} className="material-symbols-outlined text-on-surface-variant text-sm cursor-pointer">zoom_out</button>
        <div className="w-32 h-1 bg-surface-container-lowest relative rounded-full">
          <div
            className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-primary rounded-full cursor-pointer"
            style={{ left: `${((zoom - 0.1) / 9.9) * 100}%` }}
          />
        </div>
        <button onClick={() => setZoom(zoom + 0.2)} className="material-symbols-outlined text-on-surface-variant text-sm cursor-pointer">zoom_in</button>
        <span className="material-symbols-outlined text-on-surface-variant text-sm cursor-pointer">link</span>
      </div>
    </div>
  );
};

export default TimelineToolbar;
