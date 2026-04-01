import React, { useRef, useEffect } from 'react';

interface WaveformDisplayProps {
  color?: string;
  opacity?: number;
}

const WaveformDisplay: React.FC<WaveformDisplayProps> = ({ color = '#b9c3ff', opacity = 0.5 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.scale(dpr, dpr);

      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;

      ctx.clearRect(0, 0, w, h);

      // Draw waveform
      const mid = h / 2;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.globalAlpha = opacity;

      for (let x = 0; x < w; x++) {
        // Pseudo-random but consistent waveform generation
        const noise = (Math.sin(x * 0.05) * 0.4 + Math.sin(x * 0.13) * 0.3 + Math.sin(x * 0.31) * 0.2 + Math.random() * 0.1);
        const amp = noise * mid * 0.8;
        ctx.beginPath();
        ctx.moveTo(x, mid - amp);
        ctx.lineTo(x, mid + amp);
        ctx.stroke();
      }
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [color, opacity]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};

export default WaveformDisplay;
