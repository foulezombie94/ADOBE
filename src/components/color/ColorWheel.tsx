import React, { useRef, useEffect, useCallback, useState } from 'react';

interface ColorWheelProps {
  label: string;
  size?: number;
  value: { x: number; y: number };
  onChange: (pos: { x: number; y: number }) => void;
}

const ColorWheel: React.FC<ColorWheelProps> = ({ label, size = 120, value, onChange }) => {
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
    const r = size / 2 - 4;
    const innerR = r - 10;

    // Colorful border ring
    for (let angle = 0; angle < 360; angle += 1) {
      const rad = (angle * Math.PI) / 180;
      ctx.beginPath();
      ctx.moveTo(cx + innerR * Math.cos(rad), cy + innerR * Math.sin(rad));
      ctx.lineTo(cx + r * Math.cos(rad), cy + r * Math.sin(rad));
      const nextRad = ((angle + 2) * Math.PI) / 180;
      ctx.lineTo(cx + r * Math.cos(nextRad), cy + r * Math.sin(nextRad));
      ctx.lineTo(cx + innerR * Math.cos(nextRad), cy + innerR * Math.sin(nextRad));
      ctx.closePath();
      ctx.fillStyle = `hsl(${angle}, 70%, 45%)`;
      ctx.fill();
    }

    // Inner circle
    ctx.beginPath();
    ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
    ctx.fillStyle = '#0a0a0c';
    ctx.fill();

    // Crosshairs
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - innerR + 5, cy);
    ctx.lineTo(cx + innerR - 5, cy);
    ctx.moveTo(cx, cy - innerR + 5);
    ctx.lineTo(cx, cy + innerR - 5);
    ctx.stroke();

    // Mapping value (-1..1) to canvas coordinates
    const dotX = cx + value.x * innerR * 0.85;
    const dotY = cy + value.y * innerR * 0.85;

    // Glow
    ctx.shadowColor = '#b9c3ff';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(dotX, dotY, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#b9c3ff';
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.beginPath();
    ctx.arc(dotX, dotY, 4, 0, Math.PI * 2);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }, [value, size]);

  useEffect(() => { drawWheel(); }, [drawWheel]);

  const handlePointer = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const cx = size / 2;
    const cy = size / 2;
    const innerR = size / 2 - 14;
    
    const clickX = ((e.clientX - rect.left) / rect.width) * size;
    const clickY = ((e.clientY - rect.top) / rect.height) * size;
    
    const dx = (clickX - cx) / (innerR * 0.85);
    const dy = (clickY - cy) / (innerR * 0.85);
    
    const mag = Math.sqrt(dx * dx + dy * dy);
    if (mag <= 1.05) {
      onChange({ 
        x: Math.max(-1, Math.min(1, dx)), 
        y: Math.max(-1, Math.min(1, dy)) 
      });
    }
  }, [size, onChange]);

  return (
    <div className="flex flex-col items-center gap-2 group">
      <span className="text-[0.6rem] font-bold text-on-surface-variant uppercase tracking-widest">{label}</span>
      <div className="relative p-1 bg-surface-container rounded-full border border-outline-variant/10 shadow-lg group-hover:border-primary/20 transition-colors">
        <canvas
          ref={canvasRef}
          style={{ width: size, height: size }}
          className="cursor-crosshair rounded-full"
          onMouseDown={(e) => { setIsDragging(true); handlePointer(e); }}
          onMouseMove={(e) => { if (isDragging) handlePointer(e); }}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
          onDoubleClick={() => onChange({ x: 0, y: 0 })}
        />
      </div>
    </div>
  );
};

export default ColorWheel;
