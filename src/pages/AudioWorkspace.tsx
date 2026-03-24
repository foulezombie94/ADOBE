import { useRef, useEffect } from 'react';
import { useMixerStore, useTimelineStore } from '../store';
import { secondsToTimecode } from '../utils';

// ═══════════════════════════════════════════
// Mixer Channel Strip
// ═══════════════════════════════════════════
function ChannelStrip({ channel, isMaster }: { channel: any; isMaster?: boolean }) {
  const { toggleChannelMute, toggleChannelSolo } = useMixerStore();

  const panAngle = (channel.pan || 0) * 135; // -135 to +135 degrees
  const panLabel = channel.pan < -0.1 ? 'L' : channel.pan > 0.1 ? 'R' : 'C';
  const faderPos = Math.max(0, Math.min(100, ((channel.volume + 60) / 66) * 100));

  return (
    <div className={`${isMaster ? 'min-w-[100px] bg-surface-container-high ml-auto border-l border-primary/20' : 'min-w-[80px] bg-surface-container-low border-r border-outline-variant/5'} flex flex-col p-2 items-center gap-3`}>
      {/* Label */}
      <span className={`text-[0.6rem] font-bold tracking-tighter uppercase ${isMaster ? 'text-primary font-extrabold' : channel.solo ? 'text-primary' : 'text-on-surface-variant'}`}>
        {isMaster ? 'Master' : channel.name}
      </span>

      {/* Pan Knob */}
      {!isMaster ? (
        <div className="w-10 h-10 rounded-full border-2 border-surface-container-highest flex items-center justify-center relative">
          <div
            className="w-1 h-4 bg-primary absolute top-1 rounded-full origin-bottom"
            style={{ transform: `rotate(${panAngle}deg)` }}
          />
          <span className="text-[0.5rem] absolute bottom-1 text-on-surface-variant">{panLabel}</span>
        </div>
      ) : (
        <div className="w-10 h-10 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary">equalizer</span>
        </div>
      )}

      {/* M/S/R Buttons */}
      <div className="flex gap-1">
        {!isMaster ? (
          <>
            <button
              className={`w-5 h-5 flex items-center justify-center text-[0.6rem] font-bold cursor-pointer ${
                channel.muted ? 'bg-yellow-600/20 text-yellow-500' : 'bg-surface-container-highest text-on-surface-variant'
              }`}
              onClick={() => toggleChannelMute(channel.trackId)}
            >M</button>
            <button
              className={`w-5 h-5 flex items-center justify-center text-[0.6rem] font-bold cursor-pointer ${
                channel.solo ? 'bg-secondary-container text-secondary-dim' : 'bg-surface-container-highest text-on-surface-variant'
              }`}
              onClick={() => toggleChannelSolo(channel.trackId)}
            >S</button>
            <button className="w-5 h-5 flex items-center justify-center text-[0.6rem] font-bold bg-surface-container-highest text-error-dim cursor-pointer">
              R
            </button>
          </>
        ) : (
          <button className="w-full px-4 h-5 flex items-center justify-center text-[0.5rem] font-bold bg-surface-container-highest text-primary tracking-widest uppercase cursor-pointer">
            Limit
          </button>
        )}
      </div>

      {/* Fader + VU Meter */}
      <div className={`flex-1 flex ${isMaster ? 'gap-3' : 'gap-2'} pt-2`}>
        <div className={`fader-track h-full ${isMaster ? 'w-[6px]' : ''}`}>
          <div
            className={`absolute left-1/2 -translate-x-1/2 ${isMaster ? 'w-8 h-4 bg-primary border border-primary-container shadow-lg shadow-primary/10' : 'w-6 h-3 bg-surface-bright border border-outline/30 shadow-lg'} cursor-ns-resize`}
            style={{ top: `${100 - faderPos}%` }}
          />
        </div>
        {isMaster ? (
          <div className="flex gap-1">
            <div className="vu-meter w-2">
              <div className="vu-fill" style={{ height: `${(channel.peakL || 0.72) * 100}%` }} />
            </div>
            <div className="vu-meter w-2">
              <div className="vu-fill" style={{ height: `${(channel.peakR || 0.68) * 100}%` }} />
            </div>
          </div>
        ) : (
          <div className="vu-meter">
            <div className="vu-fill" style={{ height: `${channel.peakLevel * 100}%` }} />
          </div>
        )}
      </div>

      {/* dB readout */}
      <span className={`text-[0.6rem] font-mono ${isMaster ? 'text-primary' : 'text-on-surface-variant'}`}>
        {channel.volume?.toFixed(1) || '-2.8'} dB
      </span>
    </div>
  );
}

// ═══════════════════════════════════════════
// Waveform Canvas (Web Audio style)
// ═══════════════════════════════════════════
function _WaveformDisplay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    ctx.scale(dpr, dpr);

    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, w, h);

    // Draw waveform
    const mid = h / 2;
    ctx.strokeStyle = '#b9c3ff';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.5;

    for (let x = 0; x < w; x++) {
      const amp = (Math.sin(x * 0.05) * 0.4 + Math.sin(x * 0.13) * 0.3 + Math.sin(x * 0.31) * 0.2 + Math.random() * 0.1) * mid * 0.8;
      ctx.beginPath();
      ctx.moveTo(x, mid - amp);
      ctx.lineTo(x, mid + amp);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
  }, []);

  return <canvas ref={canvasRef} className="w-full h-full" />;
}

// ═══════════════════════════════════════════
// Audio Timeline
// ═══════════════════════════════════════════
function AudioTimeline() {
  const { playheadTime } = useTimelineStore();

  return (
    <section className="h-64 bg-surface-container-low flex flex-col border-t border-outline-variant/10">
      <div className="panel-header bg-surface-container">
        <div className="flex items-center gap-4">
          <span className="panel-title">Timeline</span>
          <div className="flex items-center gap-1 bg-surface-container-lowest px-2 py-0.5 rounded">
            <span className="text-secondary text-[0.65rem] font-mono">{secondsToTimecode(playheadTime)}</span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-on-surface-variant">
          <span className="material-symbols-outlined text-[16px] cursor-pointer">zoom_in</span>
          <span className="material-symbols-outlined text-[16px] cursor-pointer">sync</span>
          <span className="material-symbols-outlined text-[16px] cursor-pointer">settings</span>
        </div>
      </div>
      <div className="flex-1 flex relative overflow-hidden bg-surface-container-lowest">
        {/* Track Info */}
        <div className="w-32 bg-surface-container-low border-r border-outline-variant/10 flex flex-col">
          <div className="h-12 border-b border-outline-variant/5 flex items-center px-2">
            <span className="text-[0.6rem] text-on-surface-variant font-bold uppercase">Video 1</span>
          </div>
          <div className="h-16 border-b border-outline-variant/5 flex flex-col justify-center px-2 gap-1 bg-primary-container/10">
            <div className="flex justify-between items-center">
              <span className="text-[0.6rem] text-primary font-bold uppercase">Audio 1</span>
              <span className="text-[0.5rem] text-primary/50">Mono</span>
            </div>
            <div className="flex gap-1">
              <span className="w-3 h-3 text-[0.4rem] bg-surface-container-highest flex items-center justify-center text-on-surface-variant">M</span>
              <span className="w-3 h-3 text-[0.4rem] bg-secondary-container flex items-center justify-center text-secondary">S</span>
            </div>
          </div>
          <div className="h-16 border-b border-outline-variant/5 flex flex-col justify-center px-2 gap-1 bg-primary-container/5">
            <div className="flex justify-between items-center">
              <span className="text-[0.6rem] text-on-surface-variant font-bold uppercase">Audio 2</span>
              <span className="text-[0.5rem] text-on-surface-variant/50">Stereo</span>
            </div>
            <div className="flex gap-1">
              <span className="w-3 h-3 text-[0.4rem] bg-surface-container-highest flex items-center justify-center text-on-surface-variant">M</span>
              <span className="w-3 h-3 text-[0.4rem] bg-surface-container-highest flex items-center justify-center text-on-surface-variant">S</span>
            </div>
          </div>
        </div>
        {/* Timeline Content */}
        <div className="flex-1 overflow-x-auto relative">
          {/* Ruler */}
          <div className="h-6 bg-surface-container border-b border-outline-variant/20 relative">
            <div className="absolute left-[30%] top-0 bottom-0 w-px bg-primary/40 shadow-[0_0_8px_rgba(185,195,255,0.4)] z-20">
              <div className="w-3 h-3 bg-primary rotate-45 -translate-x-1/2 -mt-1.5" />
            </div>
            <div className="flex gap-20 px-4 text-[0.5rem] text-on-surface-variant pt-1 font-mono">
              <span>00:04:00:00</span><span>00:04:05:00</span><span>00:04:10:00</span><span>00:04:15:00</span><span>00:04:20:00</span>
            </div>
          </div>
          {/* Video Clip */}
          <div className="h-12 flex items-center px-4">
            <div className="h-8 w-64 bg-surface-variant border-t border-on-surface/10 rounded-sm relative flex items-center px-2 overflow-hidden">
              <span className="text-[0.55rem] font-medium z-10">SCENE_01_A.mp4</span>
            </div>
          </div>
          {/* Audio Track 1 */}
          <div className="h-16 flex items-center px-4 relative">
            <div className="h-12 w-48 bg-primary-container border-t border-primary/20 rounded-sm relative flex flex-col justify-center px-2 overflow-hidden group">
              <div className="absolute inset-0 opacity-40">
                <_WaveformDisplay />
              </div>
              <span className="text-[0.55rem] font-bold z-10 text-on-primary-container">DIA_Hero_04.wav</span>
            </div>
            <div className="h-12 w-32 ml-1 bg-primary-container border-t border-primary/20 rounded-sm relative flex flex-col justify-center px-2 overflow-hidden">
              <div className="absolute inset-0 opacity-40">
                <_WaveformDisplay />
              </div>
              <span className="text-[0.55rem] font-bold z-10 text-on-primary-container">DIA_Hero_05.wav</span>
            </div>
          </div>
          {/* Audio Track 2 */}
          <div className="h-16 flex items-center px-4">
            <div className="h-12 w-full bg-secondary-container/40 border-t border-secondary/20 rounded-sm relative flex flex-col justify-center px-2 overflow-hidden">
               <div className="absolute inset-0 opacity-20">
                <_WaveformDisplay />
              </div>
              <span className="text-[0.55rem] font-bold z-10 text-secondary-dim">AMB_Forest_Night_Loop.wav</span>
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
          <div className="panel-header bg-surface-container-low">
            <span className="panel-title">Program: Cinematic_Edit_v4</span>
            <div className="flex items-center gap-3">
              <span className="text-primary text-[0.6875rem] font-mono">{secondsToTimecode(playheadTime)}</span>
              <span className="material-symbols-outlined text-[14px] text-on-surface-variant cursor-pointer">more_vert</span>
            </div>
          </div>
          <div className="flex-1 bg-surface-container-lowest relative flex items-center justify-center group">
            <img
              className="max-h-full max-w-full object-contain opacity-90 shadow-2xl"
              src="https://images.unsplash.com/photo-1518710843675-2540dd7d2ce7?w=800&q=80"
              alt="Program"
              crossOrigin="anonymous"
            />
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-6 px-6 py-2 bg-surface-bright/40 backdrop-blur-xl rounded-full border border-on-surface/5 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="material-symbols-outlined cursor-pointer hover:text-primary">skip_previous</span>
              <span
                className="material-symbols-outlined cursor-pointer hover:text-primary"
                style={{ fontVariationSettings: "'FILL' 1" }}
                onClick={togglePlayback}
              >
                {isPlaying ? 'pause' : 'play_arrow'}
              </span>
              <span className="material-symbols-outlined cursor-pointer hover:text-primary">skip_next</span>
            </div>
          </div>
        </section>

        {/* Mixer */}
        <section className="flex-1 flex flex-col bg-surface-container">
          <div className="panel-header bg-surface-container-high">
            <span className="panel-title text-on-surface-variant">Audio Track Mixer</span>
            <div className="flex gap-2">
              <button className="text-[0.6rem] bg-surface-container-highest px-2 py-0.5 rounded text-on-surface-variant hover:text-on-surface cursor-pointer">Inserts</button>
              <button className="text-[0.6rem] bg-surface-container-highest px-2 py-0.5 rounded text-on-surface-variant hover:text-on-surface cursor-pointer">Sends</button>
            </div>
          </div>
          <div className="flex-1 flex overflow-x-auto p-1 gap-px bg-outline-variant/10">
            {channels.map((ch) => (
              <ChannelStrip key={ch.trackId} channel={ch} />
            ))}
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
