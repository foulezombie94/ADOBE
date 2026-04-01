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

export interface KeyframableValue {
  value: number | string;
  keyframes?: any[]; // Replaced Keyframe with any to avoid circularity if needed, or I import it
}

export interface Effect {
  id: string;
  type: EffectType;
  enabled: boolean;
  params: Record<string, KeyframableValue>;
}
