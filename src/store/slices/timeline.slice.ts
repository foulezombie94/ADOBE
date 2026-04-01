import type { StateCreator } from 'zustand';
import type { StoreState } from '../index';
import type { Track, Clip, Marker } from '../../types';

export interface TimelineSlice {
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

export const createTimelineSlice: StateCreator<StoreState, [['zustand/immer', never]], [], TimelineSlice> = (set) => ({
  tracks: defaultTracks,
  playheadTime: 0,
  duration: 300,
  zoom: 1,
  scrollX: 0,
  isPlaying: false,
  inPoint: null,
  outPoint: null,
  selectedClipIds: [],
  markers: [],
  fps: 23.976,

  setPlayheadTime: (tValue: number) => set((s) => { s.playheadTime = Math.max(0, tValue); }),
  togglePlayback: () => set((s) => { s.isPlaying = !s.isPlaying; }),
  setZoom: (zValue: number) => set((s) => { s.zoom = Math.max(0.1, Math.min(10, zValue)); }),
  setScrollX: (xValue: number) => set((s) => { s.scrollX = xValue; }),
  selectClip: (id: string, multi?: boolean) => set((s) => {
    if (multi) {
      const idx = s.selectedClipIds.indexOf(id);
      if (idx >= 0) s.selectedClipIds.splice(idx, 1);
      else s.selectedClipIds.push(id);
    } else {
      s.selectedClipIds = [id];
    }
  }),
  deselectAll: () => set((s) => { s.selectedClipIds = []; }),
  addTrack: (type: 'video' | 'audio') => set((s) => {
    const count = s.tracks.filter((tr: Track) => tr.type === type).length + 1;
    const name = type === 'video' ? `V${count}` : `A${count}`;
    s.tracks.push({
      id: `${type[0]}${count}-${Date.now()}`,
      type, name, locked: false, muted: false, solo: false,
      visible: true, height: type === 'video' ? 48 : 40,
      color: type === 'video' ? '#4900ad' : '#0034c0', clips: [],
    });
  }),
  removeTrack: (id: string) => set((s) => { s.tracks = s.tracks.filter((t: Track) => t.id !== id); }),
  toggleTrackLock: (id: string) => set((s) => {
    const t = s.tracks.find((tr: Track) => tr.id === id);
    if (t) t.locked = !t.locked;
  }),
  toggleTrackMute: (id: string) => set((s) => {
    const t = s.tracks.find((tr: Track) => tr.id === id);
    if (t) t.muted = !t.muted;
  }),
  toggleTrackSolo: (id: string) => set((s) => {
    const t = s.tracks.find((tr: Track) => tr.id === id);
    if (t) t.solo = !t.solo;
  }),
  toggleTrackVisible: (id: string) => set((s) => {
    const t = s.tracks.find((tr: Track) => tr.id === id);
    if (t) t.visible = !t.visible;
  }),
  addClip: (trackId: string, clip: Clip) => set((s) => {
    const t = s.tracks.find((tr: Track) => tr.id === trackId);
    if (t && !t.locked) t.clips.push(clip);
  }),
  removeClip: (trackId: string, clipId: string) => set((s) => {
    const t = s.tracks.find((tr: Track) => tr.id === trackId);
    if (t && !t.locked) t.clips = t.clips.filter((cValue: Clip) => cValue.id !== clipId);
  }),
  moveClip: (fromTrackId: string, toTrackId: string, clipId: string, newStart: number) => set((s) => {
    const from = s.tracks.find((tr: Track) => tr.id === fromTrackId);
    const to = s.tracks.find((tr: Track) => tr.id === toTrackId);
    if (!from || !to || from.locked || to.locked) return;
    const clipIdx = from.clips.findIndex((cValue: Clip) => cValue.id === clipId);
    if (clipIdx < 0) return;
    const clip = from.clips[clipIdx];
    const dur = clip.endTime - clip.startTime;
    from.clips.splice(clipIdx, 1);
    clip.startTime = newStart;
    clip.endTime = newStart + dur;
    clip.trackId = toTrackId;
    to.clips.push(clip);
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
  addMarker: (label: string, color: string) => set((s) => {
    s.markers.push({ id: `m-${Date.now()}`, time: s.playheadTime, label, color });
  }),
  setInPoint: () => set((s) => { s.inPoint = s.playheadTime; }),
  setOutPoint: () => set((s) => { s.outPoint = s.playheadTime; }),
  stepForward: () => set((s) => { s.playheadTime = Math.min(s.duration, s.playheadTime + 1/s.fps); }),
  stepBackward: () => set((s) => { s.playheadTime = Math.max(0, s.playheadTime - 1/s.fps); }),
});
