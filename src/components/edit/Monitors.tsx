import React from 'react';
import { useTimelineStore } from '../../store';
import { secondsToTimecode } from '../../utils';

const Monitors: React.FC = () => {
  const { playheadTime, isPlaying, togglePlayback, stepForward, stepBackward } = useTimelineStore();

  return (
    <section className="flex-1 flex flex-col bg-surface-container-lowest">
      <div className="flex flex-1">
        <div className="flex-1 border-r border-outline-variant/10 flex flex-col relative">
          <div className="h-8 bg-surface-container px-3 flex items-center text-[0.65rem] font-bold text-on-surface-variant">
            SOURCE: A001_C012_RAW.mp4
          </div>
          <div className="flex-1 bg-black flex items-center justify-center p-4">
            <div className="relative w-full aspect-video bg-surface-container-low group cursor-crosshair overflow-hidden rounded-sm">
              <img
                className="w-full h-full object-cover opacity-80"
                src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80"
                alt="Source"
                crossOrigin="anonymous"
              />
            </div>
          </div>
          <div className="h-10 bg-surface-container flex items-center justify-center gap-6">
            <button className="material-symbols-outlined text-on-surface-variant hover:text-primary cursor-pointer">keyboard_arrow_left</button>
            <button className="material-symbols-outlined text-on-surface hover:text-primary cursor-pointer">play_arrow</button>
            <button className="material-symbols-outlined text-on-surface-variant hover:text-primary cursor-pointer">keyboard_arrow_right</button>
          </div>
        </div>

        <div className="flex-1 flex flex-col relative">
          <div className="h-8 bg-surface-container px-3 flex items-center justify-between">
            <span className="text-[0.65rem] font-bold text-on-surface">PROGRAM: NightCity_Master</span>
            <span className="text-[0.65rem] text-primary font-mono">100% Fit</span>
          </div>
          <div className="flex-1 bg-black flex items-center justify-center p-4">
            <div className="relative w-full aspect-video bg-surface-container-low overflow-hidden rounded-sm">
              <img
                className="w-full h-full object-cover"
                src="https://images.unsplash.com/photo-1514905552197-0610a4d8fd73?w=800&q=80"
                alt="Program"
                crossOrigin="anonymous"
              />
            </div>
          </div>
          <div className="h-10 bg-surface-container flex items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <button onClick={stepBackward} className="material-symbols-outlined text-on-surface-variant hover:text-primary cursor-pointer">keyboard_double_arrow_left</button>
              <button className="material-symbols-outlined text-on-surface hover:text-primary cursor-pointer">skip_previous</button>
              <button
                onClick={togglePlayback}
                className={`material-symbols-outlined text-xl p-1 rounded-full cursor-pointer ${isPlaying ? 'text-primary bg-primary/10' : 'text-on-surface bg-primary/10'}`}
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {isPlaying ? 'pause' : 'play_arrow'}
              </button>
              <button className="material-symbols-outlined text-on-surface hover:text-primary cursor-pointer">skip_next</button>
              <button onClick={stepForward} className="material-symbols-outlined text-on-surface-variant hover:text-primary cursor-pointer">keyboard_double_arrow_right</button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[0.625rem] font-mono text-on-surface bg-surface-container-lowest px-2 py-0.5 rounded">
                {secondsToTimecode(playheadTime)}
              </span>
              <button className="material-symbols-outlined text-on-surface-variant cursor-pointer">camera</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Monitors;
