import { create } from 'zustand';
import Decimal from 'break_infinity.js';
import type { Rarity, Zone, UpgradeStats, Manager, AssignedManager, FloatingText } from '../types';

interface GameState {
  // Monnaies
  softCurrency: Decimal;
  hardCurrency: Decimal;
  reputationPoints: Decimal; // Gagne par prestige
  researchPoints: Decimal;   // Généré au fil du temps

  // Zones
  dock: UpgradeStats;
  crane: UpgradeStats;
  trucks: UpgradeStats;

  // Stocks
  containersOnDock: Decimal;
  containersInTransit: Decimal;

  // Managers
  managers: Manager[];
  assignedManagers: Record<Zone, AssignedManager>;
  
  // Arbre de compétences (Multiplicateurs Globaux)
  globalIncomeMultiplier: Decimal;
  globalCostReduction: number; // Ex: 0.1 pour 10% moins cher

  // Visuels Éphémères
  floatingTexts: FloatingText[];

  // Temps
  lastTick: number;

  // Méthodes Core
  tick: () => void;
  
  // Achats et Upgrades
  upgradeDock: () => void;
  upgradeCrane: () => void;
  upgradeTrucks: () => void;
  getDockCost: () => Decimal;
  getCraneCost: () => Decimal;
  getTrucksCost: () => Decimal;

  // Nouveaux Systèmes
  openGachaChest: () => void;
  assignManager: (zone: Zone, managerId: string) => void;
  activateManagerSkill: (zone: Zone) => void;
  getManagerMultiplier: (zone: Zone) => number;
  
  prestigeReset: () => void;
  addFloatingText: (text: string, x: number, y: number, color: string) => void;
  cleanFloatingTexts: () => void;
}

const getCostWithDiscount = (stat: UpgradeStats, reduction: number) => {
  const basePrice = stat.baseCost.times(new Decimal(stat.costMultiplier).pow(stat.level - 1));
  return basePrice.times(1 - reduction);
};

const generateRandomManager = (): Manager => {
  const r = Math.random();
  let rarity: Rarity = 'Common';
  let passive = 1.1; let active = 2.0; let duration = 10000; let cooldown = 30000;
  
  if (r > 0.95) { rarity = 'Legendary'; passive = 2.5; active = 10.0; duration = 20000; cooldown = 60000; }
  else if (r > 0.8) { rarity = 'Epic'; passive = 1.8; active = 5.0; duration = 15000; cooldown = 45000; }
  else if (r > 0.5) { rarity = 'Rare'; passive = 1.4; active = 3.0; }

  return {
    id: Math.random().toString(36).substr(2, 9),
    name: `${rarity} Manager`,
    rarity,
    passiveMultiplier: passive,
    activeMultiplier: active,
    duration,
    cooldown,
  };
};

export const useGameStore = create<GameState>((set, get) => ({
  softCurrency: new Decimal(100), // Bonus de départ
  hardCurrency: new Decimal(50),  // Bonus de départ pour acheter un coffre
  reputationPoints: new Decimal(0),
  researchPoints: new Decimal(0),
  
  dock: { level: 1, baseSpeed: new Decimal(1), baseCapacity: new Decimal(5), costMultiplier: 1.15, baseCost: new Decimal(10) },
  crane: { level: 1, baseSpeed: new Decimal(0.5), baseCapacity: new Decimal(5), costMultiplier: 1.15, baseCost: new Decimal(50) },
  trucks: { level: 1, baseSpeed: new Decimal(1), baseCapacity: new Decimal(3), costMultiplier: 1.15, baseCost: new Decimal(100) },

  containersOnDock: new Decimal(0),
  containersInTransit: new Decimal(0),

  managers: [],
  assignedManagers: {
    dock: { managerId: null, activeUntil: 0, cooldownUntil: 0 },
    crane: { managerId: null, activeUntil: 0, cooldownUntil: 0 },
    trucks: { managerId: null, activeUntil: 0, cooldownUntil: 0 },
  },

  globalIncomeMultiplier: new Decimal(1),
  globalCostReduction: 0,

  floatingTexts: [],
  lastTick: Date.now(),

  getDockCost: () => getCostWithDiscount(get().dock, get().globalCostReduction),
  getCraneCost: () => getCostWithDiscount(get().crane, get().globalCostReduction),
  getTrucksCost: () => getCostWithDiscount(get().trucks, get().globalCostReduction),

  getManagerMultiplier: (zone: Zone) => {
    const state = get();
    const assignment = state.assignedManagers[zone];
    if (!assignment.managerId) return 1;
    const manager = state.managers.find(m => m.id === assignment.managerId);
    if (!manager) return 1;
    
    // Si la compétence active est en cours
    if (Date.now() < assignment.activeUntil) {
      return manager.passiveMultiplier * manager.activeMultiplier;
    }
    return manager.passiveMultiplier;
  },

  tick: () => {
    const state = get();
    const now = Date.now();
    const dtMs = now - state.lastTick;
    if (dtMs <= 0 || dtMs > 86400000) { 
      set({ lastTick: now });
      return;
    }
    const dt = new Decimal(dtMs).dividedBy(1000);
    
    // Multiplicateurs de Prestige et Recherche
    const prestigeBonus = state.reputationPoints.times(0.1).plus(1); // Chaque Point = +10%
    const totalIncomeMult = state.globalIncomeMultiplier.times(prestigeBonus);

    // Multiplicateurs Managers
    const dockMult = state.getManagerMultiplier('dock');
    const craneMult = state.getManagerMultiplier('crane');
    const trucksMult = state.getManagerMultiplier('trucks');

    const MAX_DOCK_CAPACITY = new Decimal(100);
    const MAX_TRANSIT_CAPACITY = new Decimal(50);
    
    // 1. Quai
    const dockProduction = state.dock.baseSpeed.times(state.dock.baseCapacity).times(dt).times(dockMult);
    let newContainersOnDock = state.containersOnDock.plus(dockProduction);
    if (newContainersOnDock.gt(MAX_DOCK_CAPACITY)) newContainersOnDock = MAX_DOCK_CAPACITY;

    // 2. Grue
    const craneCapacityPerSec = state.crane.baseSpeed.times(state.crane.baseCapacity).times(dt).times(craneMult);
    const availableToMove = Decimal.min(newContainersOnDock, craneCapacityPerSec);
    const spaceInTransit = MAX_TRANSIT_CAPACITY.minus(state.containersInTransit);
    const movedByCrane = Decimal.min(availableToMove, spaceInTransit);

    const containersAfterCrane = newContainersOnDock.minus(movedByCrane);
    const newContainersInTransit = state.containersInTransit.plus(movedByCrane);

    // 3. Camions
    const truckCapacityPerSec = state.trucks.baseSpeed.times(state.trucks.baseCapacity).times(dt).times(trucksMult);
    const movedByTruck = Decimal.min(newContainersInTransit, truckCapacityPerSec);
    const finalContainersInTransit = newContainersInTransit.minus(movedByTruck);
    
    const earnedSoftCurrency = movedByTruck.times(2).times(totalIncomeMult);

    // Génération de revenus lents de recherche
    const earnedResearch = new Decimal(dt).times(0.01);

    const newFloatingTexts = [...state.floatingTexts];
    // FX de vente
    if (movedByTruck.gte(0.5)) {
        // Aléatoire position près des camions (x: ~100)
        newFloatingTexts.push({
            id: Math.random().toString(),
            text: `+$${earnedSoftCurrency.toNumber().toFixed(0)}`,
            x: 700 + Math.random() * 50,
            y: Math.random() * 50,
            color: '#43AA8B',
            createdAt: now
        });
    }

    set({
      containersOnDock: containersAfterCrane,
      containersInTransit: finalContainersInTransit,
      softCurrency: state.softCurrency.plus(earnedSoftCurrency),
      researchPoints: state.researchPoints.plus(earnedResearch),
      floatingTexts: newFloatingTexts,
      lastTick: now
    });
  },

  upgradeDock: () => {
    const { softCurrency, getDockCost } = get();
    const cost = getDockCost();
    if (softCurrency.gte(cost)) {
      set((state) => ({
        softCurrency: state.softCurrency.minus(cost),
        dock: { ...state.dock, level: state.dock.level + 1, baseSpeed: state.dock.baseSpeed.times(1.1) }
      }));
    }
  },

  upgradeCrane: () => {
    const { softCurrency, getCraneCost } = get();
    const cost = getCraneCost();
    if (softCurrency.gte(cost)) {
      set((state) => ({
        softCurrency: state.softCurrency.minus(cost),
        crane: { ...state.crane, level: state.crane.level + 1, baseCapacity: state.crane.baseCapacity.times(1.1) }
      }));
    }
  },

  upgradeTrucks: () => {
    const { softCurrency, getTrucksCost } = get();
    const cost = getTrucksCost();
    if (softCurrency.gte(cost)) {
      set((state) => ({
        softCurrency: state.softCurrency.minus(cost),
        trucks: { ...state.trucks, level: state.trucks.level + 1, baseCapacity: state.trucks.baseCapacity.times(1.05), baseSpeed: state.trucks.baseSpeed.times(1.05) }
      }));
    }
  },

  openGachaChest: () => {
    const { hardCurrency, managers } = get();
    if (hardCurrency.gte(10)) {
        const newManager = generateRandomManager();
        set({
            hardCurrency: hardCurrency.minus(10),
            managers: [...managers, newManager]
        });
    }
  },

  assignManager: (zone, managerId) => {
    set((state) => ({
      assignedManagers: { ...state.assignedManagers, [zone]: { ...state.assignedManagers[zone], managerId } }
    }));
  },

  activateManagerSkill: (zone) => {
    const state = get();
    const assignment = state.assignedManagers[zone];
    if (!assignment.managerId) return;

    const manager = state.managers.find(m => m.id === assignment.managerId);
    if (!manager) return;

    const now = Date.now();
    if (now >= assignment.cooldownUntil) {
      set({
        assignedManagers: {
          ...state.assignedManagers,
          [zone]: {
            ...assignment,
            activeUntil: now + manager.duration,
            cooldownUntil: now + manager.duration + manager.cooldown
          }
        }
      });
    }
  },

  prestigeReset: () => {
     // Gagne des points de prestige en fonction de l'argent total
     const { softCurrency, reputationPoints } = get();
     // Formule arbitraire
     const gainedPrestige = softCurrency.dividedBy(1000).sqrt().floor();
     
     if (gainedPrestige.gt(0)) {
        set({
            reputationPoints: reputationPoints.plus(gainedPrestige),
            softCurrency: new Decimal(10),
            dock: { level: 1, baseSpeed: new Decimal(1), baseCapacity: new Decimal(5), costMultiplier: 1.15, baseCost: new Decimal(10) },
            crane: { level: 1, baseSpeed: new Decimal(0.5), baseCapacity: new Decimal(5), costMultiplier: 1.15, baseCost: new Decimal(50) },
            trucks: { level: 1, baseSpeed: new Decimal(1), baseCapacity: new Decimal(3), costMultiplier: 1.15, baseCost: new Decimal(100) },
            containersOnDock: new Decimal(0),
            containersInTransit: new Decimal(0),
        });
     }
  },

  addFloatingText: (text, x, y, color) => {
    set(state => ({
        floatingTexts: [...state.floatingTexts, { id: Math.random().toString(), text, x, y, color, createdAt: Date.now() }]
    }));
  },

  cleanFloatingTexts: () => {
    const now = Date.now();
    set(state => ({
        floatingTexts: state.floatingTexts.filter(t => now - t.createdAt < 2000) // Dure 2s
    }));
  }
}));
