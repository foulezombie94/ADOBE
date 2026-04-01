import { useGameStore } from '../store/gameStore';
import type { Zone } from '../types';
import './Modals.css';

export const FloatingTextsLayer = () => {
    const floatingTexts = useGameStore(state => state.floatingTexts);

    return (
        <div className="floating-text-layer">
            {floatingTexts.map(text => (
                <div 
                    key={text.id} 
                    className="floating-text" 
                    style={{ left: text.x, top: text.y, color: text.color }}
                >
                    {text.text}
                </div>
            ))}
        </div>
    );
};

export const ManagerModal = ({ zone, onClose }: { zone: Zone, onClose: () => void }) => {
    const managers = useGameStore(state => state.managers);
    const assignManager = useGameStore(state => state.assignManager);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <span>Recruter un Manager</span>
                    <button className="close-button" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body">
                    {managers.length === 0 ? (
                        <p style={{textAlign: 'center', color: '#CBD5E0'}}>Vous n'avez aucun Manager en stock. Rendez-vous dans la Boutique !</p>
                    ) : (
                        managers.map(m => (
                            <div key={m.id} className={`manager-card ${m.rarity}`}>
                                <div className="info">
                                    <span className="name" style={{
                                        color: m.rarity === 'Legendary' ? '#F6E05E' : 
                                               m.rarity === 'Epic' ? '#9F7AEA' :
                                               m.rarity === 'Rare' ? '#4299E1' : '#A0AEC0'
                                    }}>{m.name}</span>
                                    <span className="stats">Passif: x{m.passiveMultiplier} | Actif: x{m.activeMultiplier}</span>
                                </div>
                                <button className="assign-btn" onClick={() => {
                                    assignManager(zone, m.id);
                                    onClose();
                                }}>Assigner</button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export const GachaModal = ({ onClose }: { onClose: () => void }) => {
    const hardCurrency = useGameStore(state => state.hardCurrency);
    const openGachaChest = useGameStore(state => state.openGachaChest);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <span>Siège Social (Boutique)</span>
                    <button className="close-button" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body" style={{alignItems: 'center', justifyContent: 'center'}}>
                    <h2>Coffre de Recrutement</h2>
                    <p style={{color: 'gray', textAlign: 'center'}}>Ouvre ce conteneur Premium avec des Diamants pour trouver un Manager Exceptionnel qui triplera ton économie !</p>
                    <button 
                        className={`assign-btn ${hardCurrency.lt(10) ? 'disabled' : ''}`}
                        style={{ padding: '15px 30px', fontSize: '1.2rem', marginTop: '20px', backgroundColor: '#F6E05E', color: '#1B263B' }}
                        onClick={() => {
                            if (hardCurrency.gte(10)) {
                                openGachaChest();
                            }
                        }}
                    >
                        Ouvrir (10 💎)
                    </button>
                    <p style={{marginTop: '20px', fontWeight: 'bold'}}>Vos diamants: {hardCurrency.toNumber().toFixed(0)} 💎</p>
                </div>
            </div>
        </div>
    );
};

export const PrestigeModal = ({ onClose }: { onClose: () => void }) => {
    const prestigeReset = useGameStore(state => state.prestigeReset);
    const softCurrency = useGameStore(state => state.softCurrency);
    
    const gainedPrestige = softCurrency.dividedBy(1000).sqrt().floor();

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <span>Extension Mondiale (Prestige)</span>
                    <button className="close-button" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body" style={{alignItems: 'center', justifyContent: 'center'}}>
                    <h2>Vendre ce Port</h2>
                    <p style={{color: 'gray', textAlign: 'center'}}>Revendez votre infrastructure actuelle pour gagner en Réputation Internationale. Vous recommencerez de zéro, mais vos bénéfices futurs seront colossaux.</p>
                    
                    <div style={{margin: '20px 0', textAlign: 'center'}}>
                        <p>Nouvelle Réputation : <span style={{color: '#F3722C', fontWeight: 'bold'}}>+{gainedPrestige.toString()} RP</span></p>
                        <p style={{fontSize: '0.9rem', color: '#43AA8B'}}>Chaque RP offre un bonus de revenu permanent de +10%.</p>
                    </div>

                    <button 
                        className="assign-btn"
                        style={{ padding: '15px 30px', fontSize: '1.2rem', backgroundColor: '#F3722C', color: 'white' }}
                        onClick={() => {
                            if (gainedPrestige.gt(0)) {
                                prestigeReset();
                                onClose();
                            }
                        }}
                    >
                        Accepter (+{gainedPrestige.toString()} RP)
                    </button>
                </div>
            </div>
        </div>
    );
};
