import { useRef, useEffect, useCallback, useState } from 'react';
import { useColorStore, useTimelineStore } from '../store';
import { secondsToTimecode } from '../utils';

// ═══════════════════════════════════════════
// Video Scopes (Canvas-based)
// ═══════════════════════════════════════════
function VideoScopes() {
  const paradeRef = useRef<HTMLCanvasElement>(null);
  const waveformRef = useRef<HTMLCanvasElement>(null);

  const drawScopes = useCallback(() => {
    // RGB Parade
    const pc = paradeRef.current;
    if (pc) {
      const ctx = pc.getContext('2d');
      if (ctx) {
        const dpr = window.devicePixelRatio || 1;
        pc.width = pc.offsetWidth * dpr;
        pc.height = pc.offsetHeight * dpr;
        ctx.scale(dpr, dpr);
        const w = pc.offsetWidth;
        const h = pc.offsetHeight;

        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, w, h);

        // Grid lines
        ctx.strokeStyle = 'rgba(71,71,77,0.2)';
        ctx.lineWidth = 0.5;
        for (let i = 0; i < 4; i++) {
          const y = (h / 4) * i;
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
          ctx.stroke();
        }

        const third = w / 3;
        // Red channel
        ctx.globalAlpha = 0.4;
        for (let x = 0; x < third; x += 1) {
          const val = (Math.sin(x * 0.08) * 0.3 + Math.sin(x * 0.21) * 0.2 + 0.5) * h;
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(x, h - val, 1, 3);
        }
        // Green channel
        for (let x = 0; x < third; x += 1) {
          const val = (Math.sin(x * 0.06 + 1) * 0.35 + Math.sin(x * 0.18) * 0.25 + 0.55) * h;
          ctx.fillStyle = '#22c55e';
          ctx.fillRect(third + x, h - val, 1, 3);
        }
        // Blue channel
        for (let x = 0; x < third; x += 1) {
          const val = (Math.sin(x * 0.1 + 2) * 0.25 + Math.sin(x * 0.15) * 0.2 + 0.4) * h;
          ctx.fillStyle = '#3b82f6';
          ctx.fillRect(third * 2 + x, h - val, 1, 3);
        }
        ctx.globalAlpha = 1;

        // Labels
        ctx.fillStyle = '#abaab1';
        ctx.font = '9px monospace';
        ctx.fillText('RGB Parade', 4, 12);
      }
    }

    // Waveform (Luma)
    const wc = waveformRef.current;
    if (wc) {
      const ctx = wc.getContext('2d');
      if (ctx) {
        const dpr = window.devicePixelRatio || 1;
        wc.width = wc.offsetWidth * dpr;
        wc.height = wc.offsetHeight * dpr;
        ctx.scale(dpr, dpr);
        const w = wc.offsetWidth;
        const h = wc.offsetHeight;

        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, w, h);

        // Grid
        for (let i = 0; i <= 10; i++) {
          const y = (h / 10) * i;
          ctx.strokeStyle = 'rgba(71,71,77,0.15)';
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
          ctx.stroke();
          if (i % 2 === 0) {
            ctx.fillStyle = '#47474d';
            ctx.font = '7px monospace';
            ctx.fillText(`${100 - i * 10}`, 2, y + 8);
          }
        }

        // Luma waveform
        ctx.globalAlpha = 0.3;
        for (let x = 0; x < w; x += 1) {
          const val = (Math.sin(x * 0.04) * 0.2 + Math.sin(x * 0.11) * 0.15 + Math.sin(x * 0.27) * 0.1 + 0.5) * h;
          ctx.fillStyle = '#e6e4ec';
          ctx.fillRect(x, h - val, 1, 2);
          // Spread
          const spread = (Math.random() - 0.5) * h * 0.15;
          ctx.fillRect(x, h - val + spread, 1, 1);
        }
        ctx.globalAlpha = 1;

        ctx.fillStyle = '#abaab1';
        ctx.font = '9px monospace';
        ctx.fillText('Waveform (Luma)', 4, 12);
      }
    }
  }, []);

  useEffect(() => {
    drawScopes();
    const observer = new ResizeObserver(() => drawScopes());
    if (paradeRef.current) observer.observe(paradeRef.current);
    if (waveformRef.current) observer.observe(waveformRef.current);
    return () => observer.disconnect();
  }, [drawScopes]);

  return (
    <div className="w-1/4 bg-surface-container flex flex-col rounded-sm overflow-hidden">
      <div className="panel-header">
        <span className="panel-title">Lumetri Scopes</span>
        <span className="material-symbols-outlined text-[14px] text-on-surface-variant cursor-pointer">more_vert</span>
      </div>
      <div className="flex-1 flex flex-col p-2 gap-2 bg-surface-container-lowest">
        <div className="flex-1 relative">
          <canvas ref={paradeRef} className="w-full h-full" />
        </div>
        <div className="flex-1 relative border-t border-outline-variant/20 pt-1">
          <canvas ref={waveformRef} className="w-full h-full" />
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// Interactive Color Wheel
// ═══════════════════════════════════════════
function ColorWheel({ label, size = 128, value, onChange }: {
  label: string;
  size?: number;
  value: { x: number; y: number };
  onChange: (pos: { x: number; y: number }) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const drawWheel = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const r = size / 2 - 2;
    const innerR = r - 12;

    // Outer ring gradient
    for (let angle = 0; angle < 360; angle += 1) {
      const rad = (angle * Math.PI) / 180;
      ctx.beginPath();
      ctx.moveTo(cx + innerR * Math.cos(rad), cy + innerR * Math.sin(rad));
      ctx.lineTo(cx + r * Math.cos(rad), cy + r * Math.sin(rad));
      const nextRad = ((angle + 2) * Math.PI) / 180;
      ctx.lineTo(cx + r * Math.cos(nextRad), cy + r * Math.sin(nextRad));
      ctx.lineTo(cx + innerR * Math.cos(nextRad), cy + innerR * Math.sin(nextRad));
      ctx.closePath();
      ctx.fillStyle = `hsl(${angle}, 60%, 30%)`;
      ctx.fill();
    }

    // Inner dark circle
    ctx.beginPath();
    ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
    ctx.fillStyle = '#25252b';
    ctx.fill();

    // Cross hairs
    ctx.strokeStyle = 'rgba(71,71,77,0.3)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(cx - innerR + 4, cy);
    ctx.lineTo(cx + innerR - 4, cy);
    ctx.moveTo(cx, cy - innerR + 4);
    ctx.lineTo(cx, cy + innerR - 4);
    ctx.stroke();

    // Indicator dot
    const dotX = cx + value.x * innerR * 0.8;
    const dotY = cy + value.y * innerR * 0.8;
    ctx.beginPath();
    ctx.arc(dotX, dotY, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#b9c3ff';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Glow
    ctx.shadowColor = 'rgba(185,195,255,0.4)';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(dotX, dotY, 2, 0, Math.PI * 2);
    ctx.fillStyle = '#b9c3ff';
    ctx.fill();
    ctx.shadowBlur = 0;
  }, [value, size]);

  useEffect(() => { drawWheel(); }, [drawWheel]);

  const handlePointer = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const cx = size / 2;
    const cy = size / 2;
    const innerR = size / 2 - 14;
    const px = ((e.clientX - rect.left) / rect.width) * size;
    const py = ((e.clientY - rect.top) / rect.height) * size;
    const dx = (px - cx) / (innerR * 0.8);
    const dy = (py - cy) / (innerR * 0.8);
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist <= 1) {
      onChange({ x: dx, y: dy });
    }
  }, [size, onChange]);

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-[0.625rem] text-on-surface-variant uppercase">{label}</span>
      <canvas
        ref={canvasRef}
        style={{ width: size, height: size }}
        className="cursor-crosshair"
        onMouseDown={(e) => { setIsDragging(true); handlePointer(e); }}
        onMouseMove={(e) => { if (isDragging) handlePointer(e); }}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onDoubleClick={() => onChange({ x: 0, y: 0 })}
      />
    </div>
  );
}

// ═══════════════════════════════════════════
// Curves Editor (Canvas-based interactive)
// ═══════════════════════════════════════════
function CurvesEditor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeCurve, setActiveCurve] = useState<'master' | 'r' | 'g' | 'b'>('master');
  const { grading } = useColorStore();
  const curvePoints = grading.curves[0] || [{ x: 0, y: 0 }, { x: 1, y: 1 }];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const w = rect.width;
    const h = rect.height;

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, w, h);

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 0.5;
    for (let i = 1; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo((w / 4) * i, 0);
      ctx.lineTo((w / 4) * i, h);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, (h / 4) * i);
      ctx.lineTo(w, (h / 4) * i);
      ctx.stroke();
    }

    // Diagonal reference
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(w, 0);
    ctx.stroke();

    // Curve
    const colors: Record<string, string> = { master: '#ffffff', r: '#ef4444', g: '#22c55e', b: '#3b82f6' };
    ctx.strokeStyle = colors[activeCurve];
    ctx.lineWidth = 2;
    ctx.beginPath();

    // Smooth curve through points
    for (let px = 0; px <= w; px++) {
      const t = px / w;
      // Simple Catmull-Rom interpolation
      let y = 0;
      for (let i = 0; i < curvePoints.length - 1; i++) {
        const p1 = curvePoints[i];
        const p2 = curvePoints[i + 1];
        if (t >= p1.x && t <= p2.x) {
          const lt = (t - p1.x) / (p2.x - p1.x);
          y = p1.y + (p2.y - p1.y) * lt;
          // Add slight S-curve
          y += Math.sin(lt * Math.PI) * 0.02;
          break;
        }
      }
      const canvasY = h - y * h;
      if (px === 0) ctx.moveTo(px, canvasY);
      else ctx.lineTo(px, canvasY);
    }
    ctx.stroke();

    // Control points
    for (const pt of curvePoints) {
      const px = pt.x * w;
      const py = h - pt.y * h;
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = colors[activeCurve];
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }, [curvePoints, activeCurve]);

  return (
    <section className="pt-4 border-t border-outline-variant/10">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[0.6875rem] font-bold uppercase tracking-widest text-on-surface">Curves</span>
        <div className="flex gap-2">
          {(['master', 'r', 'g', 'b'] as const).map((ch) => (
            <button
              key={ch}
              className={`w-3 h-3 rounded-full cursor-pointer border ${activeCurve === ch ? 'border-white scale-125' : 'border-transparent'}`}
              style={{ background: ch === 'master' ? '#fff' : ch === 'r' ? '#ef4444' : ch === 'g' ? '#22c55e' : '#3b82f6' }}
              onClick={() => setActiveCurve(ch)}
            />
          ))}
        </div>
      </div>
      <div className="aspect-square bg-surface-container-lowest rounded border border-outline-variant/20 relative overflow-hidden">
        <canvas ref={canvasRef} className="w-full h-full cursor-crosshair" />
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════
// Slider Control
// ═══════════════════════════════════════════
function Slider({ label, value, min, max, unit, onChange }: {
  label: string;
  value: number;
  min: number;
  max: number;
  unit?: string;
  onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div>
      <div className="flex justify-between mb-1">
        <label className="text-[0.625rem] text-on-surface-variant uppercase">{label}</label>
        <span className="text-[0.625rem] text-on-surface font-mono">
          {value > 0 ? '+' : ''}{typeof value === 'number' ? value.toFixed(value % 1 === 0 ? 0 : 2) : value}{unit || ''}
        </span>
      </div>
      <div className="slider-track">
        <input
          type="range"
          min={min}
          max={max}
          step={(max - min) / 200}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        <div className="slider-thumb" style={{ left: `${pct}%` }} />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// Main Color Workspace
// ═══════════════════════════════════════════
export default function ColorWorkspace() {
  const { grading, updateGrading } = useColorStore();
  const { playheadTime, isPlaying, togglePlayback } = useTimelineStore();

  return (
    <div className="flex-1 flex flex-col bg-surface-container-low overflow-hidden">
      {/* Top area: Scopes + Monitor */}
      <div className="flex-1 flex gap-[2px] p-1 overflow-hidden">
        {/* Video Scopes */}
        <VideoScopes />

        {/* Program Monitor */}
        <div className="flex-1 bg-surface-container-lowest flex flex-col rounded-sm overflow-hidden border border-outline-variant/10">
          <div className="panel-header">
            <div className="flex items-center gap-4">
              <span className="text-[0.6875rem] font-medium uppercase tracking-widest text-on-surface">Program: Scene_01_A</span>
              <span className="text-[0.6875rem] text-primary font-mono">{secondsToTimecode(playheadTime)}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[0.625rem] text-on-surface-variant">FIT</span>
              <span className="material-symbols-outlined text-[14px] text-on-surface-variant cursor-pointer">settings</span>
            </div>
          </div>
          <div className="flex-1 relative group cursor-crosshair bg-black flex items-center justify-center">
            <img
              className="max-h-full max-w-full object-contain opacity-90"
              src="https://images.unsplash.com/photo-1511497584788-876760111969?w=800&q=80"
              alt="Color grading preview"
              crossOrigin="anonymous"
              style={{
                filter: `brightness(${1 + grading.exposure * 0.2}) contrast(${1 + grading.contrast * 0.01}) saturate(${grading.saturation / 100})`,
              }}
            />
            {/* Scrubber */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-surface-container-highest">
              <div className="h-full bg-primary w-[45%] relative">
                <div className="absolute right-0 top-[-4px] w-3 h-3 bg-primary rounded-full shadow-lg shadow-primary/20" />
              </div>
            </div>
          </div>
          <div className="h-12 flex items-center justify-center gap-6 bg-surface-container">
            <span className="material-symbols-outlined text-on-surface-variant hover:text-on-surface cursor-pointer">skip_previous</span>
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container-highest border border-outline-variant/20 hover:border-primary/50 transition-colors cursor-pointer"
              onClick={togglePlayback}
            >
              <span className="material-symbols-outlined text-on-surface text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                {isPlaying ? 'pause' : 'play_arrow'}
              </span>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant hover:text-on-surface cursor-pointer">skip_next</span>
          </div>
        </div>
      </div>

      {/* Bottom: Mini timeline */}
      <div className="h-36 bg-surface-container p-1 border-t border-outline-variant/10">
        <div className="h-full bg-surface-container-lowest rounded-sm overflow-hidden flex flex-col">
          <div className="h-6 flex items-center bg-surface-container-high px-2 gap-4">
            <span className="text-[10px] uppercase font-bold text-on-surface-variant">Timeline</span>
            <span className="text-[10px] text-primary font-mono">V1</span>
          </div>
          <div className="flex-1 relative p-2 overflow-x-auto">
            <div className="flex gap-12 border-b border-outline-variant/20 mb-2 pb-1">
              {['00:00:00', '00:01:00', '00:02:00', '00:03:00', '00:04:00', '00:05:00'].map((tc) => (
                <span key={tc} className="text-[9px] font-mono text-on-surface-variant">{tc}</span>
              ))}
            </div>
            <div className="space-y-1">
              <div className="h-8 flex gap-1">
                <div className="w-24 bg-surface-container-highest border-l-2 border-secondary rounded-sm flex items-center px-2">
                  <span className="text-[10px] truncate">Intro_Wide.mov</span>
                </div>
                <div className="w-48 bg-secondary-container border-l-2 border-secondary rounded-sm flex items-center px-2 ring-1 ring-secondary/40">
                  <span className="text-[10px] truncate text-on-secondary-container">Scene_01_A.mov</span>
                </div>
                <div className="w-32 bg-surface-container-highest border-l-2 border-secondary rounded-sm flex items-center px-2">
                  <span className="text-[10px] truncate">Scene_01_B.mov</span>
                </div>
              </div>
              <div className="h-6 flex gap-1">
                <div className="w-24 bg-primary-container/40 border-l-2 border-primary rounded-sm flex items-center px-2">
                  <span className="text-[10px] truncate">Audio_Sync_01</span>
                </div>
                <div className="w-48 bg-primary-container border-l-2 border-primary rounded-sm flex items-center px-2">
                  <span className="text-[10px] truncate">Ambience_Loop</span>
                </div>
              </div>
            </div>
            <div className="absolute top-0 bottom-0 left-[200px] w-[1px] bg-primary z-10">
              <div className="w-2 h-2 bg-primary rounded-full -ml-[3.5px]" />
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel: Lumetri Color */}
      <aside className="fixed right-0 top-10 bottom-6 w-80 bg-surface-container border-l border-outline-variant/20 overflow-y-auto z-30 flex flex-col" style={{ scrollbarWidth: 'thin' }}>
        <div className="h-10 flex items-center px-4 bg-surface-container-high border-b border-outline-variant/10 shrink-0">
          <span className="text-[0.75rem] font-bold uppercase tracking-wider text-primary">Lumetri Color</span>
        </div>
        <div className="p-4 space-y-6">
          {/* Basic Correction */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[0.6875rem] font-bold uppercase tracking-widest text-on-surface">Basic Correction</span>
              <span className="material-symbols-outlined text-[14px] cursor-pointer">expand_less</span>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-[0.625rem] text-on-surface-variant uppercase">Temperature</label>
                  <span className="text-[0.625rem] text-primary font-mono">{grading.temperature}K</span>
                </div>
                <div className="h-1 bg-gradient-to-r from-blue-400 via-white to-orange-400 rounded-full relative">
                  <input
                    type="range"
                    min={2000}
                    max={10000}
                    value={grading.temperature}
                    onChange={(e) => updateGrading({ temperature: parseFloat(e.target.value) })}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="absolute top-1/2 -translate-y-1/2 w-1 h-3 bg-on-surface rounded-full shadow-sm" style={{ left: `${((grading.temperature - 2000) / 8000) * 100}%` }} />
                </div>
              </div>
              <Slider label="Exposure" value={grading.exposure} min={-5} max={5} onChange={(v) => updateGrading({ exposure: v })} />
              <Slider label="Contrast" value={grading.contrast} min={-100} max={100} onChange={(v) => updateGrading({ contrast: v })} />
              <div className="grid grid-cols-2 gap-4">
                <Slider label="Highlights" value={grading.highlightsVal} min={-100} max={100} onChange={(v) => updateGrading({ highlightsVal: v })} />
                <Slider label="Shadows" value={grading.shadowsVal} min={-100} max={100} onChange={(v) => updateGrading({ shadowsVal: v })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Slider label="Whites" value={grading.whites} min={-100} max={100} onChange={(v) => updateGrading({ whites: v })} />
                <Slider label="Blacks" value={grading.blacks} min={-100} max={100} onChange={(v) => updateGrading({ blacks: v })} />
              </div>
              <Slider label="Saturation" value={grading.saturation} min={0} max={200} onChange={(v) => updateGrading({ saturation: v })} />
              <Slider label="Vibrance" value={grading.vibrance} min={-100} max={100} onChange={(v) => updateGrading({ vibrance: v })} />
            </div>
          </section>

          {/* Color Wheels */}
          <section className="pt-4 border-t border-outline-variant/10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[0.6875rem] font-bold uppercase tracking-widest text-on-surface">Color Wheels & Match</span>
            </div>
            <div className="grid grid-cols-1 gap-6">
              <ColorWheel
                label="Shadows"
                size={128}
                value={{ x: grading.shadows.x, y: grading.shadows.y }}
                onChange={(pos) => updateGrading({ shadows: { ...grading.shadows, ...pos } })}
              />
              <div className="grid grid-cols-2 gap-4">
                <ColorWheel
                  label="Midtones"
                  size={96}
                  value={{ x: grading.midtones.x, y: grading.midtones.y }}
                  onChange={(pos) => updateGrading({ midtones: { ...grading.midtones, ...pos } })}
                />
                <ColorWheel
                  label="Highlights"
                  size={96}
                  value={{ x: grading.highlights.x, y: grading.highlights.y }}
                  onChange={(pos) => updateGrading({ highlights: { ...grading.highlights, ...pos } })}
                />
              </div>
            </div>
          </section>

          {/* Curves */}
          <CurvesEditor />

          {/* LUT Section */}
          <section className="pt-4 border-t border-outline-variant/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[0.6875rem] font-bold uppercase tracking-widest text-on-surface">LUT</span>
            </div>
            <div className="space-y-3">
              <div className="bg-surface-container-highest p-2 rounded flex items-center gap-2 cursor-pointer hover:bg-surface-bright transition-colors">
                <span className="material-symbols-outlined text-sm text-on-surface-variant">upload_file</span>
                <span className="text-[0.625rem] text-on-surface-variant">Import .cube / .3dl file</span>
              </div>
              <Slider label="LUT Intensity" value={grading.lutIntensity} min={0} max={100} unit="%" onChange={(v) => updateGrading({ lutIntensity: v })} />
              <div className="grid grid-cols-3 gap-1">
                {['Kodak 2383', 'Fuji 3510', 'Cinematic', 'Teal & Orange', 'Film Noir', 'Vintage'].map((lut) => (
                  <button key={lut} className="text-[0.5rem] bg-surface-container-highest px-2 py-1.5 rounded text-on-surface-variant hover:text-primary hover:bg-surface-bright transition-colors cursor-pointer text-center">
                    {lut}
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}
