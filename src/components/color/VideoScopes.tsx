import React, { useRef, useEffect, useCallback, memo } from 'react';

const VideoScopes: React.FC = () => {
  const paradeRef = useRef<HTMLCanvasElement>(null);
  const waveformRef = useRef<HTMLCanvasElement>(null);

  const drawScopes = useCallback(() => {
    // RGB Parade
    const pc = paradeRef.current;
    if (pc) {
      const ctx = pc.getContext('2d', { alpha: false });
      if (ctx) {
        const dpr = window.devicePixelRatio || 1;
        if (pc.width !== Math.floor(pc.offsetWidth * dpr) || pc.height !== Math.floor(pc.offsetHeight * dpr)) {
          pc.width = pc.offsetWidth * dpr;
          pc.height = pc.offsetHeight * dpr;
          ctx.scale(dpr, dpr);
        }
        const w = pc.offsetWidth;
        const h = pc.offsetHeight;

        ctx.fillStyle = '#0a0a0c';
        ctx.fillRect(0, 0, w, h);

        // Grid lines
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.lineWidth = 0.5;
        for (let i = 0; i <= 4; i++) {
          const y = (h / 4) * i;
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
        }

        const third = w / 3;
        ctx.globalAlpha = 0.6;
        
        // Red channel
        for (let x = 0; x < third; x += 1) {
          const noise = (Math.sin(x * 0.08) * 0.3 + Math.sin(x * 0.21) * 0.2 + 0.5);
          const val = noise * h * 0.8;
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(x, h - val, 1, 2);
        }
        // Green channel
        for (let x = 0; x < third; x += 1) {
          const noise = (Math.sin(x * 0.06 + 1) * 0.35 + Math.sin(x * 0.18) * 0.25 + 0.55);
          const val = noise * h * 0.8;
          ctx.fillStyle = '#22c55e';
          ctx.fillRect(third + x, h - val, 1, 2);
        }
        // Blue channel
        for (let x = 0; x < third; x += 1) {
          const noise = (Math.sin(x * 0.1 + 2) * 0.25 + Math.sin(x * 0.15) * 0.2 + 0.4);
          const val = noise * h * 0.8;
          ctx.fillStyle = '#3b82f6';
          ctx.fillRect(third * 2 + x, h - val, 1, 2);
        }
        ctx.globalAlpha = 1;

        ctx.fillStyle = '#6b7280';
        ctx.font = 'bold 9px Inter, sans-serif';
        ctx.fillText('RGB PARADE', 6, 14);
      }
    }

    // Waveform (Luma)
    const wc = waveformRef.current;
    if (wc) {
      const ctx = wc.getContext('2d', { alpha: false });
      if (ctx) {
        const dpr = window.devicePixelRatio || 1;
        if (wc.width !== Math.floor(wc.offsetWidth * dpr) || wc.height !== Math.floor(wc.offsetHeight * dpr)) {
          wc.width = wc.offsetWidth * dpr;
          wc.height = wc.offsetHeight * dpr;
          ctx.scale(dpr, dpr);
        }
        const w = wc.offsetWidth;
        const h = wc.offsetHeight;

        ctx.fillStyle = '#0a0a0c';
        ctx.fillRect(0, 0, w, h);

        for (let i = 0; i <= 10; i++) {
          const y = (h / 10) * i;
          ctx.strokeStyle = 'rgba(255,255,255,0.03)';
          ctx.lineWidth = 0.5;
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
        }

        ctx.globalAlpha = 0.4;
        for (let x = 0; x < w; x += 1) {
          const baseNoise = (Math.sin(x * 0.04) * 0.2 + Math.sin(x * 0.11) * 0.15 + Math.sin(x * 0.27) * 0.1 + 0.5);
          const val = baseNoise * h * 0.9;
          ctx.fillStyle = '#f3f4f6';
          ctx.fillRect(x, h - val, 1, 1.5);
        }
        ctx.globalAlpha = 1;

        ctx.fillStyle = '#6b7280';
        ctx.font = 'bold 9px Inter, sans-serif';
        ctx.fillText('WAVEFORM (LUMA)', 6, 14);
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
    <div className="w-1/4 bg-surface-container flex flex-col rounded overflow-hidden border border-outline-variant/10">
      <div className="panel-header border-b border-outline-variant/10">
        <span className="panel-title uppercase tracking-widest text-[0.6rem] font-bold opacity-60">Scoping</span>
      </div>
      <div className="flex-1 flex flex-col p-1 gap-px bg-outline-variant/5">
        <div className="flex-1 relative bg-black/40">
          <canvas ref={paradeRef} className="w-full h-full" />
        </div>
        <div className="flex-1 relative bg-black/40">
          <canvas ref={waveformRef} className="w-full h-full" />
        </div>
      </div>
    </div>
  );
};

export default memo(VideoScopes);
