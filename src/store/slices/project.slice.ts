import type { StateCreator } from 'zustand';
import type { StoreState } from '../index';
import type { MediaAsset } from '../../types';

export interface ProjectSlice {
  assets: MediaAsset[];
  projectName: string;
  addAsset: (asset: MediaAsset) => void;
  removeAsset: (id: string) => void;
}

export const createProjectSlice: StateCreator<StoreState, [['zustand/immer', never]], [], ProjectSlice> = (set) => ({
  projectName: 'Cinematic_Edit_v4',
  assets: [],
  addAsset: (asset: MediaAsset) => set((s) => { s.assets.push(asset); }),
  removeAsset: (id: string) => set((s) => { s.assets = s.assets.filter(a => a.id !== id); }),
});
