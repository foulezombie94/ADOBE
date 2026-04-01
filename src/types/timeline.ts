export interface Point {
  x: number;
  y: number;
}

export interface Marker {
  id: string;
  time: number;
  label: string;
  color: string;
}

export type TransitionType =
  | 'cross_dissolve' | 'dip_to_black' | 'dip_to_white'
  | 'wipe' | 'push' | 'slide' | 'cross_zoom'
  | 'iris' | 'film_dissolve' | 'morph_cut';

export interface Transition {
  id: string;
  type: TransitionType;
  duration: number;
  alignment: 'center' | 'before' | 'after';
  params: Record<string, number>;
}

export interface Keyframe {
  time: number;
  value: number | string | { x: number; y: number };
  interpolation: 'linear' | 'bezier' | 'hold' | 'ease';
  bezierHandles?: { in: Point; out: Point };
}

export type KeyframeMap = Record<string, Keyframe[]>;

export interface Clip {
  id: string;
  assetId: string;
  trackId: string;
  startTime: number;
  endTime: number;
  inPoint: number;
  outPoint: number;
  speed: number;
  volume: number;
  opacity: number;
  color: string;
  label: string;
  effects: any[]; // Avoid circular dependency if I split effects
  keyframes: KeyframeMap;
  transitions: { in?: Transition; out?: Transition };
}

export interface Track {
  id: string;
  type: 'video' | 'audio';
  name: string;
  locked: boolean;
  muted: boolean;
  solo: boolean;
  visible: boolean;
  height: number;
  color: string;
  clips: Clip[];
}
