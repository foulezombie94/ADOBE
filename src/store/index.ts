import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';

import { createUISlice } from './slices/ui.slice';
import type { UISlice } from './slices/ui.slice';
import { createTimelineSlice } from './slices/timeline.slice';
import type { TimelineSlice } from './slices/timeline.slice';
import { createProjectSlice } from './slices/project.slice';
import type { ProjectSlice } from './slices/project.slice';
import { createColorSlice } from './slices/color.slice';
import type { ColorSlice } from './slices/color.slice';
import { createMixerSlice } from './slices/mixer.slice';
import type { MixerSlice } from './slices/mixer.slice';

export type StoreState = UISlice & TimelineSlice & ProjectSlice & ColorSlice & MixerSlice;

export const useStore = create<StoreState>()(
  persist(
    immer((set, get, api) => ({
      ...createUISlice(set, get, api),
      ...createTimelineSlice(set, get, api),
      ...createProjectSlice(set, get, api),
      ...createColorSlice(set, get, api),
      ...createMixerSlice(set, get, api),
    })),
    {
      name: 'obsidian-engine-storage',
      partialize: (state: StoreState) => ({
        zoom: state.zoom,
        projectName: state.projectName,
        activeTool: state.activeTool,
      }),
    }
  )
);

// Helper for selective state subscription
export const useUIStore = () => useStore((s: StoreState) => ({
  workspace: s.workspace,
  activeTool: s.activeTool,
  setWorkspace: s.setWorkspace,
  setActiveTool: s.setActiveTool,
}));

export const useTimelineStore = useStore;
export const useProjectStore = useStore;
export const useColorStore = useStore;
export const useMixerStore = useStore;
