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
