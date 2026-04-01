import { useEffect } from 'react';
import { useTimelineStore } from '../store';

export const useTimelineShortcuts = () => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const state = useTimelineStore.getState();
      switch (e.key) {
        case ' ':
          e.preventDefault();
          state.togglePlayback();
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (e.shiftKey) state.setPlayheadTime(state.playheadTime + 5);
          else state.stepForward();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (e.shiftKey) state.setPlayheadTime(Math.max(0, state.playheadTime - 5));
          else state.stepBackward();
          break;
        case 'i':
        case 'I':
          state.setInPoint();
          break;
        case 'o':
        case 'O':
          state.setOutPoint();
          break;
        case 'm':
        case 'M':
          state.addMarker('Marker', '#4ade80');
          break;
        case 'Delete':
          const clipIds = state.selectedClipIds;
          clipIds.forEach((clipId: string) => {
            state.tracks.forEach((track: any) => {
              if (track.clips.some((c: any) => c.id === clipId)) {
                state.removeClip(track.id, clipId);
              }
            });
          });
          break;
        case 'Home':
          state.setPlayheadTime(0);
          break;
        case 'End':
          state.setPlayheadTime(state.duration);
          break;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        state.cutAtPlayhead();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
};
