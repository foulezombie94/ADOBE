/** Convert seconds to timecode HH:MM:SS:FF */
export function secondsToTimecode(seconds: number, fps: number = 23.976): string {
  const totalFrames = Math.floor(seconds * fps);
  const ff = totalFrames % Math.ceil(fps);
  const totalSeconds = Math.floor(totalFrames / Math.ceil(fps));
  const ss = totalSeconds % 60;
  const mm = Math.floor(totalSeconds / 60) % 60;
  const hh = Math.floor(totalSeconds / 3600);
  return `${pad(hh)}:${pad(mm)}:${pad(ss)}:${pad(ff)}`;
}

/** Convert timecode to seconds */
export function timecodeToSeconds(tc: string, fps: number = 23.976): number {
  const [hh, mm, ss, ff] = tc.split(':').map(Number);
  return hh * 3600 + mm * 60 + ss + ff / fps;
}

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

/** Format file size */
export function formatSize(bytes: number): string {
  if (bytes >= 1e12) return `${(bytes / 1e12).toFixed(1)} TB`;
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(1)} GB`;
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(1)} MB`;
  if (bytes >= 1e3) return `${(bytes / 1e3).toFixed(1)} KB`;
  return `${bytes} B`;
}

/** Format duration in seconds to human readable */
export function formatDuration(seconds: number): string {
  const hh = Math.floor(seconds / 3600);
  const mm = Math.floor((seconds % 3600) / 60);
  const ss = Math.floor(seconds % 60);
  if (hh > 0) return `${pad(hh)}:${pad(mm)}:${pad(ss)}`;
  return `${pad(mm)}:${pad(ss)}`;
}

/** Generate unique ID */
export function uid(): string {
  return Math.random().toString(36).substring(2, 11);
}

/** Clamp value between min and max */
export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

/** Linear interpolation */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** dB to linear gain */
export function dbToGain(db: number): number {
  return Math.pow(10, db / 20);
}

/** Linear gain to dB */
export function gainToDb(gain: number): number {
  if (gain <= 0) return -Infinity;
  return 20 * Math.log10(gain);
}
