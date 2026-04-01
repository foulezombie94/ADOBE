export interface CurvePoint {
  x: number;
  y: number;
}

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
