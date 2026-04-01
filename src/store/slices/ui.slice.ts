import type { StateCreator } from 'zustand';
import type { StoreState } from '../index';
import type { Workspace, ToolType } from '../../types';

export interface UISlice {
  workspace: Workspace;
  activeTool: ToolType;
  setWorkspace: (w: Workspace) => void;
  setActiveTool: (t: ToolType) => void;
}

export const createUISlice: StateCreator<StoreState, [['zustand/immer', never]], [], UISlice> = (set) => ({
  workspace: 'projects',
  activeTool: 'select',
  setWorkspace: (w: Workspace) => set((s) => { s.workspace = w; }),
  setActiveTool: (t: ToolType) => set((s) => { s.activeTool = t; }),
});
