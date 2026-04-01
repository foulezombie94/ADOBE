import Decimal from 'break_infinity.js';

export type Rarity = 'Common' | 'Rare' | 'Epic' | 'Legendary';
export type Zone = 'dock' | 'crane' | 'trucks';

export interface UpgradeStats {
  level: number;
  baseSpeed: Decimal;
  baseCapacity: Decimal;
  costMultiplier: number;
  baseCost: Decimal;
}

export interface Manager {
  id: string;
  name: string;
  rarity: Rarity;
  passiveMultiplier: number; // Ex: 1.2
  activeMultiplier: number;  // Ex: 3.0
  duration: number;          // ms
  cooldown: number;          // ms
}

export interface AssignedManager {
  managerId: string | null;
  activeUntil: number; // timestamp
  cooldownUntil: number; // timestamp
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  createdAt: number;
}
