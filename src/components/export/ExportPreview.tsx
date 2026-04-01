import React from 'react';
import { secondsToTimecode } from '../../utils';

interface ExportPreviewProps {
  playheadTime: number;
  duration: number;
  isExporting: boolean;
  exportProgress: number;
}

const ExportPreview: React.FC<ExportPreviewProps> = ({ 
  playheadTime, duration, isExporting, exportProgress 
}) => {
  return (
    <div className="flex-1 flex flex-col bg-black relative group shadow-inner">
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        <img
          className="max-w-[90%] max-h-[90%] object-contain shadow-2xl brightness-90 border border-white/5"
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80"
          alt="Export Preview"
          crossOrigin="anonymous"
        />
        
        {!isExporting && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
            <div className="flex items-center gap-10">
              <button className="material-symbols-outlined text-white/60 hover:text-white text-5xl transition-all hover:scale-110 active:scale-90">fast_rewind</button>
              <button className="material-symbols-outlined text-white text-8xl transition-all hover:scale-110 active:scale-95 drop-shadow-2xl">play_circle</button>
              <button className="material-symbols-outlined text-white/60 hover:text-white text-5xl transition-all hover:scale-110 active:scale-90">fast_forward</button>
            </div>
          </div>
        )}
      </div>

      {/* Scrubber Area */}
      <div className="mt-auto bg-surface-container-low/95 backdrop-blur-3xl border-t border-outline-variant/10 p-4 h-28 flex flex-col justify-between relative z-20">
        <div className="flex justify-between items-center mb-2">
           <div className="flex flex-col">
              <span className="text-[0.6rem] font-bold text-on-surface-variant uppercase tracking-widest opacity-60">Source Duration</span>
              <span className="text-[0.9rem] font-mono text-on-surface font-bold tabular-nums">
                {secondsToTimecode(playheadTime)} <span className="text-on-surface-variant font-normal opacity-40">/ {secondsToTimecode(duration)}</span>
              </span>
           </div>
           {isExporting && (
             <div className="flex flex-col items-end">
                <span className="text-[0.6rem] font-bold text-primary uppercase tracking-widest">Encoding Frame...</span>
                <span className="text-[0.9rem] font-mono text-primary font-bold">{(exportProgress * duration / 100).toFixed(0)}f</span>
             </div>
           )}
        </div>

        <div className="relative flex flex-col gap-2">
          {/* Waveform Visualization Mockup */}
          <div className="h-6 flex items-end gap-px opacity-20 overflow-hidden pointer-events-none">
             {Array(120).fill(0).map((_: number, i: number) => (
               <div key={i} className="flex-1 bg-on-surface" style={{ height: `${Math.random() * 100}%` }} />
             ))}
          </div>
          
          <div className="relative h-2 bg-surface-container-highest rounded-full overflow-hidden shadow-inner cursor-pointer">
            {isExporting ? (
              <div 
                className="absolute h-full bg-gradient-to-r from-primary/80 to-primary transition-all duration-300"
                style={{ width: `${exportProgress}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              </div>
            ) : (
              <div className="absolute h-full bg-primary/10 transition-all" style={{ width: '45%' }} />
            )}
            <div className="absolute h-full w-1 bg-primary left-[45%] shadow-[0_0_10px_rgba(185,195,255,1)]" />
          </div>
        </div>

        {isExporting && (
           <div className="absolute top-[-1px] left-0 right-0 h-[1px] bg-primary animate-pulse" />
        )}
      </div>
    </div>
  );
};

export default ExportPreview;
