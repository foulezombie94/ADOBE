import { MediaAsset } from './media';
import { Track, Marker } from './timeline';
import { ExportSettings } from './export';

export interface ProjectSettings {
  resolution: { width: number; height: number };
  frameRate: number;
  sampleRate: number;
  colorSpace: string;
  previewQuality: '1/8' | '1/4' | '1/2' | 'full';
}

export interface Project {
  id: string;
  name: string;
  version: string;
  createdAt: Date;
  modifiedAt: Date;
  settings: ProjectSettings;
  assets: MediaAsset[];
  timeline: {
    tracks: Track[];
    duration: number;
    markers: Marker[];
  };
  exportPresets: ExportSettings[];
}
