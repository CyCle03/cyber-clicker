import { gameState, loadState } from './state.js';

const SAVE_KEY = 'cyberClickerSave';

export function saveGame() {
    const saveData = {
        bits: gameState.bits,
        lifetimeBits: gameState.lifetimeBits,
        upgrades: gameState.upgrades,
        achievements: gameState.achievements.map(a => ({ id: a.id, unlocked: a.unlocked })),
        rootAccessLevel: gameState.rootAccessLevel,
        cryptos: gameState.cryptos,
        permanentMultiplier: gameState.permanentMultiplier,
        activeBoosts: gameState.activeBoosts
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
}

export function loadGame() {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
        try {
            const data = JSON.parse(saved);
            loadState(data);
            return true;
        } catch (e) {
            console.error("Save file corrupted", e);
            return false;
        }
    }
    loadState(null); // Initialize fresh if no save
    return false;
}

export function clearSave() {
    localStorage.removeItem(SAVE_KEY);
}
