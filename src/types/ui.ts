export type Workspace = 'projects' | 'edit' | 'audio' | 'color' | 'export';

export type ToolType =
  | 'select' | 'track_select' | 'ripple_edit'
  | 'razor' | 'slip' | 'pen' | 'text' | 'zoom' | 'hand';

export interface UndoAction {
  id: string;
  label: string;
  timestamp: number;
}
