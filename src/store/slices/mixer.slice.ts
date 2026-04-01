import type { StateCreator } from 'zustand';
import type { StoreState } from '../index';
import type { MixerChannel } from '../../types';

export interface MixerSlice {
  channels: MixerChannel[];
  masterVolume: number;
  masterPeak: { l: number; r: number };
  setChannelVolume: (trackId: string, volume: number) => void;
  setChannelPan: (trackId: string, pan: number) => void;
  toggleChannelMute: (trackId: string) => void;
  toggleChannelSolo: (trackId: string) => void;
  setMasterVolume: (volume: number) => void;
}

export const createMixerSlice: StateCreator<StoreState, [['zustand/immer', never]], [], MixerSlice> = (set) => ({
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
  toggleChannelMute: (trackId: string) => set((s) => {
    const ch = s.channels.find(c => c.trackId === trackId);
    if (ch) ch.muted = !ch.muted;
  }),
  toggleChannelSolo: (trackId: string) => set((s) => {
    const ch = s.channels.find(c => c.trackId === trackId);
    if (ch) ch.solo = !ch.solo;
  }),
  setMasterVolume: (volume) => set((s) => { s.masterVolume = volume; }),
});
