import type { StateCreator } from 'zustand';
import type { StoreState } from '../index';
import type { ColorGradingState } from '../../types';

export interface ColorSlice {
  grading: ColorGradingState;
  updateGrading: (partial: Partial<ColorGradingState>) => void;
  resetGrading: () => void;
}

const defaultGrading: ColorGradingState = {
  shadows: { x: 0, y: 0, luminance: 0 },
  midtones: { x: 0.1, y: -0.1, luminance: 0 },
  highlights: { x: -0.05, y: 0.05, luminance: 0 },
  offset: { x: 0, y: 0, luminance: 0 },
  temperature: 5600,
  tint: 0,
  exposure: 0.45,
  contrast: 12,
  highlightsVal: 0,
  shadowsVal: 0,
  whites: 0,
  blacks: 0,
  saturation: 100,
  vibrance: 0,
  curves: [
    [{ x: 0, y: 0 }, { x: 0.3, y: 0.25 }, { x: 0.5, y: 0.5 }, { x: 0.7, y: 0.75 }, { x: 1, y: 1 }],
  ],
  lutIntensity: 100,
};

export const createColorSlice: StateCreator<StoreState, [['zustand/immer', never]], [], ColorSlice> = (set) => ({
  grading: { ...defaultGrading },
  updateGrading: (partial: Partial<ColorGradingState>) => set((s) => { 
    Object.assign(s.grading, partial); 
  }),
  resetGrading: () => set((s) => { 
    s.grading = { ...defaultGrading }; 
  }),
});
