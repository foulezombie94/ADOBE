import { useColorStore, useTimelineStore } from '../store';
import { secondsToTimecode } from '../utils';
import VideoScopes from '../components/color/VideoScopes';
import ColorWheel from '../components/color/ColorWheel';
import ColorSlider from '../components/color/ColorSlider';

// ═══════════════════════════════════════════
// Main Color Workspace
// ═══════════════════════════════════════════
export default function ColorWorkspace() {
  const { grading, updateGrading } = useColorStore();
  const { playheadTime, isPlaying, togglePlayback } = useTimelineStore();

  return (
    <div className="flex-1 flex flex-col bg-surface overflow-hidden">
      {/* Top area: Scopes + Monitor */}
      <div className="flex-1 flex min-h-0 bg-outline-variant/5 gap-px">
        {/* Video Scopes */}
        <VideoScopes />

        {/* Program Monitor */}
        <div className="flex-1 bg-black relative flex flex-col group overflow-hidden">
          <div className="panel-header border-b border-white/5 absolute top-0 left-0 right-0 z-20 bg-black/40 backdrop-blur-md">
            <div className="flex items-center gap-4">
              <span className="text-[0.6rem] font-bold uppercase tracking-widest text-white/70">Program Feed</span>
              <span className="text-[0.7rem] text-primary font-mono tabular-nums bg-primary-container/20 px-2 py-0.5 rounded border border-primary/20">{secondsToTimecode(playheadTime)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[0.55rem] text-white/40 font-mono">3840x2160 @ 24fps</span>
              <button className="material-symbols-outlined text-[16px] text-white/50 hover:text-white transition-colors">settings</button>
            </div>
          </div>
          
          <div className="flex-1 relative flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none z-10" />
            <img
              className="max-h-full max-w-full object-contain shadow-2xl transition-all duration-300"
              src="https://images.unsplash.com/photo-1511497584788-876760111969?w=1200&q=80"
              alt="Grade Preview"
              crossOrigin="anonymous"
              style={{
                filter: `brightness(${1 + grading.exposure * 0.15}) contrast(${1 + grading.contrast * 0.008}) saturate(${grading.saturation / 100}) grayscale(${1 - grading.vibrance / 100})`,
                transform: 'scale(1.02)'
              }}
            />
            
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-8 px-8 py-3 bg-surface-container/60 backdrop-blur-3xl rounded-full border border-outline-variant/20 shadow-2xl opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 z-20">
              <span className="material-symbols-outlined cursor-pointer hover:text-primary transition-colors text-xl active:scale-90 text-white/70">skip_previous</span>
              <button
                className="w-12 h-12 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-110 active:scale-95 transition-all"
                onClick={togglePlayback}
              >
                <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {isPlaying ? 'pause' : 'play_arrow'}
                </span>
              </button>
              <span className="material-symbols-outlined cursor-pointer hover:text-primary transition-colors text-xl active:scale-90 text-white/70">skip_next</span>
            </div>
          </div>

          {/* Timeline Mini-Strip */}
          <div className="h-1 bg-outline-variant/10 relative overflow-hidden">
             <div className="absolute top-0 h-full bg-primary/40" style={{ width: '45%' }} />
          </div>
        </div>

        {/* Workspace Panels (Mini) */}
        <div className="w-12 bg-surface-container border-l border-outline-variant/10 flex flex-col items-center py-4 gap-6 shrink-0">
          <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>palette</span>
          <span className="material-symbols-outlined text-on-surface-variant/40 text-xl hover:text-on-surface transition-colors">brush</span>
          <span className="material-symbols-outlined text-on-surface-variant/40 text-xl hover:text-on-surface transition-colors">flare</span>
          <span className="material-symbols-outlined text-on-surface-variant/40 text-xl hover:text-on-surface transition-colors">auto_fix_high</span>
          <div className="mt-auto flex flex-col gap-6">
             <span className="material-symbols-outlined text-on-surface-variant/40 text-xl">undo</span>
             <span className="material-symbols-outlined text-on-surface-variant/40 text-xl">redo</span>
          </div>
        </div>
      </div>

      {/* Bottom area: Mini Timeline Area */}
      <div className="h-44 bg-surface-container p-1 border-t border-outline-variant/10 flex gap-1">
        <div className="flex-1 bg-surface-container-low rounded overflow-hidden flex flex-col">
          <div className="h-8 flex items-center bg-surface-container px-3 justify-between border-b border-outline-variant/10">
            <span className="text-[0.6rem] font-bold uppercase tracking-widest text-on-surface-variant">Shot List</span>
            <span className="text-[0.6rem] font-mono text-primary">SCENE_01_A [DCI-P3]</span>
          </div>
          <div className="flex-1 p-2 flex gap-4 overflow-x-auto overflow-y-hidden">
             {[1,2,3,4,5].map(i => (
               <div key={i} className={`h-full aspect-video rounded relative overflow-hidden cursor-pointer transition-all border-2 ${i === 2 ? 'border-primary shadow-lg shadow-primary/10' : 'border-outline-variant/10 hover:border-outline-variant/40 grayscale opacity-40 hover:grayscale-0 hover:opacity-100'}`}>
                 <img src={`https://picsum.photos/seed/${i+10}/300/200`} className="w-full h-full object-cover" alt="" />
                 <span className="absolute bottom-1 right-1 px-1 bg-black/60 rounded text-[0.5rem] font-mono text-white/80">00:0{i}:12</span>
               </div>
             ))}
          </div>
        </div>
        
        {/* Right Correction Panel */}
        <aside className="w-80 bg-surface-container flex flex-col rounded-sm overflow-hidden border border-outline-variant/10 shadow-2xl">
          <div className="h-10 flex items-center px-4 bg-surface-container-high border-b border-outline-variant/10">
            <span className="text-[0.7rem] font-extrabold uppercase tracking-widest text-primary">Color Grading</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-8 scroll-smooth" style={{ scrollbarWidth: 'none' }}>
            <section className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-[0.65rem] font-bold text-on-surface uppercase tracking-widest">Basic Balance</h3>
                <span className="material-symbols-outlined text-sm text-on-surface-variant/40">tune</span>
              </div>
              
              <ColorSlider 
                label="Temperature" 
                value={grading.temperature} 
                min={2000} max={10000} 
                unit="K" 
                gradient="linear-gradient(to right, #60a5fa, #f3f4f6, #fb923c)"
                onChange={(v) => updateGrading({ temperature: v })} 
              />
              
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <ColorSlider label="Exposure" value={grading.exposure} min={-5} max={5} onChange={(v) => updateGrading({ exposure: v })} />
                <ColorSlider label="Contrast" value={grading.contrast} min={-100} max={100} onChange={(v) => updateGrading({ contrast: v })} />
                <ColorSlider label="Saturation" value={grading.saturation} min={0} max={200} onChange={(v) => updateGrading({ saturation: v })} />
                <ColorSlider label="Vibrance" value={grading.vibrance} min={-100} max={100} onChange={(v) => updateGrading({ vibrance: v })} />
              </div>
            </section>

            <section className="space-y-6 pt-6 border-t border-outline-variant/10">
              <div className="flex items-center justify-between">
                 <h3 className="text-[0.65rem] font-bold text-on-surface uppercase tracking-widest">Grading Wheels</h3>
              </div>
              <div className="flex justify-between items-start pt-2">
                 <ColorWheel label="Shadows" size={100} value={grading.shadows} onChange={(pos) => updateGrading({ shadows: pos })} />
                 <ColorWheel label="Midtones" size={100} value={grading.midtones} onChange={(pos) => updateGrading({ midtones: pos })} />
                 <ColorWheel label="Highlights" size={100} value={grading.highlights} onChange={(pos) => updateGrading({ highlights: pos })} />
              </div>
            </section>

            {/* LUTs */}
            <section className="pt-6 border-t border-outline-variant/10 space-y-4">
               <h3 className="text-[0.65rem] font-bold text-on-surface uppercase tracking-widest">Look Selection</h3>
               <div className="grid grid-cols-2 gap-2">
                  {['Kodak Vision3', 'Fuji Eterna', 'Monochrome XT', 'Teal-Orange'].map(lut => (
                    <button key={lut} className="py-2 bg-surface-container-highest rounded text-[0.55rem] font-bold uppercase tracking-tighter hover:bg-primary/10 hover:text-primary transition-all border border-outline-variant/10">
                      {lut}
                    </button>
                  ))}
               </div>
            </section>
          </div>
        </aside>
      </div>
    </div>
  );
}
