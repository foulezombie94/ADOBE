import { useState } from 'react';
import { useTimelineStore, useProjectStore, useColorStore, useMixerStore } from '../store';
import { secondsToTimecode } from '../utils';

// ═══════════════════════════════════════════
// Export Page
// ═══════════════════════════════════════════
export default function ExportPage() {
  const { playheadTime, duration, tracks, markers, fps } = useTimelineStore();
  const { assets, projectName } = useProjectStore();
  const { grading } = useColorStore();
  const { channels, masterVolume } = useMixerStore();

  const [activeTab, setActiveTab] = useState<'video' | 'audio' | 'captions' | 'effects'>('video');
  const [settings, setSettings] = useState({
    fileName: projectName || 'Untitled_Project',
    format: 'H.264',
    preset: 'Match Source - High Bitrate',
    location: '/Downloads',
    resolution: '3840 x 2160',
    frameRate: '23.976 fps',
    fieldOrder: 'Progressive',
    aspect: 'Square Pixels (1.0)',
    performance: 'Hardware Encoding',
    profile: 'Main 10',
    level: '5.2',
    bitrateMode: 'VBR, 1 pass',
    targetBitrate: 42.5,
    maxRenderQuality: true,
    renderAlpha: false,
    isExporting: false,
    exportProgress: 0,
  });

  const handleExport = () => {
    setSettings(s => ({ ...s, isExporting: true, exportProgress: 0 }));

    // Simulate encoding progress for UX
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      if (progress >= 100) {
        clearInterval(interval);
        
        // --- REAL EXPORT LOGIC ---
        // Consolidate project data
        const projectData = {
          metadata: {
            name: settings.fileName,
            exportedAt: new Date().toISOString(),
            version: '1.0.0-alpha',
          },
          timeline: {
            tracks,
            markers,
            duration,
            fps,
          },
          assets,
          colorGrading: grading,
          mixer: {
            channels,
            masterVolume,
          },
          exportSettings: {
            format: settings.format,
            preset: settings.preset,
            resolution: settings.resolution,
          }
        };

        // Create Blob and trigger download
        const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${settings.fileName}.obsidian`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        setSettings(s => ({ ...s, isExporting: false, exportProgress: 100 }));
      } else {
        setSettings(s => ({ ...s, exportProgress: progress }));
      }
    }, 50);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <section className="flex-1 flex overflow-hidden bg-surface-container-lowest">
        {/* Left: Export Settings */}
        <div className="w-72 bg-surface-container-low p-4 flex flex-col gap-6 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
          <div>
            <h2 className="text-[0.6875rem] font-medium uppercase tracking-widest text-on-surface-variant mb-4">Export Settings</h2>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[0.625rem] text-on-surface-variant block">File Name</label>
                <input
                  className="w-full bg-surface-container-highest border-none text-[0.75rem] text-on-surface px-2 py-2 focus:ring-1 focus:ring-primary focus:outline-none"
                  type="text"
                  value={settings.fileName}
                  onChange={(e) => setSettings(s => ({ ...s, fileName: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[0.625rem] text-on-surface-variant block">Format</label>
                <select
                  className="w-full bg-surface-container-highest border-none text-[0.75rem] text-on-surface px-2 py-2 focus:ring-1 focus:ring-primary focus:outline-none appearance-none cursor-pointer"
                  value={settings.format}
                  onChange={(e) => setSettings(s => ({ ...s, format: e.target.value }))}
                >
                  <option>H.264</option>
                  <option>HEVC (H.265)</option>
                  <option>Apple ProRes</option>
                  <option>VP9 (WebM)</option>
                  <option>AV1</option>
                  <option>GIF</option>
                  <option>PNG Sequence</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[0.625rem] text-on-surface-variant block">Preset</label>
                <select
                  className="w-full bg-surface-container-highest border-none text-[0.75rem] text-on-surface px-2 py-2 focus:ring-1 focus:ring-primary focus:outline-none appearance-none cursor-pointer"
                  value={settings.preset}
                  onChange={(e) => setSettings(s => ({ ...s, preset: e.target.value }))}
                >
                  <option>Match Source - High Bitrate</option>
                  <option>YouTube 2160p 4K</option>
                  <option>YouTube 1080p HD</option>
                  <option>YouTube Shorts (1080x1920)</option>
                  <option>Instagram 1080x1350</option>
                  <option>Instagram Story 1080x1920</option>
                  <option>TikTok 1080x1920</option>
                  <option>Vimeo 1080p HD</option>
                  <option>Twitter/X 1080p</option>
                  <option>ProRes 422</option>
                  <option>ProRes 4444</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[0.625rem] text-on-surface-variant block">Location</label>
                <div className="flex gap-1">
                  <input
                    className="flex-1 bg-surface-container-highest border-none text-[0.75rem] text-on-surface px-2 py-2 focus:ring-1 focus:ring-primary focus:outline-none"
                    readOnly
                    type="text"
                    value={settings.location}
                  />
                  <button className="bg-surface-container-highest px-3 hover:bg-surface-bright transition-colors cursor-pointer">
                    <span className="material-symbols-outlined text-[1.2rem]">folder_open</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-auto pt-6 border-t border-outline-variant/20">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[0.625rem] text-on-surface-variant">Estimated File Size:</span>
              <span className="text-[0.75rem] font-mono text-primary">1.24 GB</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[0.625rem] text-on-surface-variant">Available Space:</span>
              <span className="text-[0.75rem] font-mono text-on-surface">1.2 TB</span>
            </div>
          </div>
        </div>

        {/* Center: Preview */}
        <div className="flex-1 flex flex-col bg-surface-container-lowest border-x border-outline-variant/10">
          <div className="flex-1 relative flex items-center justify-center bg-black group">
            <img
              className="max-w-full max-h-full object-contain"
              src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80"
              alt="Export preview"
              crossOrigin="anonymous"
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
              <div className="flex items-center gap-6">
                <span className="material-symbols-outlined text-4xl cursor-pointer hover:scale-110 transition-transform">fast_rewind</span>
                <span className="material-symbols-outlined text-6xl cursor-pointer hover:scale-110 transition-transform">play_circle</span>
                <span className="material-symbols-outlined text-4xl cursor-pointer hover:scale-110 transition-transform">fast_forward</span>
              </div>
            </div>
          </div>
          <div className="h-16 bg-surface-container flex flex-col p-2">
            <div className="flex justify-between items-center px-2 mb-1">
              <span className="text-[0.6875rem] font-mono text-primary">{secondsToTimecode(playheadTime)}</span>
              <span className="text-[0.6875rem] font-mono text-on-surface-variant">/ {secondsToTimecode(duration)}</span>
            </div>
            <div className="relative h-4 bg-surface-container-lowest overflow-hidden rounded-sm">
              {settings.isExporting && (
                <div
                  className="absolute h-full bg-primary/30 left-0 transition-all"
                  style={{ width: `${settings.exportProgress}%` }}
                />
              )}
              <div className="absolute h-full w-[2px] bg-primary left-1/3 z-10 shadow-[0_0_8px_#b9c3ff]" />
              <div className="flex items-end h-full px-1 gap-[2px]">
                {Array(20).fill(0).map((_, i) => (
                  <div key={i} className={`${i % 2 === 0 ? 'h-1/2' : 'h-1/3'} w-[1px] bg-outline-variant/30`} />
                ))}
              </div>
            </div>
            {settings.isExporting && (
              <div className="flex justify-between items-center px-2 mt-1">
                <span className="text-[0.5rem] text-primary font-mono">Encoding... {settings.exportProgress}%</span>
                <span className="text-[0.5rem] text-on-surface-variant font-mono">ETA: {Math.max(0, Math.floor((100 - settings.exportProgress) * 0.1))}s</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Encoding Parameters */}
        <div className="w-72 bg-surface-container-low p-4 flex flex-col gap-4 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
          {/* Tabs */}
          <div className="flex border-b border-outline-variant/20 mb-2">
            {(['video', 'audio', 'captions', 'effects'] as const).map((tab) => (
              <button
                key={tab}
                className={`flex-1 pb-2 text-[0.6875rem] font-medium capitalize cursor-pointer ${
                  activeTab === tab ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-on-surface'
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 'video' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between group">
                <span className="text-[0.75rem] text-on-surface-variant">Frame Size</span>
                <div className="flex items-center gap-2">
                  <span className="text-[0.75rem] text-primary group-hover:underline cursor-pointer">{settings.resolution}</span>
                  <span className="material-symbols-outlined text-[0.9rem] text-on-surface-variant">link</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[0.75rem] text-on-surface-variant">Frame Rate</span>
                <span className="text-[0.75rem] text-on-surface">{settings.frameRate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[0.75rem] text-on-surface-variant">Field Order</span>
                <span className="text-[0.75rem] text-on-surface">{settings.fieldOrder}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[0.75rem] text-on-surface-variant">Aspect</span>
                <span className="text-[0.75rem] text-on-surface">{settings.aspect}</span>
              </div>

              <div className="pt-4 border-t border-outline-variant/10">
                <h3 className="text-[0.625rem] uppercase tracking-widest text-on-surface-variant mb-4">Encoding Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[0.75rem] text-on-surface-variant">Performance</span>
                    <span className="text-[0.75rem] text-on-surface">{settings.performance}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[0.75rem] text-on-surface-variant">Profile</span>
                    <span className="text-[0.75rem] text-on-surface">{settings.profile}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[0.75rem] text-on-surface-variant">Level</span>
                    <span className="text-[0.75rem] text-on-surface">{settings.level}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-outline-variant/10">
                <h3 className="text-[0.625rem] uppercase tracking-widest text-on-surface-variant mb-4">Bitrate Settings</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[0.75rem] text-on-surface-variant">Bitrate Encoding</span>
                    <span className="text-[0.75rem] text-on-surface">{settings.bitrateMode}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-[0.625rem] text-on-surface-variant">Target Bitrate [Mbps]</span>
                      <span className="text-[0.625rem] text-primary">{settings.targetBitrate}</span>
                    </div>
                    <div className="relative h-1 bg-surface-container-lowest rounded-full overflow-hidden">
                      <div className="absolute h-full bg-primary rounded-full" style={{ width: `${(settings.targetBitrate / 100) * 100}%` }} />
                      <input
                        type="range"
                        min={1}
                        max={100}
                        step={0.5}
                        value={settings.targetBitrate}
                        onChange={(e) => setSettings(s => ({ ...s, targetBitrate: parseFloat(e.target.value) }))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-4">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div
                    className={`w-3 h-3 border ${settings.maxRenderQuality ? 'border-primary bg-primary/20' : 'border-outline-variant bg-surface-container-highest'} group-hover:border-primary flex items-center justify-center`}
                    onClick={() => setSettings(s => ({ ...s, maxRenderQuality: !s.maxRenderQuality }))}
                  >
                    {settings.maxRenderQuality && <span className="material-symbols-outlined text-[0.6rem] text-primary">check</span>}
                  </div>
                  <span className="text-[0.6875rem] text-on-surface-variant group-hover:text-on-surface">Use Maximum Render Quality</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div
                    className={`w-3 h-3 border ${settings.renderAlpha ? 'border-primary bg-primary/20' : 'border-outline-variant bg-surface-container-highest'} group-hover:border-primary flex items-center justify-center`}
                    onClick={() => setSettings(s => ({ ...s, renderAlpha: !s.renderAlpha }))}
                  >
                    {settings.renderAlpha && <span className="material-symbols-outlined text-[0.6rem] text-primary">check</span>}
                  </div>
                  <span className="text-[0.6875rem] text-on-surface-variant group-hover:text-on-surface">Render Alpha Channel Only</span>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'audio' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[0.75rem] text-on-surface-variant">Audio Codec</span>
                <select className="bg-surface-container-highest text-[0.75rem] text-on-surface px-2 py-1 border-none focus:ring-1 focus:ring-primary cursor-pointer">
                  <option>AAC</option>
                  <option>MP3</option>
                  <option>Opus</option>
                  <option>FLAC</option>
                  <option>PCM (Uncompressed)</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[0.75rem] text-on-surface-variant">Sample Rate</span>
                <span className="text-[0.75rem] text-on-surface">48000 Hz</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[0.75rem] text-on-surface-variant">Channels</span>
                <span className="text-[0.75rem] text-on-surface">Stereo</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[0.75rem] text-on-surface-variant">Bitrate</span>
                <span className="text-[0.75rem] text-on-surface">320 kbps</span>
              </div>
            </div>
          )}

          {activeTab === 'captions' && (
            <div className="space-y-4 text-center py-8">
              <span className="material-symbols-outlined text-3xl text-on-surface-variant">subtitles</span>
              <p className="text-[0.75rem] text-on-surface-variant">No captions found in timeline</p>
              <button className="text-[0.65rem] text-primary cursor-pointer hover:underline">Import SRT / VTT file</button>
            </div>
          )}

          {activeTab === 'effects' && (
            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="w-3 h-3 border border-primary bg-primary/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[0.6rem] text-primary">check</span>
                </div>
                <span className="text-[0.6875rem] text-on-surface-variant group-hover:text-on-surface">Include Video Effects</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="w-3 h-3 border border-primary bg-primary/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[0.6rem] text-primary">check</span>
                </div>
                <span className="text-[0.6875rem] text-on-surface-variant group-hover:text-on-surface">Include Audio Effects</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="w-3 h-3 border border-primary bg-primary/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[0.6rem] text-primary">check</span>
                </div>
                <span className="text-[0.6875rem] text-on-surface-variant group-hover:text-on-surface">Include Color Grading</span>
              </label>
            </div>
          )}
        </div>
      </section>

      {/* Export Footer */}
      <div className="h-12 bg-surface flex items-center justify-between px-4 border-t border-outline-variant/10 shrink-0">
        <div className="flex items-center gap-6">
          <span className="font-mono text-[0.625rem] text-on-surface-variant">Performance: 60fps | Disk: 1.2TB Free</span>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-6 py-2 text-[0.75rem] font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-colors rounded-sm cursor-pointer">
            Cancel
          </button>
          <button
            className="px-8 py-2 text-[0.75rem] font-bold text-on-primary bg-gradient-to-br from-primary to-primary-container hover:shadow-[0_0_12px_rgba(185,195,255,0.3)] transition-all rounded-sm cursor-pointer disabled:opacity-50"
            onClick={handleExport}
            disabled={settings.isExporting}
          >
            {settings.isExporting ? `Exporting ${settings.exportProgress}%...` : 'Export'}
          </button>
        </div>
      </div>
    </div>
  );
}
