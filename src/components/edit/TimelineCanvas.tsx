import React, { useRef, useEffect, useCallback, memo } from 'react';
import { useTimelineStore, type StoreState } from '../../store';
import { secondsToTimecode } from '../../utils';

const TimelineCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Use individual selectors to minimize re-renders
  const tracks = useTimelineStore((state: StoreState) => state.tracks);
  const playheadTime = useTimelineStore((state: StoreState) => state.playheadTime);
  const zoom = useTimelineStore((state: StoreState) => state.zoom);
  const duration = useTimelineStore((state: StoreState) => state.duration);
  const selectedClipIds = useTimelineStore((state: StoreState) => state.selectedClipIds);
  const fps = useTimelineStore((state: StoreState) => state.fps);
  const setPlayheadTime = useTimelineStore((state: StoreState) => state.setPlayheadTime);
  const selectClip = useTimelineStore((state: StoreState) => state.selectClip);
  const deselectAll = useTimelineStore((state: StoreState) => state.deselectAll);

  const pixelsPerSecond = 40 * zoom;
  const rulerHeight = 24;
  const trackHeaderWidth = 48;

  const drawTimeline = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d', { alpha: false }); // Optimization: no alpha
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    
    if (canvas.width !== Math.floor(rect.width * dpr) || canvas.height !== Math.floor(rect.height * dpr)) {
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.scale(dpr, dpr);
    }

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
    const majorInterval = zoom < 0.5 ? 10 : zoom < 2 ? 5 : 1;
    const startSec = 0;
    const endSec = duration;

    ctx.font = '9px monospace';
    for (let sec = startSec; sec <= endSec; sec += majorInterval) {
      const x = trackHeaderWidth + sec * pixelsPerSecond;
      if (x < 0 || x > w) continue;

      ctx.strokeStyle = 'rgba(171,170,177,0.3)';
      ctx.beginPath();
      ctx.moveTo(x, 14);
      ctx.lineTo(x, rulerHeight);
      ctx.stroke();

      ctx.fillStyle = '#abaab1';
      ctx.fillText(secondsToTimecode(sec, fps), x + 2, 10);
    }

    // ─── Tracks & Clips ───
    let y = rulerHeight;
    for (const track of tracks) {
      const trackH = track.height;
      
      // Track Row
      ctx.fillStyle = track.type === 'video' ? '#131316' : '#111114';
      ctx.fillRect(0, y, w, trackH);
      
      // Track Header
      ctx.fillStyle = '#1f1f24';
      ctx.fillRect(0, y, trackHeaderWidth, trackH);
      ctx.strokeStyle = 'rgba(71,71,77,0.1)';
      ctx.beginPath(); ctx.moveTo(trackHeaderWidth, y); ctx.lineTo(trackHeaderWidth, y+trackH); ctx.stroke();
      
      ctx.fillStyle = track.type === 'video' ? '#e6e4ec' : '#b9c3ff';
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.fillText(track.name, 10, y + trackH / 2 + 3);
      
      ctx.strokeStyle = 'rgba(71,71,77,0.08)';
      ctx.beginPath(); ctx.moveTo(0, y+trackH); ctx.lineTo(w, y+trackH); ctx.stroke();

      for (const clip of track.clips) {
        const cx = trackHeaderWidth + clip.startTime * pixelsPerSecond;
        const cw = (clip.endTime - clip.startTime) * pixelsPerSecond;
        if (cx > w || cx + cw < 0) continue; // Culling

        const cy = y + 2;
        const ch = trackH - 4;
        const isSelected = selectedClipIds.includes(clip.id);
        
        ctx.fillStyle = isSelected ? (track.type === 'video' ? '#6a37d4' : '#1e50dc') : (track.type === 'video' ? '#4900ad' : 'rgba(0, 52, 192, 0.8)');
        ctx.beginPath(); ctx.roundRect(cx, cy, cw, ch, 2); ctx.fill();

        if (isSelected) {
          ctx.strokeStyle = '#b9c3ff';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // Clip Label (with clipping)
        if (cw > 20) {
          ctx.save(); ctx.beginPath(); ctx.rect(cx+4, cy, cw-8, ch); ctx.clip();
          ctx.fillStyle = '#e6e4ec';
          ctx.font = 'bold 9px Inter, sans-serif';
          ctx.fillText(clip.label, cx + 6, cy + ch/2 + 3);
          ctx.restore();
        }
      }
      y += trackH;
    }

    // ─── Playhead ───
    const px = trackHeaderWidth + playheadTime * pixelsPerSecond;
    if (px >= trackHeaderWidth) {
      ctx.strokeStyle = '#b9c3ff'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, h); ctx.stroke();
      ctx.fillStyle = '#b9c3ff';
      ctx.beginPath(); ctx.moveTo(px-5, 0); ctx.lineTo(px+5, 0); ctx.lineTo(px, 8); ctx.fill();
    }
  }, [tracks, playheadTime, zoom, duration, selectedClipIds, pixelsPerSecond, fps]);

  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();
    const animate = (now: number) => {
      const state = useTimelineStore.getState();
      if (state.isPlaying) {
        const dt = (now - lastTime) / 1000;
        const newTime = state.playheadTime + dt;
        if (newTime < state.duration) state.setPlayheadTime(newTime);
        else { state.togglePlayback(); state.setPlayheadTime(0); }
      }
      lastTime = now;
      drawTimeline();
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [drawTimeline]);

  useEffect(() => {
    const observer = new ResizeObserver(() => drawTimeline());
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [drawTimeline]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    if (my < rulerHeight) {
      const time = (mx - trackHeaderWidth) / pixelsPerSecond;
      if (time >= 0) setPlayheadTime(time);
      return;
    }

    let trackY = rulerHeight;
    for (const track of tracks) {
      const trackH = track.height;
      for (const clip of track.clips) {
        const cx = trackHeaderWidth + clip.startTime * pixelsPerSecond;
        const cw = (clip.endTime - clip.startTime) * pixelsPerSecond;
        if (mx >= cx && mx <= cx + cw && my >= trackY + 2 && my <= trackY + trackH - 2) {
          selectClip(clip.id, e.shiftKey);
          return;
        }
      }
      trackY += trackH;
    }
    deselectAll();
    const time = (mx - trackHeaderWidth) / pixelsPerSecond;
    if (time >= 0) setPlayheadTime(time);
  };

  return (
    <div ref={containerRef} className="flex-1 relative overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 cursor-pointer" onClick={handleCanvasClick} />
    </div>
  );
};

export default memo(TimelineCanvas);
