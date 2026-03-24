import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Workspace, ToolType, Track, Clip, MediaAsset, Marker, ColorGradingState, MixerChannel } from '../types';

// ─── UI Store ──────────────────────────────
interface UIState {
  workspace: Workspace;
  activeTool: ToolType;
  setWorkspace: (w: Workspace) => void;
  setActiveTool: (t: ToolType) => void;
}

export const useUIStore = create<UIState>()(
  immer((set) => ({
    workspace: 'projects',
    activeTool: 'select',
    setWorkspace: (w) => set((s) => { s.workspace = w; }),
    setActiveTool: (t) => set((s) => { s.activeTool = t; }),
  }))
);

// ─── Timeline Store ────────────────────────
interface TimelineState {
  tracks: Track[];
  playheadTime: number;
  duration: number;
  zoom: number;
  scrollX: number;
  isPlaying: boolean;
  inPoint: number | null;
  outPoint: number | null;
  selectedClipIds: string[];
  markers: Marker[];
  fps: number;

  setPlayheadTime: (t: number) => void;
  togglePlayback: () => void;
  setZoom: (z: number) => void;
  setScrollX: (x: number) => void;
  selectClip: (id: string, multi?: boolean) => void;
  deselectAll: () => void;
  addTrack: (type: 'video' | 'audio') => void;
  removeTrack: (id: string) => void;
  toggleTrackLock: (id: string) => void;
  toggleTrackMute: (id: string) => void;
  toggleTrackSolo: (id: string) => void;
  toggleTrackVisible: (id: string) => void;
  addClip: (trackId: string, clip: Clip) => void;
  removeClip: (trackId: string, clipId: string) => void;
  moveClip: (fromTrackId: string, toTrackId: string, clipId: string, newStart: number) => void;
  trimClipStart: (trackId: string, clipId: string, newIn: number) => void;
  trimClipEnd: (trackId: string, clipId: string, newOut: number) => void;
  setClipSpeed: (trackId: string, clipId: string, speed: number) => void;
  setClipOpacity: (trackId: string, clipId: string, opacity: number) => void;
  setClipVolume: (trackId: string, clipId: string, volume: number) => void;
  cutAtPlayhead: () => void;
  addMarker: (label: string, color: string) => void;
  setInPoint: () => void;
  setOutPoint: () => void;
  stepForward: () => void;
  stepBackward: () => void;
}

const defaultTracks: Track[] = [
  { id: 'v1', type: 'video', name: 'V1', locked: false, muted: false, solo: false, visible: true, height: 48, color: '#4900ad', clips: [] },
  { id: 'a1', type: 'audio', name: 'A1', locked: false, muted: false, solo: false, visible: true, height: 40, color: '#0034c0', clips: [] },
];

export const useTimelineStore = create<TimelineState>()(
  immer((set) => ({
    tracks: defaultTracks,
    playheadTime: 0,
    duration: 300, // 5 min default empty timeline
    zoom: 1,
    scrollX: 0,
    isPlaying: false,
    inPoint: null,
    outPoint: null,
    selectedClipIds: [],
    markers: [],
    fps: 23.976,

    setPlayheadTime: (t) => set((s) => { s.playheadTime = Math.max(0, t); }),
    togglePlayback: () => set((s) => { s.isPlaying = !s.isPlaying; }),
    setZoom: (z) => set((s) => { s.zoom = Math.max(0.1, Math.min(10, z)); }),
    setScrollX: (x) => set((s) => { s.scrollX = x; }),
    selectClip: (id, multi) => set((s) => {
      if (multi) {
        const idx = s.selectedClipIds.indexOf(id);
        if (idx >= 0) s.selectedClipIds.splice(idx, 1);
        else s.selectedClipIds.push(id);
      } else {
        s.selectedClipIds = [id];
      }
    }),
    deselectAll: () => set((s) => { s.selectedClipIds = []; }),
    addTrack: (type) => set((s) => {
      const count = s.tracks.filter(t => t.type === type).length + 1;
      const name = type === 'video' ? `V${count}` : `A${count}`;
      s.tracks.push({
        id: `${type[0]}${count}-${Date.now()}`,
        type, name, locked: false, muted: false, solo: false,
        visible: true, height: type === 'video' ? 48 : 40,
        color: type === 'video' ? '#4900ad' : '#0034c0', clips: [],
      });
    }),
    removeTrack: (id) => set((s) => { s.tracks = s.tracks.filter(t => t.id !== id); }),
    toggleTrackLock: (id) => set((s) => {
      const t = s.tracks.find(t => t.id === id);
      if (t) t.locked = !t.locked;
    }),
    toggleTrackMute: (id) => set((s) => {
      const t = s.tracks.find(t => t.id === id);
      if (t) t.muted = !t.muted;
    }),
    toggleTrackSolo: (id) => set((s) => {
      const t = s.tracks.find(t => t.id === id);
      if (t) t.solo = !t.solo;
    }),
    toggleTrackVisible: (id) => set((s) => {
      const t = s.tracks.find(t => t.id === id);
      if (t) t.visible = !t.visible;
    }),
    addClip: (trackId, clip) => set((s) => {
      const t = s.tracks.find(t => t.id === trackId);
      if (t && !t.locked) t.clips.push(clip);
    }),
    removeClip: (trackId, clipId) => set((s) => {
      const t = s.tracks.find(t => t.id === trackId);
      if (t && !t.locked) t.clips = t.clips.filter(c => c.id !== clipId);
    }),
    moveClip: (fromTrackId, toTrackId, clipId, newStart) => set((s) => {
      const from = s.tracks.find(t => t.id === fromTrackId);
      const to = s.tracks.find(t => t.id === toTrackId);
      if (!from || !to || from.locked || to.locked) return;
      const clipIdx = from.clips.findIndex(c => c.id === clipId);
      if (clipIdx < 0) return;
      const clip = from.clips[clipIdx];
      const dur = clip.endTime - clip.startTime;
      from.clips.splice(clipIdx, 1);
      clip.startTime = newStart;
      clip.endTime = newStart + dur;
      clip.trackId = toTrackId;
      to.clips.push(clip);
    }),
    trimClipStart: (trackId, clipId, newIn) => set((s) => {
      const t = s.tracks.find(t => t.id === trackId);
      if (!t || t.locked) return;
      const c = t.clips.find(c => c.id === clipId);
      if (c) {
        const diff = newIn - c.inPoint;
        c.inPoint = newIn;
        c.startTime += diff;
      }
    }),
    trimClipEnd: (trackId, clipId, newOut) => set((s) => {
      const t = s.tracks.find(t => t.id === trackId);
      if (!t || t.locked) return;
      const c = t.clips.find(c => c.id === clipId);
      if (c) {
        const diff = newOut - c.outPoint;
        c.outPoint = newOut;
        c.endTime += diff;
      }
    }),
    setClipSpeed: (trackId, clipId, speed) => set((s) => {
      const t = s.tracks.find(t => t.id === trackId);
      if (!t) return;
      const c = t.clips.find(c => c.id === clipId);
      if (c) {
        const dur = (c.outPoint - c.inPoint) / speed;
        c.speed = speed;
        c.endTime = c.startTime + dur;
      }
    }),
    setClipOpacity: (trackId, clipId, opacity) => set((s) => {
      const t = s.tracks.find(t => t.id === trackId);
      if (!t) return;
      const c = t.clips.find(c => c.id === clipId);
      if (c) c.opacity = opacity;
    }),
    setClipVolume: (trackId, clipId, volume) => set((s) => {
      const t = s.tracks.find(t => t.id === trackId);
      if (!t) return;
      const c = t.clips.find(c => c.id === clipId);
      if (c) c.volume = volume;
    }),
    cutAtPlayhead: () => set((s) => {
      const time = s.playheadTime;
      for (const track of s.tracks) {
        if (track.locked) continue;
        for (let i = 0; i < track.clips.length; i++) {
          const clip = track.clips[i];
          if (time > clip.startTime && time < clip.endTime) {
            const newClip: Clip = {
              ...JSON.parse(JSON.stringify(clip)),
              id: `${clip.id}-cut-${Date.now()}`,
              startTime: time,
              inPoint: clip.inPoint + (time - clip.startTime) * clip.speed,
            };
            clip.endTime = time;
            clip.outPoint = clip.inPoint + (time - clip.startTime) * clip.speed;
            track.clips.splice(i + 1, 0, newClip);
            break;
          }
        }
      }
    }),
    addMarker: (label, color) => set((s) => {
      s.markers.push({ id: `m-${Date.now()}`, time: s.playheadTime, label, color });
    }),
    setInPoint: () => set((s) => { s.inPoint = s.playheadTime; }),
    setOutPoint: () => set((s) => { s.outPoint = s.playheadTime; }),
    stepForward: () => set((s) => { s.playheadTime += 1 / s.fps; }),
    stepBackward: () => set((s) => { s.playheadTime = Math.max(0, s.playheadTime - 1 / s.fps); }),
  }))
);

// ─── Project Store ─────────────────────────
interface ProjectState {
  assets: MediaAsset[];
  projectName: string;
  addAsset: (asset: MediaAsset) => void;
  removeAsset: (id: string) => void;
}

export const useProjectStore = create<ProjectState>()(
  immer((set) => ({
    projectName: 'Cinematic_Edit_v4',
    assets: [],
    addAsset: (asset) => set((s) => { s.assets.push(asset); }),
    removeAsset: (id) => set((s) => { s.assets = s.assets.filter(a => a.id !== id); }),
  }))
);

// ─── Color Grading Store ───────────────────
interface ColorState {
  grading: ColorGradingState;
  updateGrading: (partial: Partial<ColorGradingState>) => void;
  resetGrading: () => void;
}

const defaultGrading: ColorGradingState = {
  shadows: { x: 0, y: 0, luminance: 0 },
  midtones: { x: 0.1, y: -0.1, luminance: 0 },
  highlights: { x: -0.05, y: 0.05, luminance: 0 },
  offset: { x: 0, y: 0, luminance: 0 },
  temperature: 5600,
  tint: 0,
  exposure: 0.45,
  contrast: 12,
  highlightsVal: 0,
  shadowsVal: 0,
  whites: 0,
  blacks: 0,
  saturation: 100,
  vibrance: 0,
  curves: [
    [{ x: 0, y: 0 }, { x: 0.3, y: 0.25 }, { x: 0.5, y: 0.5 }, { x: 0.7, y: 0.75 }, { x: 1, y: 1 }],
  ],
  lutIntensity: 100,
};

export const useColorStore = create<ColorState>()(
  immer((set) => ({
    grading: defaultGrading,
    updateGrading: (partial) => set((s) => { Object.assign(s.grading, partial); }),
    resetGrading: () => set((s) => { s.grading = defaultGrading; }),
  }))
);

// ─── Mixer Store ───────────────────────────
interface MixerState {
  channels: MixerChannel[];
  masterVolume: number;
  masterPeak: { l: number; r: number };
  setChannelVolume: (trackId: string, volume: number) => void;
  setChannelPan: (trackId: string, pan: number) => void;
  toggleChannelMute: (trackId: string) => void;
  toggleChannelSolo: (trackId: string) => void;
  setMasterVolume: (volume: number) => void;
}

export const useMixerStore = create<MixerState>()(
  immer((set) => ({
    channels: [
      { trackId: 'ch1', name: 'Track 01', volume: -4.2, pan: -0.45, muted: false, solo: true, recording: false, effects: [], peakLevel: 0.65 },
      { trackId: 'ch2', name: 'Track 02', volume: -12.0, pan: 0, muted: false, solo: false, recording: false, effects: [], peakLevel: 0.4 },
      { trackId: 'ch3', name: 'Track 03', volume: -1.5, pan: 0.2, muted: false, solo: false, recording: false, effects: [], peakLevel: 0.85 },
    ],
    masterVolume: -2.8,
    masterPeak: { l: 0.72, r: 0.68 },
    setChannelVolume: (trackId, volume) => set((s) => {
      const ch = s.channels.find(c => c.trackId === trackId);
      if (ch) ch.volume = volume;
    }),
    setChannelPan: (trackId, pan) => set((s) => {
      const ch = s.channels.find(c => c.trackId === trackId);
      if (ch) ch.pan = pan;
    }),
    toggleChannelMute: (trackId) => set((s) => {
      const ch = s.channels.find(c => c.trackId === trackId);
      if (ch) ch.muted = !ch.muted;
    }),
    toggleChannelSolo: (trackId) => set((s) => {
      const ch = s.channels.find(c => c.trackId === trackId);
      if (ch) ch.solo = !ch.solo;
    }),
    setMasterVolume: (volume) => set((s) => { s.masterVolume = volume; }),
  }))
);
