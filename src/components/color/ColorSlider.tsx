import React from 'react';

interface ColorSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  unit?: string;
  step?: number;
  gradient?: string;
  onChange: (v: number) => void;
}

const ColorSlider: React.FC<ColorSliderProps> = ({ 
  label, value, min, max, unit, step, gradient, onChange 
}) => {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center px-0.5">
        <label className="text-[0.6rem] font-bold text-on-surface-variant uppercase tracking-tighter">{label}</label>
        <span className="text-[0.6rem] font-mono text-primary bg-primary/5 px-1 rounded tabular-nums">
          {value > 0 ? '+' : ''}{value.toFixed(1)}{unit || ''}
        </span>
      </div>
      <div className="relative h-5 flex items-center group">
        <div className={`w-full h-1 relative rounded-full overflow-hidden ${gradient ? '' : 'bg-surface-container-highest'}`}
             style={gradient ? { background: gradient } : {}}>
          {!gradient && (
            <div 
              className="absolute left-0 h-full bg-primary/40 rounded-full"
              style={{ width: `${pct}%` }}
            />
          )}
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step || (max - min) / 100}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 w-full h-[18px] opacity-0 cursor-pointer z-20"
        />
        <div 
          className="absolute w-3 h-3 bg-white border border-outline-variant/50 rounded-full shadow-md z-10 pointer-events-none transition-transform group-active:scale-125"
          style={{ left: `calc(${pct}% - 6px)` }}
        />
      </div>
    </div>
  );
};

export default ColorSlider;
