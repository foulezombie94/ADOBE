import React from 'react';

interface ExportSettingsData {
  fileName: string;
  format: string;
  preset: string;
}

interface ExportSettingsProps {
  settings: ExportSettingsData;
  setSettings: (s: ExportSettingsData) => void;
}

const ExportSettings: React.FC<ExportSettingsProps> = ({ settings, setSettings }) => {
  return (
    <div className="w-80 bg-surface-container-low p-5 flex flex-col gap-8 shrink-0 border-r border-outline-variant/10">
      <div className="space-y-6">
        <h2 className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-primary">Destination</h2>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[0.6rem] font-bold text-on-surface-variant uppercase tracking-tight">Output Name</label>
            <input
              className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-sm text-[0.75rem] text-on-surface px-3 py-2.5 focus:border-primary focus:outline-none transition-colors"
              type="text"
              value={settings.fileName}
              onChange={(e) => setSettings({ ...settings, fileName: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[0.6rem] font-bold text-on-surface-variant uppercase tracking-tight">Export Format</label>
            <div className="relative">
              <select
                className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-sm text-[0.75rem] text-on-surface px-3 py-2.5 appearance-none cursor-pointer focus:border-primary focus:outline-none"
                value={settings.format}
                onChange={(e) => setSettings({ ...settings, format: e.target.value })}
              >
                <option>H.264 (MP4)</option>
                <option>HEVC (H.265)</option>
                <option>Apple ProRes 422</option>
                <option>QuickTime (MOV)</option>
                <option>TIFF Sequence</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[18px] pointer-events-none opacity-40">expand_more</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[0.6rem] font-bold text-on-surface-variant uppercase tracking-tight">Preset</label>
            <div className="relative">
              <select
                className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-sm text-[0.75rem] text-on-surface px-3 py-2.5 appearance-none cursor-pointer focus:border-primary focus:outline-none"
                value={settings.preset}
                onChange={(e) => setSettings({ ...settings, preset: e.target.value })}
              >
                <option>Match Source - High Bitrate</option>
                <option>YouTube 2160p 4K</option>
                <option>YouTube 1080p HD</option>
                <option>UHD High Quality</option>
                <option>Vimeo 4K</option>
                <option>Custom Settings</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[18px] pointer-events-none opacity-40">expand_more</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto space-y-4 pt-6 border-t border-outline-variant/10">
        <div className="flex justify-between items-center bg-surface-container-lowest p-3 rounded border border-outline-variant/5">
          <div className="flex flex-col">
            <span className="text-[0.55rem] uppercase font-bold text-on-surface-variant opacity-60">Estimated Size</span>
            <span className="text-[0.8rem] font-mono font-bold text-primary">1.42 GB</span>
          </div>
          <span className="material-symbols-outlined text-primary/40">database</span>
        </div>
        <div className="flex flex-col gap-1 px-1">
          <div className="flex justify-between text-[0.6rem]">
            <span className="text-on-surface-variant">Storage Pool</span>
            <span className="text-on-surface font-mono">1.2 TB Free</span>
          </div>
          <div className="h-1 bg-surface-container-highest rounded-full overflow-hidden">
             <div className="h-full bg-primary/20 w-[65%]" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportSettings;
