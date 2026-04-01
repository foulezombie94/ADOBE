import React from 'react';
import { useProjectStore, type StoreState } from '../../store';
import { secondsToTimecode } from '../../utils';

const MediaBin: React.FC = () => {
  const assets = useProjectStore((s: StoreState) => s.assets);
  const projectName = useProjectStore((s: StoreState) => s.projectName);

  return (
    <section className="w-1/4 bg-surface-container-low flex flex-col min-w-[260px] border-r border-outline-variant/10">
      <div className="panel-header">
        <span className="panel-title">Project: {projectName}</span>
        <span className="material-symbols-outlined text-on-surface-variant text-sm cursor-pointer">search</span>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {assets.map((asset) => (
          <div
            key={asset.id}
            className={`flex items-center p-2 rounded shadow-sm group cursor-pointer transition-colors ${
              asset.type === 'sequence'
                ? 'bg-secondary-container/20 border-l-2 border-secondary'
                : 'bg-surface-container hover:bg-surface-container-high'
            }`}
            draggable
          >
            <div className="w-16 h-10 bg-surface-container-lowest rounded overflow-hidden flex-shrink-0 flex items-center justify-center">
              {asset.type === 'audio' ? (
                <span className="material-symbols-outlined text-primary">audio_file</span>
              ) : asset.type === 'sequence' ? (
                <span className="material-symbols-outlined text-secondary">movie</span>
              ) : (
                <span className="material-symbols-outlined text-on-surface-variant">videocam</span>
              )}
            </div>
            <div className="ml-3 flex-1 overflow-hidden">
              <div className="text-[0.6875rem] text-on-surface font-medium truncate">{asset.name}</div>
              <div className="text-[0.6rem] text-on-surface-variant">
                {asset.type === 'sequence' ? (
                  <span className="text-secondary-dim font-bold">SEQUENCE</span>
                ) : asset.type === 'audio' ? (
                  'Stereo • 48kHz'
                ) : (
                  `${secondsToTimecode(asset.duration, asset.fps)} • ${asset.fps} fps`
                )}
              </div>
            </div>
          </div>
        ))}
        <div className="border border-dashed border-outline-variant/30 rounded p-4 text-center mt-4 hover:border-primary/50 transition-colors cursor-pointer">
          <span className="material-symbols-outlined text-on-surface-variant mb-1 block">add_circle_outline</span>
          <span className="text-[0.6rem] text-on-surface-variant">Drag files here or click to import</span>
        </div>
      </div>
    </section>
  );
};

export default MediaBin;
