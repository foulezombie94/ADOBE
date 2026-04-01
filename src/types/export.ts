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
