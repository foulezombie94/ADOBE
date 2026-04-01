import { useState } from 'react';
import { useTimelineStore, useProjectStore, useColorStore, useMixerStore, type StoreState } from '../store';
import ExportSettings from '../components/export/ExportSettings';
import ExportPreview from '../components/export/ExportPreview';
import { exportProject } from '../services/exportService';

export default function ExportPage() {
  const { playheadTime, duration, tracks, markers, fps } = useTimelineStore((s: StoreState) => s);
  const { assets, projectName } = useProjectStore((s: StoreState) => s);
  const { grading } = useColorStore((s: StoreState) => s);
  const { channels, masterVolume } = useMixerStore((s: StoreState) => s);

  const [activeTab, setActiveTab] = useState<'video' | 'audio' | 'captions' | 'metadata'>('video');
  const [settings, setSettings] = useState({
    fileName: projectName || 'Untitled_Project',
    format: 'H.264 (MP4)',
    preset: 'YouTube 1080p HD',
    isExporting: false,
    exportProgress: 0,
    bitrate: 12.5,
    maxQuality: true
  });

  const handleStartExport = async () => {
    setSettings(s => ({ ...s, isExporting: true, exportProgress: 0 }));
    
    const projectData = {
      metadata: { 
        name: settings.fileName, 
        exportedAt: new Date().toISOString() 
      },
      timeline: { tracks, markers, duration, fps },
      assets,
      colorGrading: grading,
      mixer: { channels, masterVolume },
      config: { format: settings.format, bitrate: settings.bitrate }
    };

    try {
      await exportProject(projectData, (p) => {
        setSettings(s => ({ ...s, exportProgress: p }));
      });
    } finally {
      setSettings(s => ({ ...s, isExporting: false }));
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-surface overflow-hidden">
      <div className="flex-1 flex min-h-0 bg-outline-variant/5">
        {/* Left Control Panel */}
        <ExportSettings settings={settings} setSettings={(s) => setSettings({ ...settings, ...s })} />

        {/* Center Mastering View */}
        <ExportPreview 
          playheadTime={playheadTime} 
          duration={duration} 
          isExporting={settings.isExporting} 
          exportProgress={settings.exportProgress}
        />

        {/* Right Detail Panel */}
        <aside className="w-80 bg-surface-container-low p-5 overflow-y-auto border-l border-outline-variant/10 shrink-0">
          <div className="space-y-8">
            <section className="space-y-4">
              <h3 className="text-[0.65rem] font-bold text-primary uppercase tracking-[0.25em]">Encoding Matrix</h3>
              <div className="grid grid-cols-4 gap-1 p-1 bg-surface-container-highest rounded-sm border border-outline-variant/20">
                {(['video', 'audio', 'captions', 'metadata'] as const).map(tab => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-2 text-[0.6rem] font-bold uppercase rounded-sm transition-all ${activeTab === tab ? 'bg-primary text-on-primary shadow-lg' : 'text-on-surface-variant hover:text-on-surface'}`}
                  >
                    {tab[0]}
                  </button>
                ))}
              </div>
            </section>

            {activeTab === 'video' && (
              <section className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
                <div className="space-y-4">
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-[0.7rem] text-on-surface-variant font-medium">Resolution</span>
                    <span className="text-[0.7rem] font-mono text-on-surface bg-surface-container-highest px-2 py-0.5 rounded">3840 x 2160</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[0.7rem] text-on-surface-variant font-medium">Frame Rate</span>
                    <span className="text-[0.7rem] font-mono text-on-surface bg-surface-container-highest px-2 py-0.5 rounded">23.976 fps</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[0.7rem] text-on-surface-variant font-medium">Bitrate [VBR]</span>
                    <span className="text-[0.7rem] font-mono text-primary bg-primary/5 px-2 py-0.5 rounded">{settings.bitrate} Mbps</span>
                  </div>
                  <input 
                    type="range" min={1} max={50} value={settings.bitrate} 
                    onChange={(e) => setSettings({...settings, bitrate: parseFloat(e.target.value)})}
                    className="w-full accent-primary h-1 bg-surface-container-highest rounded-full" 
                  />
                </div>

                <div className="space-y-3 pt-4 border-t border-outline-variant/10">
                   <label className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-4 h-4 border rounded-sm flex items-center justify-center transition-all ${settings.maxQuality ? 'bg-primary border-primary' : 'border-outline-variant group-hover:border-primary'}`}>
                        {settings.maxQuality && <span className="material-symbols-outlined text-white text-[14px]">check</span>}
                      </div>
                      <span className="text-[0.65rem] font-bold text-on-surface-variant uppercase tracking-tighter group-hover:text-on-surface">Maximum Depth Render</span>
                   </label>
                   <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="w-4 h-4 border border-outline-variant group-hover:border-primary rounded-sm transition-all" />
                      <span className="text-[0.65rem] font-bold text-on-surface-variant uppercase tracking-tighter group-hover:text-on-surface">Hardware Acceleration</span>
                   </label>
                </div>
              </section>
            )}

            {activeTab === 'audio' && (
              <section className="space-y-4 animate-in fade-in duration-300">
                <div className="bg-surface-container-highest p-4 rounded-sm border border-outline-variant/10 space-y-4">
                  <div className="flex justify-between">
                    <span className="text-[0.7rem] text-on-surface-variant">Codec</span>
                    <span className="text-[0.7rem] font-bold text-on-surface">AAC (Advanced Audio)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[0.7rem] text-on-surface-variant">Sample Rate</span>
                    <span className="text-[0.7rem] font-bold text-on-surface">48000 Hz</span>
                  </div>
                </div>
              </section>
            )}
          </div>
        </aside>
      </div>

      {/* Persistence Bar */}
      <footer className="h-14 bg-surface-container border-t border-outline-variant/10 px-8 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 group cursor-help">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
             <span className="text-[0.6rem] font-bold text-green-500/80 uppercase tracking-widest">Mastering Engine Ready</span>
           </div>
           <div className="h-4 w-px bg-outline-variant/30" />
           <span className="text-[0.6rem] font-mono text-on-surface-variant">VRAM: 8.2GB Used | CPU: 12%</span>
        </div>

        <div className="flex items-center gap-4">
           {!settings.isExporting && (
             <button className="px-5 py-2 text-[0.65rem] font-bold uppercase tracking-widest text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer">
               Clear Queue
             </button>
           )}
           <button
             onClick={handleStartExport}
             disabled={settings.isExporting}
             className="relative px-10 py-2.5 bg-primary text-on-primary rounded-sm font-black text-[0.7rem] uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 group overflow-hidden"
           >
             <span className="relative z-10">{settings.isExporting ? `Processing ${settings.exportProgress}%` : 'Finalize & Export'}</span>
             {settings.isExporting && (
               <div 
                 className="absolute inset-0 bg-white/20 transition-all duration-300"
                 style={{ width: `${settings.exportProgress}%` }}
               />
             )}
           </button>
        </div>
      </footer>
    </div>
  );
}
