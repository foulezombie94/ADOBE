import { useMixerStore, useTimelineStore } from '../store';
import { secondsToTimecode } from '../utils';
import ChannelStrip from '../components/audio/ChannelStrip';
import WaveformDisplay from '../components/audio/WaveformDisplay';

// ═══════════════════════════════════════════
// Audio Timeline
// ═══════════════════════════════════════════
function AudioTimeline() {
  const { playheadTime } = useTimelineStore();

  return (
    <section className="h-64 bg-surface-container-low flex flex-col border-t border-outline-variant/10">
      <div className="panel-header bg-surface-container">
        <div className="flex items-center gap-4">
          <span className="panel-title">Audio Timeline</span>
          <div className="flex items-center gap-1 bg-surface-container-lowest px-2 py-0.5 rounded border border-outline-variant/10 shadow-inner">
            <span className="text-secondary text-[0.65rem] font-mono tabular-nums">{secondsToTimecode(playheadTime)}</span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-on-surface-variant">
          <span className="material-symbols-outlined text-[16px] cursor-pointer hover:text-primary transition-colors">zoom_in</span>
          <span className="material-symbols-outlined text-[16px] cursor-pointer hover:text-primary transition-colors">sync</span>
          <span className="material-symbols-outlined text-[16px] cursor-pointer hover:text-primary transition-colors">settings</span>
        </div>
      </div>
      <div className="flex-1 flex relative overflow-hidden bg-surface-container-lowest">
        {/* Track Info */}
        <div className="w-40 bg-surface-container-low border-r border-outline-variant/10 flex flex-col">
          <div className="h-12 border-b border-outline-variant/5 flex items-center px-3">
            <span className="text-[0.6rem] text-on-surface-variant font-bold uppercase tracking-tight">V1 • Master Visual</span>
          </div>
          <div className="h-16 border-b border-outline-variant/5 flex flex-col justify-center px-3 gap-1 bg-primary-container/10">
            <div className="flex justify-between items-center">
              <span className="text-[0.6rem] text-primary font-bold uppercase">A1 • Dialogue</span>
              <span className="text-[0.5rem] text-primary/50 font-mono">MONO</span>
            </div>
            <div className="flex gap-1">
              <span className="w-5 h-5 text-[0.4rem] bg-surface-container-highest flex items-center justify-center text-on-surface-variant font-bold border border-outline-variant/10 rounded-sm">M</span>
              <span className="w-5 h-5 text-[0.4rem] bg-secondary-container flex items-center justify-center text-secondary font-bold border border-secondary/20 rounded-sm">S</span>
            </div>
          </div>
          <div className="h-16 border-b border-outline-variant/5 flex flex-col justify-center px-3 gap-1 bg-primary-container/5">
            <div className="flex justify-between items-center">
              <span className="text-[0.6rem] text-on-surface-variant font-bold uppercase">A2 • Atmosphere</span>
              <span className="text-[0.5rem] text-on-surface-variant/50 font-mono">STEREO</span>
            </div>
            <div className="flex gap-1">
              <span className="w-5 h-5 text-[0.4rem] bg-surface-container-highest flex items-center justify-center text-on-surface-variant font-bold border border-outline-variant/10 rounded-sm">M</span>
              <span className="w-5 h-5 text-[0.4rem] bg-surface-container-highest flex items-center justify-center text-on-surface-variant font-bold border border-outline-variant/10 rounded-sm">S</span>
            </div>
          </div>
        </div>
        {/* Timeline Content */}
        <div className="flex-1 overflow-x-auto relative">
          {/* Ruler */}
          <div className="h-6 bg-surface-container border-b border-outline-variant/20 relative">
            <div className="absolute left-[30%] top-0 bottom-0 w-px bg-primary shadow-[0_0_12px_rgba(185,195,255,0.6)] z-20">
              <div className="w-3 h-3 bg-primary rotate-45 -translate-x-1/2 -mt-1.5" />
            </div>
            <div className="flex gap-20 px-4 text-[0.5rem] text-on-surface-variant pt-1 font-mono tracking-tighter">
              <span>00:04:00:00</span><span>00:04:05:00</span><span>00:04:10:00</span><span>00:04:15:00</span><span>00:04:20:00</span>
            </div>
          </div>
          {/* Video Clip */}
          <div className="h-12 flex items-center px-4">
            <div className="h-8 w-64 bg-surface-container-highest border border-outline-variant/20 rounded relative flex items-center px-2 overflow-hidden shadow-sm">
              <span className="text-[0.55rem] font-medium z-10 text-on-surface truncate">SCENE_01_A_4K.mp4</span>
            </div>
          </div>
          {/* Audio Track 1 */}
          <div className="h-16 flex items-center px-4 relative">
            <div className="h-12 w-48 bg-primary-container/80 border border-primary/20 rounded relative flex flex-col justify-center px-2 overflow-hidden group shadow-sm active:scale-[0.99] transition-transform cursor-pointer">
              <div className="absolute inset-0 opacity-40">
                <WaveformDisplay color="#b9c3ff" opacity={1} />
              </div>
              <span className="text-[0.55rem] font-bold z-10 text-on-primary-container truncate">DIA_Hero_04_processed.wav</span>
            </div>
            <div className="h-12 w-32 ml-1 bg-primary-container/80 border border-primary/20 rounded relative flex flex-col justify-center px-2 overflow-hidden shadow-sm active:scale-[0.99] transition-transform cursor-pointer">
              <div className="absolute inset-0 opacity-40">
                <WaveformDisplay color="#b9c3ff" opacity={1} />
              </div>
              <span className="text-[0.55rem] font-bold z-10 text-on-primary-container truncate">DIA_Hero_05_processed.wav</span>
            </div>
          </div>
          {/* Audio Track 2 */}
          <div className="h-16 flex items-center px-4">
            <div className="h-12 w-full bg-secondary-container/30 border border-secondary/20 rounded relative flex flex-col justify-center px-2 overflow-hidden shadow-sm active:scale-[0.99] transition-transform cursor-pointer">
               <div className="absolute inset-0 opacity-20">
                <WaveformDisplay color="#7dd3fc" opacity={1} />
              </div>
              <span className="text-[0.55rem] font-bold z-10 text-secondary-dim truncate">AMB_Forest_Night_Atmospheric_Loop.wav</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════
// Main Audio Workspace
// ═══════════════════════════════════════════
export default function AudioWorkspace() {
  const { channels, masterVolume, masterPeak } = useMixerStore();
  const { playheadTime, isPlaying, togglePlayback } = useTimelineStore();

  return (
    <div className="flex-1 flex flex-col bg-surface overflow-hidden">
      <div className="flex-1 flex min-h-0">
        {/* Program Monitor */}
        <section className="flex-[1.5] flex flex-col border-r border-outline-variant/10">
          <div className="panel-header bg-surface-container-low border-b border-outline-variant/10">
            <span className="panel-title uppercase tracking-widest text-[0.65rem] font-extrabold opacity-70">Program Preview</span>
            <div className="flex items-center gap-3">
              <span className="text-primary text-[0.6875rem] font-mono tabular-nums bg-primary-container/20 px-2 py-0.5 rounded border border-primary/10">{secondsToTimecode(playheadTime)}</span>
              <button className="material-symbols-outlined text-[16px] text-on-surface-variant hover:text-on-surface transition-colors">more_vert</button>
            </div>
          </div>
          <div className="flex-1 bg-black relative flex items-center justify-center group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/40 pointer-events-none z-10" />
            <img
              className="h-full w-full object-cover opacity-80"
              src="https://images.unsplash.com/photo-1518710843675-2540dd7d2ce7?w=1200&q=80"
              alt="Program Feed"
              crossOrigin="anonymous"
            />
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-8 px-8 py-3 bg-surface-container/60 backdrop-blur-2xl rounded-full border border-outline-variant/20 shadow-2xl opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 z-20">
              <span className="material-symbols-outlined cursor-pointer hover:text-primary transition-colors text-xl active:scale-90">skip_previous</span>
              <button
                className="w-12 h-12 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-110 active:scale-95 transition-all"
                onClick={togglePlayback}
              >
                <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {isPlaying ? 'pause' : 'play_arrow'}
                </span>
              </button>
              <span className="material-symbols-outlined cursor-pointer hover:text-primary transition-colors text-xl active:scale-90">skip_next</span>
            </div>
            
            {/* Audio Signal Overlay */}
            <div className="absolute right-6 top-1/2 -translate-y-1/2 flex gap-1 h-32 opacity-60 pointer-events-none">
              <div className="w-1.5 bg-primary/20 rounded-full relative overflow-hidden">
                 <div className="absolute bottom-0 w-full bg-primary" style={{ height: `${(masterPeak.l || 0.5) * 100}%` }} />
              </div>
              <div className="w-1.5 bg-primary/20 rounded-full relative overflow-hidden">
                 <div className="absolute bottom-0 w-full bg-primary" style={{ height: `${(masterPeak.r || 0.4) * 100}%` }} />
              </div>
            </div>
          </div>
        </section>

        {/* Mixer */}
        <section className="flex-1 flex flex-col bg-surface-container">
          <div className="panel-header bg-surface-container-high border-b border-outline-variant/10">
            <span className="panel-title text-on-surface-variant font-bold text-[0.65rem] uppercase tracking-wider">Audio Track Mixer</span>
            <div className="flex gap-1">
              <button className="text-[0.55rem] font-bold uppercase tracking-tighter bg-surface-container-highest px-2 py-0.5 rounded text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors border border-outline-variant/10">Inserts</button>
              <button className="text-[0.55rem] font-bold uppercase tracking-tighter bg-surface-container-highest px-2 py-0.5 rounded text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors border border-outline-variant/10">Sends</button>
            </div>
          </div>
          <div className="flex-1 flex overflow-x-auto p-1 gap-px bg-surface-container-lowest">
            {channels.map((ch) => (
              <ChannelStrip key={ch.trackId} channel={ch} />
            ))}
            <div className="w-4 bg-surface-container-highest/20" /> {/* Spacer */}
            <ChannelStrip
              channel={{ trackId: 'master', name: 'Master', volume: masterVolume, peakL: masterPeak.l, peakR: masterPeak.r }}
              isMaster
            />
          </div>
        </section>
      </div>

      {/* Audio Timeline */}
      <AudioTimeline />
    </div>
  );
}
