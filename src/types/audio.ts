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
