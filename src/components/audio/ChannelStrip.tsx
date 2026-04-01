import React, { memo } from 'react';
import { useMixerStore, type StoreState } from '../../store';

interface ChannelData {
  trackId: string;
  name: string;
  volume: number;
  pan?: number;
  muted?: boolean;
  solo?: boolean;
  recording?: boolean;
  peakLevel?: number;
  peakL?: number;
  peakR?: number;
}

interface ChannelStripProps {
  channel: ChannelData;
  isMaster?: boolean;
}

const ChannelStrip: React.FC<ChannelStripProps> = ({ channel, isMaster }) => {
  const toggleChannelMute = useMixerStore((state: StoreState) => state.toggleChannelMute);
  const toggleChannelSolo = useMixerStore((state: StoreState) => state.toggleChannelSolo);

  const canvasPan = channel.pan ?? 0;
  const panAngle = canvasPan * 135; // -135 to +135 degrees
  const panLabel = canvasPan < -0.1 ? 'L' : (canvasPan > 0.1 ? 'R' : 'C');
  const faderPos = Math.max(0, Math.min(100, ((channel.volume + 60) / 66) * 100));

  return (
    <div className={`${isMaster ? 'min-w-[100px] bg-surface-container-high ml-auto border-l border-primary/20' : 'min-w-[80px] bg-surface-container-low border-r border-outline-variant/5'} flex flex-col p-2 items-center gap-3 shadow-inner`}>
      {/* Label */}
      <span className={`text-[0.6rem] font-bold tracking-tighter uppercase truncate w-full text-center ${isMaster ? 'text-primary font-extrabold' : channel.solo ? 'text-primary' : 'text-on-surface-variant'}`}>
        {isMaster ? 'Master' : channel.name}
      </span>

      {/* Pan Knob */}
      {!isMaster ? (
        <div className="w-10 h-10 rounded-full border-2 border-surface-container-highest flex items-center justify-center relative shadow-sm bg-surface-container-low">
          <div
            className="w-1 h-4 bg-primary absolute top-1 rounded-full origin-bottom transition-transform duration-200"
            style={{ transform: `rotate(${panAngle}deg)` }}
          />
          <span className="text-[0.5rem] absolute bottom-1 text-on-surface-variant font-bold">{panLabel}</span>
        </div>
      ) : (
        <div className="w-10 h-10 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary text-[24px]">equalizer</span>
        </div>
      )}

      {/* M/S/R Buttons */}
      <div className="flex gap-1 w-full justify-center">
        {!isMaster ? (
          <>
            <button
              className={`flex-1 h-5 flex items-center justify-center text-[0.6rem] font-black cursor-pointer transition-all rounded-[2px] ${
                channel.muted ? 'bg-yellow-600/30 text-yellow-500 border border-yellow-500/50' : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-bright'
              }`}
              onClick={() => toggleChannelMute(channel.trackId)}
            >M</button>
            <button
              className={`flex-1 h-5 flex items-center justify-center text-[0.6rem] font-black cursor-pointer transition-all rounded-[2px] ${
                channel.solo ? 'bg-secondary-container text-secondary-dim border border-secondary/50' : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-bright'
              }`}
              onClick={() => toggleChannelSolo(channel.trackId)}
            >S</button>
            <button className="flex-1 h-5 flex items-center justify-center text-[0.6rem] font-black bg-surface-container-highest text-error-dim cursor-pointer hover:bg-error/10 transition-all rounded-[2px]">
              R
            </button>
          </>
        ) : (
          <button className="w-full px-4 h-5 flex items-center justify-center text-[0.5rem] font-black bg-surface-container-highest text-primary tracking-widest uppercase cursor-pointer hover:bg-primary/20 transition-all rounded-[2px] border border-primary/20">
            Limiter
          </button>
        )}
      </div>

      {/* Fader + VU Meter */}
      <div className={`flex-1 flex ${isMaster ? 'gap-4' : 'gap-2'} pt-2 w-full justify-center min-h-[120px]`}>
        <div className={`relative h-full ${isMaster ? 'w-[8px]' : 'w-[5px]'} bg-black/60 rounded-full shadow-inner`}>
          <div
            className={`absolute left-1/2 -translate-x-1/2 ${isMaster ? 'w-10 h-5 bg-primary border border-primary-container shadow-xl' : 'w-7 h-4 bg-on-surface border border-outline/30 shadow-md'} cursor-ns-resize rounded-sm active:scale-95 transition-all z-10`}
            style={{ top: `${100 - faderPos}%` }}
          >
             <div className="w-full h-[2px] bg-white/40 absolute top-1/2 -translate-y-1/2" />
          </div>
        </div>
        
        {isMaster ? (
          <div className="flex gap-1 h-full py-0.5">
            <div className="w-2 h-full bg-black/60 rounded-full overflow-hidden relative shadow-inner">
              <div className="absolute bottom-0 w-full bg-gradient-to-t from-green-500 via-yellow-500 to-red-600 transition-all duration-75 ease-out shadow-[0_0_8px_rgba(34,197,94,0.5)]" style={{ height: `${(channel.peakL || 0.72) * 100}%` }} />
            </div>
            <div className="w-2 h-full bg-black/60 rounded-full overflow-hidden relative shadow-inner">
              <div className="absolute bottom-0 w-full bg-gradient-to-t from-green-500 via-yellow-500 to-red-600 transition-all duration-75 ease-out shadow-[0_0_8px_rgba(34,197,94,0.5)]" style={{ height: `${(channel.peakR || 0.68) * 100}%` }} />
            </div>
          </div>
        ) : (
          <div className="w-2 h-full bg-black/60 rounded-full overflow-hidden relative shadow-inner">
            <div className="absolute bottom-0 w-full bg-gradient-to-t from-green-500 via-yellow-500 to-red-600 transition-all duration-75 ease-out shadow-[0_0_8px_rgba(34,197,94,0.5)]" style={{ height: `${(channel.peakLevel || 0.4) * 100}%` }} />
          </div>
        )}
      </div>

      {/* dB readout */}
      <div className="bg-surface-container-highest px-2 py-0.5 rounded border border-outline-variant/10">
        <span className={`text-[0.6rem] font-mono font-bold ${isMaster ? 'text-primary' : 'text-on-surface-variant'}`}>
          {(channel.volume !== undefined ? channel.volume.toFixed(1) : '-2.8')} <small className="opacity-50">dB</small>
        </span>
      </div>
    </div>
  );
};

export default memo(ChannelStrip);
