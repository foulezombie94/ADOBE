// ============================================
// Obsidian Engine — TypeScript Interfaces
// ============================================

// ─── Media Assets ──────────────────────────
export interface MediaAsset {
  id: string;
  name: string;
  type: 'video' | 'audio' | 'image' | 'sequence';
  file?: File;
  duration: number;
  fps: number;
  resolution: { w: number; h: number };
  codec: string;
  thumbnail: string;
  proxyUrl?: string;
  tags: string[];
  binId: string;
  createdAt: Date;
  size: number;
}

// ─── Timeline ──────────────────────────────
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
  effects: Effect[];
  keyframes: KeyframeMap;
  transitions: { in?: Transition; out?: Transition };
}

export interface Keyframe {
  time: number;
  value: number | string | { x: number; y: number };
  interpolation: 'linear' | 'bezier' | 'hold' | 'ease';
  bezierHandles?: { in: Point; out: Point };
}

export type KeyframeMap = Record<string, Keyframe[]>;

export interface Point {
  x: number;
  y: number;
}

export interface Transition {
  id: string;
  type: TransitionType;
  duration: number;
  alignment: 'center' | 'before' | 'after';
  params: Record<string, number>;
}

export type TransitionType =
  | 'cross_dissolve' | 'dip_to_black' | 'dip_to_white'
  | 'wipe' | 'push' | 'slide' | 'cross_zoom'
  | 'iris' | 'film_dissolve' | 'morph_cut';

// ─── Effects ───────────────────────────────
export interface Effect {
  id: string;
  type: EffectType;
  enabled: boolean;
  params: Record<string, KeyframableValue>;
}

export interface KeyframableValue {
  value: number | string;
  keyframes?: Keyframe[];
}

export type EffectType =
  | 'brightness' | 'contrast' | 'saturation' | 'hue_rotate'
  | 'exposure' | 'highlights' | 'shadows' | 'whites' | 'blacks'
  | 'temperature' | 'tint' | 'vibrance' | 'clarity'
  | 'blur_gaussian' | 'blur_radial' | 'blur_directional'
  | 'sharpen' | 'unsharp_mask'
  | 'transform' | 'crop' | 'flip_h' | 'flip_v' | 'rotate'
  | 'corner_pin' | 'lens_distortion' | 'warp_stabilizer'
  | 'blend_mode' | 'alpha_matte' | 'luma_matte' | 'chroma_key'
  | 'grain' | 'vignette' | 'glow' | 'bloom' | 'lens_flare'
  | 'anamorphic_flare' | 'halation' | 'film_damage'
  | 'echo' | 'posterize_time' | 'motion_blur'
  | 'add_grain' | 'median' | 'reduce_noise';

// ─── Audio ─────────────────────────────────
export type AudioEffectType =
  | 'eq_parametric' | 'eq_graphic'
  | 'compressor' | 'limiter' | 'gate'
  | 'reverb_convolution' | 'reverb_algorithmic'
  | 'delay' | 'chorus' | 'flanger'
  | 'pitch_shift' | 'time_stretch'
  | 'noise_reduction' | 'stereo_widener'
  | 'deesser' | 'normalize';

export interface AudioEffect {
  id: string;
  type: AudioEffectType;
  enabled: boolean;
  params: Record<string, number>;
}

export interface MixerChannel {
  trackId: string;
  name: string;
  volume: number;
  pan: number;
  muted: boolean;
  solo: boolean;
  recording: boolean;
  effects: AudioEffect[];
  peakLevel: number;
}

// ─── Color Grading ─────────────────────────
export interface ColorWheelState {
  x: number;
  y: number;
  luminance: number;
}

export interface ColorGradingState {
  shadows: ColorWheelState;
  midtones: ColorWheelState;
  highlights: ColorWheelState;
  offset: ColorWheelState;
  temperature: number;
  tint: number;
  exposure: number;
  contrast: number;
  highlightsVal: number;
  shadowsVal: number;
  whites: number;
  blacks: number;
  saturation: number;
  vibrance: number;
  curves: CurvePoint[][];
  lutFile?: string;
  lutIntensity: number;
}

export interface CurvePoint {
  x: number;
  y: number;
}

// ─── Export ────────────────────────────────
export interface ExportSettings {
  format: 'mp4' | 'webm' | 'mov' | 'gif' | 'png_sequence' | 'mp3' | 'wav';
  videoCodec: 'h264' | 'h265' | 'vp8' | 'vp9' | 'av1' | 'prores';
  audioCodec: 'aac' | 'mp3' | 'opus' | 'flac' | 'pcm';
  resolution: { width: number; height: number };
  frameRate: number;
  videoBitrate: number;
  audioBitrate: number;
  audioSampleRate: 44100 | 48000 | 96000;
  colorSpace: 'sdr' | 'hdr_hlg' | 'hdr_pq';
  startTime: number;
  endTime: number;
  chapters: boolean;
  maxRenderQuality: boolean;
}

// ─── Project ───────────────────────────────
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

export interface ProjectSettings {
  resolution: { width: number; height: number };
  frameRate: number;
  sampleRate: number;
  colorSpace: string;
  previewQuality: '1/8' | '1/4' | '1/2' | 'full';
}

export interface Marker {
  id: string;
  time: number;
  label: string;
  color: string;
}

// ─── UI State ──────────────────────────────
export type Workspace = 'projects' | 'edit' | 'audio' | 'color' | 'export';

export type ToolType =
  | 'select' | 'track_select' | 'ripple_edit'
  | 'razor' | 'slip' | 'pen' | 'text' | 'zoom' | 'hand';

export interface UndoAction {
  id: string;
  label: string;
  timestamp: number;
}
