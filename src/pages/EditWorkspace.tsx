import { useRef, useEffect, useCallback } from 'react';
import { useTimelineStore, useProjectStore } from '../store';
import { secondsToTimecode } from '../utils';

// ═══════════════════════════════════════════
// Timeline Canvas Engine
// ═══════════════════════════════════════════
function TimelineCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { tracks, playheadTime, zoom, duration, markers, selectedClipIds, fps,
    setPlayheadTime, setZoom, selectClip, deselectAll } = useTimelineStore();

  const pixelsPerSecond = 40 * zoom;
  const rulerHeight = 24;
  const trackHeaderWidth = 48;

  const drawTimeline = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;

    // Clear
    ctx.fillStyle = '#0e0e10';
    ctx.fillRect(0, 0, w, h);

    // ─── Time Ruler ───
    ctx.fillStyle = '#19191d';
    ctx.fillRect(0, 0, w, rulerHeight);
    ctx.strokeStyle = 'rgba(71,71,77,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, rulerHeight);
    ctx.lineTo(w, rulerHeight);
    ctx.stroke();

    // Ruler ticks
    const startSec = 0;
    const endSec = duration;
    const majorInterval = zoom < 0.5 ? 10 : zoom < 2 ? 5 : 1;
    for (let sec = startSec; sec <= endSec; sec += majorInterval) {
      const x = trackHeaderWidth + sec * pixelsPerSecond;
      if (x < 0 || x > w) continue;

      // Major tick
      ctx.strokeStyle = 'rgba(171,170,177,0.3)';
      ctx.beginPath();
      ctx.moveTo(x, 14);
      ctx.lineTo(x, rulerHeight);
      ctx.stroke();

      // Timecode label
      ctx.fillStyle = '#abaab1';
      ctx.font = '9px monospace';
      ctx.fillText(secondsToTimecode(sec, fps), x + 2, 10);

      // Minor ticks
      for (let i = 1; i < 5; i++) {
        const mx = x + (i * majorInterval * pixelsPerSecond) / 5;
        if (mx > w) break;
        ctx.strokeStyle = 'rgba(71,71,77,0.2)';
        ctx.beginPath();
        ctx.moveTo(mx, 18);
        ctx.lineTo(mx, rulerHeight);
        ctx.stroke();
      }
    }

    // ─── Tracks & Clips ───
    let y = rulerHeight;
    for (const track of tracks) {
      const trackH = track.height;

      // Track background
      ctx.fillStyle = track.type === 'video' ? '#131316' : '#111114';
      ctx.fillRect(0, y, w, trackH);

      // Track header
      ctx.fillStyle = '#1f1f24';
      ctx.fillRect(0, y, trackHeaderWidth, trackH);
      ctx.strokeStyle = 'rgba(71,71,77,0.1)';
      ctx.beginPath();
      ctx.moveTo(trackHeaderWidth, y);
      ctx.lineTo(trackHeaderWidth, y + trackH);
      ctx.stroke();

      // Track name
      ctx.fillStyle = track.type === 'video' ? '#e6e4ec' : '#b9c3ff';
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.fillText(track.name, 10, y + trackH / 2 + 3);

      // Lock icon
      if (track.locked) {
        ctx.fillStyle = '#ef4444';
        ctx.fillText('🔒', 32, y + trackH / 2 + 3);
      }

      // Track border
      ctx.strokeStyle = 'rgba(71,71,77,0.08)';
      ctx.beginPath();
      ctx.moveTo(0, y + trackH);
      ctx.lineTo(w, y + trackH);
      ctx.stroke();

      // ─── Clips ───
      for (const clip of track.clips) {
        const cx = trackHeaderWidth + clip.startTime * pixelsPerSecond;
        const cw = (clip.endTime - clip.startTime) * pixelsPerSecond;
        const cy = y + 2;
        const ch = trackH - 4;

        const isSelected = selectedClipIds.includes(clip.id);
        const baseColor = track.type === 'video' ? '#4900ad' : 'rgba(0, 52, 192, 0.8)';
        const selectedColor = track.type === 'video' ? '#6a37d4' : 'rgba(30, 80, 220, 0.9)';

        // Clip body
        ctx.fillStyle = isSelected ? selectedColor : baseColor;
        ctx.beginPath();
        ctx.roundRect(cx, cy, cw, ch, 2);
        ctx.fill();

        // Top border
        ctx.strokeStyle = track.type === 'video' ? 'rgba(172,138,255,0.3)' : 'rgba(185,195,255,0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + cw, cy);
        ctx.stroke();

        // Selection border
        if (isSelected) {
          ctx.strokeStyle = '#b9c3ff';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.roundRect(cx, cy, cw, ch, 2);
          ctx.stroke();
        }

        // Clip label
        ctx.save();
        ctx.beginPath();
        ctx.rect(cx + 4, cy, cw - 8, ch);
        ctx.clip();
        ctx.fillStyle = '#e6e4ec';
        ctx.font = 'bold 9px Inter, sans-serif';
        ctx.fillText(clip.label, cx + 6, cy + ch / 2 + 3);
        ctx.restore();

        // Waveform for audio clips
        if (track.type === 'audio') {
          ctx.save();
          ctx.beginPath();
          ctx.rect(cx, cy, cw, ch);
          ctx.clip();
          ctx.globalAlpha = 0.3;
          const waveY = cy + ch / 2;
          ctx.strokeStyle = '#b9c3ff';
          ctx.lineWidth = 1;
          ctx.beginPath();
          for (let wx = cx; wx < cx + cw; wx += 2) {
            const amp = (Math.sin(wx * 0.1) * 0.5 + Math.sin(wx * 0.23) * 0.3 + Math.sin(wx * 0.47) * 0.2) * ch * 0.35;
            ctx.moveTo(wx, waveY - amp);
            ctx.lineTo(wx, waveY + amp);
          }
          ctx.stroke();
          ctx.globalAlpha = 1;
          ctx.restore();
        }

        // Opacity/volume indicator
        if (clip.opacity < 1 || clip.volume < 1) {
          const val = track.type === 'video' ? clip.opacity : clip.volume;
          const lineY = cy + ch * (1 - val);
          ctx.strokeStyle = '#facc15';
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          ctx.moveTo(cx, lineY);
          ctx.lineTo(cx + cw, lineY);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Trim handles
        ctx.fillStyle = 'rgba(185,195,255,0.6)';
        ctx.fillRect(cx, cy, 3, ch);
        ctx.fillRect(cx + cw - 3, cy, 3, ch);
      }

      y += trackH;
    }

    // ─── Markers ───
    for (const marker of markers) {
      const mx = trackHeaderWidth + marker.time * pixelsPerSecond;
      if (mx < trackHeaderWidth || mx > w) continue;
      ctx.fillStyle = marker.color;
      ctx.beginPath();
      ctx.moveTo(mx - 4, 0);
      ctx.lineTo(mx + 4, 0);
      ctx.lineTo(mx, 6);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = marker.color + '40';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(mx, 6);
      ctx.lineTo(mx, h);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // ─── Playhead ───
    const px = trackHeaderWidth + playheadTime * pixelsPerSecond;
    if (px >= trackHeaderWidth) {
      // Playhead line
      ctx.strokeStyle = '#b9c3ff';
      ctx.lineWidth = 1.5;
      ctx.shadowColor = 'rgba(185,195,255,0.6)';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(px, 0);
      ctx.lineTo(px, h);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Playhead head
      ctx.fillStyle = '#b9c3ff';
      ctx.beginPath();
      ctx.moveTo(px - 5, 0);
      ctx.lineTo(px + 5, 0);
      ctx.lineTo(px, 8);
      ctx.closePath();
      ctx.fill();
    }
  }, [tracks, playheadTime, zoom, duration, markers, selectedClipIds, pixelsPerSecond, fps]);

  // Animation loop for playback
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const animate = (now: number) => {
      const state = useTimelineStore.getState();
      if (state.isPlaying) {
        const dt = (now - lastTime) / 1000;
        const newTime = state.playheadTime + dt;
        if (newTime < state.duration) {
          state.setPlayheadTime(newTime);
        } else {
          state.togglePlayback();
          state.setPlayheadTime(0);
        }
      }
      lastTime = now;
      drawTimeline();
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [drawTimeline]);

  // Resize
  useEffect(() => {
    const observer = new ResizeObserver(() => drawTimeline());
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [drawTimeline]);

  // Click handler for clip selection and playhead
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    // Check if on ruler → set playhead
    if (my < rulerHeight) {
      const time = (mx - trackHeaderWidth) / pixelsPerSecond;
      if (time >= 0) setPlayheadTime(time);
      return;
    }

    // Check clips
    let y = rulerHeight;
    for (const track of tracks) {
      const trackH = track.height;
      for (const clip of track.clips) {
        const cx = trackHeaderWidth + clip.startTime * pixelsPerSecond;
        const cw = (clip.endTime - clip.startTime) * pixelsPerSecond;
        if (mx >= cx && mx <= cx + cw && my >= y + 2 && my <= y + trackH - 2) {
          selectClip(clip.id, e.shiftKey);
          return;
        }
      }
      y += trackH;
    }

    // Click on empty space → set playhead, deselect
    deselectAll();
    const time = (mx - trackHeaderWidth) / pixelsPerSecond;
    if (time >= 0) setPlayheadTime(time);
  }, [tracks, pixelsPerSecond, selectClip, deselectAll, setPlayheadTime]);

  // Scroll zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom(zoom + delta);
    }
  }, [zoom, setZoom]);

  return (
    <div ref={containerRef} className="flex-1 relative overflow-hidden" onWheel={handleWheel}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 cursor-pointer"
        onClick={handleCanvasClick}
      />
    </div>
  );
}

// ═══════════════════════════════════════════
// Media Bin
// ═══════════════════════════════════════════
function MediaBin() {
  const assets = useProjectStore((s) => s.assets);
  const projectName = useProjectStore((s) => s.projectName);

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
        {/* Drop zone  */}
        <div className="border border-dashed border-outline-variant/30 rounded p-4 text-center mt-4 hover:border-primary/50 transition-colors cursor-pointer">
          <span className="material-symbols-outlined text-on-surface-variant mb-1 block">add_circle_outline</span>
          <span className="text-[0.6rem] text-on-surface-variant">Drag files here or click to import</span>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════
// Source & Program Monitors
// ═══════════════════════════════════════════
function Monitors() {
  const { playheadTime, isPlaying, togglePlayback, stepForward, stepBackward } = useTimelineStore();

  return (
    <section className="flex-1 flex flex-col bg-surface-container-lowest">
      <div className="flex flex-1">
        {/* Source Monitor */}
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
              <div className="absolute inset-0 border border-primary/20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                {/* Safe zone overlay */}
                <div className="absolute inset-[5%] border border-primary/10" />
                <div className="absolute inset-[10%] border border-primary/5" />
              </div>
            </div>
          </div>
          <div className="h-10 bg-surface-container flex items-center justify-center gap-6">
            <button className="material-symbols-outlined text-on-surface-variant hover:text-primary cursor-pointer">keyboard_arrow_left</button>
            <button className="material-symbols-outlined text-on-surface hover:text-primary cursor-pointer">play_arrow</button>
            <button className="material-symbols-outlined text-on-surface-variant hover:text-primary cursor-pointer">keyboard_arrow_right</button>
          </div>
        </div>

        {/* Program Monitor */}
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
              {/* Rule of thirds grid */}
              <div className="absolute inset-0 pointer-events-none opacity-0 hover:opacity-30 transition-opacity">
                <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/30" />
                <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/30" />
                <div className="absolute top-1/3 left-0 right-0 h-px bg-white/30" />
                <div className="absolute top-2/3 left-0 right-0 h-px bg-white/30" />
              </div>
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
}

// ═══════════════════════════════════════════
// Timeline Toolbar
// ═══════════════════════════════════════════
function TimelineToolbar() {
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
}

// ═══════════════════════════════════════════
// Main Edit Workspace
// ═══════════════════════════════════════════
export default function EditWorkspace() {
  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const state = useTimelineStore.getState();
      switch (e.key) {
        case ' ':
          e.preventDefault();
          state.togglePlayback();
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (e.shiftKey) state.setPlayheadTime(state.playheadTime + 5);
          else state.stepForward();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (e.shiftKey) state.setPlayheadTime(Math.max(0, state.playheadTime - 5));
          else state.stepBackward();
          break;
        case 'i':
        case 'I':
          state.setInPoint();
          break;
        case 'o':
        case 'O':
          state.setOutPoint();
          break;
        case 'm':
        case 'M':
          state.addMarker('Marker', '#4ade80');
          break;
        case 'Delete':
          for (const clipId of state.selectedClipIds) {
            for (const track of state.tracks) {
              if (track.clips.some(c => c.id === clipId)) {
                state.removeClip(track.id, clipId);
              }
            }
          }
          break;
        case 'Home':
          state.setPlayheadTime(0);
          break;
        case 'End':
          state.setPlayheadTime(state.duration);
          break;
      }
      // Ctrl+K: Cut at playhead
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        state.cutAtPlayhead();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-surface">
      {/* Upper panels */}
      <div className="flex-1 flex min-h-0 border-b border-outline-variant/10">
        <MediaBin />
        <Monitors />
      </div>
      {/* Timeline */}
      <section className="h-[40%] min-h-[200px] bg-surface-container-low flex flex-col">
        <TimelineToolbar />
        <TimelineCanvas />
      </section>
    </div>
  );
}
