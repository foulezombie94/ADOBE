import { useEffect, useState, memo } from 'react';
import { useGameStore } from './store/gameStore';
import { formatCurrency } from './utils/math';
import { Anchor, ArrowUpFromLine, Truck, ShoppingCart, Globe, UserPlus, Play } from 'lucide-react';
import { FloatingTextsLayer, ManagerModal, GachaModal, PrestigeModal } from './components/Modals';
import type { Zone } from './types';
import './index.css';

// ----------------------------------------------------
// UI COMPONENTS - PREMIUM METAL & GLASS
// ----------------------------------------------------
const ParticlesOverlay = memo(() => {
    return (
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
            {Array.from({length: 8}).map((_, i) => (
                <circle 
                    key={i} 
                    cx={`${Math.random() * 80 + 10}%`} 
                    cy={`${80}%`} 
                    r={Math.random() * 2 + 0.5} 
                    fill="#00ffcc"
                    style={{ animation: `sparkUp ${Math.random() * 2 + 1}s infinite cubic-bezier(0.25, 1, 0.5, 1)`, animationDelay: `${Math.random() * 2}s` }}
                />
            ))}
        </svg>
    );
});

function PremiumUpgradeButton({ zone, icon, name, level, costStr, canAfford, onUpgrade, onOpenManager }: any) {
  const dynamicClass = canAfford ? '' : 'disabled';
  const assigned = useGameStore(state => state.assignedManagers[zone as Zone]);
  const manager = useGameStore(state => state.managers.find(m => m.id === assigned.managerId));
  const isActive = Date.now() < assigned.activeUntil;
  const activateManagerSkill = useGameStore(state => state.activateManagerSkill);

  return (
    <div style={{display: 'flex', gap: '10px', alignItems: 'stretch', width: '100%'}}>
      <button 
        onClick={(e) => { 
            e.stopPropagation(); 
            if (manager && !isActive) { activateManagerSkill(zone); } 
            else if (!manager) { onOpenManager(); }
        }}
        style={{ 
            background: manager ? (isActive ? 'linear-gradient(180deg, #43AA8B 0%, #2A7961 100%)' : 'linear-gradient(180deg, #F6E05E 0%, #D69E2E 100%)') : 'rgba(30, 40, 50, 0.7)',
            border: `2px solid var(--chrome-base)`,
            borderRadius: '22px',
            width: '60px',
            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
            boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.4), 0 4px 10px rgba(0,0,0,0.6)',
            backdropFilter: 'blur(8px)',
            pointerEvents: 'auto', cursor: 'pointer', transition: 'transform 0.1s'
        }}
        onMouseDown={e => e.currentTarget.style.transform = 'translateY(2px)'}
        onMouseUp={e => e.currentTarget.style.transform = 'none'}
      >
        {manager ? ( <Play size={24} color={isActive ? "white" : "#1B263B"} fill={isActive ? "white" : "#1B263B"} /> ) : ( <UserPlus size={24} color="#a3b1c6" /> )}
      </button>

      <div className={`premium-btn-wrapper ${dynamicClass}`} style={{flex: 1}} onClick={() => { if (canAfford) onUpgrade(); }}>
          <div className="premium-btn-inner">
              <ParticlesOverlay />
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center', zIndex: 2 }}>
                  <div className="premium-btn-badge">{icon}</div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '1.05rem', fontWeight: 900, textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                        {name} {isActive && manager && <span style={{color: '#43AA8B', marginLeft: '5px'}}>⚡x{manager.activeMultiplier}</span>}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: '#F3722C', fontWeight: 700 }}>Niveau {level}</span>
                  </div>
              </div>
              <div className="premium-price-box">${costStr}</div>
          </div>
      </div>
    </div>
  );
}

const HUDTop = () => {
  const softCurrencyStr = useGameStore((state) => formatCurrency(state.softCurrency));
  const hardCurrencyStr = useGameStore((state) => formatCurrency(state.hardCurrency));
  const reputation = useGameStore((state) => state.reputationPoints.toNumber());

  return (
    <div className="hud-top">
      <div className="premium-pill">
        <span style={{color: '#43AA8B', textShadow: '0 0 5px rgba(67, 170, 139, 0.5)'}}>$</span>
        <span>{softCurrencyStr}</span>
      </div>
      <div style={{display: 'flex', gap: '10px'}}>
        {reputation > 0 && (
          <div className="premium-pill" style={{color: '#F3722C'}}>
            <span>⭐</span><span>{reputation}</span>
          </div>
        )}
        <div className="premium-pill">
          <span>{hardCurrencyStr}</span><span style={{textShadow: '0 0 5px rgba(0, 255, 255, 0.5)'}}>💎</span>
        </div>
      </div>
    </div>
  );
};

const HUDSidebar = ({ onOpenModal }: { onOpenModal: (m: string) => void }) => {
    return (
        <div style={{ position: 'absolute', right: '15px', top: '100px', display: 'flex', flexDirection: 'column', gap: '15px', pointerEvents: 'auto' }}>
            <button className="premium-pill close-button" style={{backgroundColor: 'rgba(246, 224, 94, 0.6)', width: '50px', height: '50px', justifyContent: 'center'}} onClick={() => onOpenModal('gacha')}>
                <ShoppingCart size={20} color="white" />
            </button>
            <button className="premium-pill close-button" style={{backgroundColor: 'rgba(243, 114, 44, 0.6)', width: '50px', height: '50px', justifyContent: 'center'}} onClick={() => onOpenModal('prestige')}>
                <Globe size={20} color="white" />
            </button>
        </div>
    );
};

const HUDBottom = ({ onOpenManager }: { onOpenManager: (zone: Zone) => void }) => {
  const dock = useGameStore((state) => state.dock);
  const crane = useGameStore((state) => state.crane);
  const trucks = useGameStore((state) => state.trucks);

  const upgradeDock = useGameStore((state) => state.upgradeDock);
  const upgradeCrane = useGameStore((state) => state.upgradeCrane);
  const upgradeTrucks = useGameStore((state) => state.upgradeTrucks);

  const dockCostStr = useGameStore((state) => formatCurrency(state.getDockCost()));
  const craneCostStr = useGameStore((state) => formatCurrency(state.getCraneCost()));
  const trucksCostStr = useGameStore((state) => formatCurrency(state.getTrucksCost()));

  const canAffordDock = useGameStore((state) => state.softCurrency.gte(state.getDockCost()));
  const canAffordCrane = useGameStore((state) => state.softCurrency.gte(state.getCraneCost()));
  const canAffordTrucks = useGameStore((state) => state.softCurrency.gte(state.getTrucksCost()));

  return (
    <div className="hud-bottom">
      <PremiumUpgradeButton zone="dock" icon={<Anchor size={22} color="#A3B1C6"/>} name="Quais (Production)" level={dock.level} costStr={dockCostStr} canAfford={canAffordDock} onUpgrade={upgradeDock} onOpenManager={() => onOpenManager('dock')} />
      <PremiumUpgradeButton zone="crane" icon={<ArrowUpFromLine size={22} color="#A3B1C6"/>} name="Grue de Transit" level={crane.level} costStr={craneCostStr} canAfford={canAffordCrane} onUpgrade={upgradeCrane} onOpenManager={() => onOpenManager('crane')} />
      <PremiumUpgradeButton zone="trucks" icon={<Truck size={22} color="#A3B1C6"/>} name="Flotte de Camions" level={trucks.level} costStr={trucksCostStr} canAfford={canAffordTrucks} onUpgrade={upgradeTrucks} onOpenManager={() => onOpenManager('trucks')} />
    </div>
  );
};

// ----------------------------------------------------
// ISO CUBE DYNAMIC LAYER (Les objets qui bougent par-dessus l'image)
// ----------------------------------------------------
interface IsoCubeProps {
  x: number; y: number; z: number; size?: number; baseColor: string;
}

const IsoCube = ({ x, y, z, size = 40, baseColor }: IsoCubeProps) => {
  const isoX = x * size - y * size;
  const isoY = (x * size + y * size) / 2 - z * size;

  return (
    <g transform={`translate(${isoX}, ${isoY})`} style={{ filter: 'drop-shadow(2px 8px 6px rgba(0,0,0,0.5))' }}>
      <path d={`M 0,${size/2} L ${size},${size} L ${size},0 L 0,-${size/2} Z`} fill={baseColor} filter="brightness(75%)" stroke="rgba(0,0,0,0.1)"/>
      <path d={`M ${size},${size} L ${size*2},${size/2} L ${size*2},-${size/2} L ${size},0 Z`} fill={baseColor} filter="brightness(50%)" stroke="rgba(0,0,0,0.2)"/>
      <path d={`M 0,${size/2} L ${size},0 L ${size*2},${size/2} L ${size},${size} Z`} fill={baseColor} filter="brightness(120%)" stroke="rgba(255,255,255,0.1)"/>
    </g>
  );
};

const ViewportDynamicOverlay = memo(() => {
  const numOnDock = useGameStore((state) => Math.floor(state.containersOnDock.toNumber()));
  const numInTransit = useGameStore((state) => Math.floor(state.containersInTransit.toNumber()));
  const trucksLevel = useGameStore((state) => state.trucks.level);
  
  const sceneItems: any[] = [];

  // Seuls les conteneurs dynamiques sont ajoutés à la scène (le reste est dans l'image de fond)
  for(let i = 0; i < Math.min(100, numOnDock); i++) {
    const floor = Math.floor(i / 15);
    const rem = i % 15;
    sceneItems.push({ x: rem % 5, y: Math.floor(rem / 5), z: 1 + floor, type: 'container', color: '#00897B' });
  }

  for(let i = 0; i < Math.min(50, numInTransit); i++) {
    const floor = Math.floor(i / 12);
    const rem = i % 12;
    // Décalé sur le côté pour l'UI, à recalibrer visuellement avec l'image
    sceneItems.push({ x: 7 + (rem % 4), y: Math.floor(rem / 4), z: 1 + floor, type: 'container', color: '#FDD835' });
  }

  sceneItems.sort((a, b) => (a.x + a.y + a.z * 1.5) - (b.x + b.y + b.z * 1.5));

  return (
    <div className="viewport" style={{position: 'absolute', top:0, left:0, width:'100%', height:'100%', pointerEvents: 'none'}}>
      <svg viewBox="-400 -100 800 800" width="100%" height="100%">
        {/* On décale l'ensemble du groupe dynamique pour qu'il coïncide grossièrement avec la position des vieux SVG supprimés */}
        <g transform="translate(-50, 80)">
          {sceneItems.map((item, idx) => (
             <IsoCube key={`dynamic-${idx}`} x={item.x} y={item.y} z={item.z} baseColor={item.color} />
          ))}
        </g>
        
        {/* Camion dynamique superposé */}
        <g className="animated-svg-element" style={{ animation: `driveIso ${Math.max(1, 10 / trucksLevel)}s linear infinite` }}>
            <IsoCube x={12.5} y={0} z={0.5} baseColor="#E65100" size={30} />
            <IsoCube x={12.5} y={1} z={0.5} baseColor="#455A64" size={30} />
            <IsoCube x={12.5} y={2} z={0.5} baseColor="#455A64" size={30} />
        </g>
      </svg>
    </div>
  );
});

// ----------------------------------------------------
// MAIN APP COMPONENT
// ----------------------------------------------------
function App() {
  const tick = useGameStore((state) => state.tick);
  
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [managerZone, setManagerZone] = useState<Zone | null>(null);

  useEffect(() => {
    // Boucle de jeu (moteur Idle)
    const interval = setInterval(() => { tick(); }, 50);
    return () => clearInterval(interval);
  }, [tick]);

  return (
    // L'IMAGE DE FOND EST RESTAURÉE ICI COMME DEMANDÉ
    <div className="isometric-container" style={{backgroundImage: "url('/background_port.png')", backgroundSize: 'cover', backgroundPosition: 'center'}}>
      
      {/* LA COUCHE DYNAMIQUE (CONTENEURS ET CAMIONS) SE SUPERPOSE À L'IMAGE POUR QU'ELLE SOIT FONCTIONNELLE */}
      <ViewportDynamicOverlay />
      <FloatingTextsLayer />
      
      <div className="hud-overlay">
        <HUDTop />
        <HUDSidebar onOpenModal={setActiveModal} />
        <HUDBottom onOpenManager={(zone) => { setManagerZone(zone); setActiveModal('manager'); }} />
      </div>

      {activeModal === 'manager' && managerZone && ( <ManagerModal zone={managerZone} onClose={() => setActiveModal(null)} /> )}
      {activeModal === 'gacha' && ( <GachaModal onClose={() => setActiveModal(null)} /> )}
      {activeModal === 'prestige' && ( <PrestigeModal onClose={() => setActiveModal(null)} /> )}
    </div>
  );
}

export default App;
