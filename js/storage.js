// @ts-check
import { getGameState, loadState } from "./state.js";
import { logMessage, renderAchievements, renderBlackMarket, renderShop, renderSkillTree, updateDisplay, closeSettings } from "./ui.js"; // ADDED closeSettings
import { buyBlackMarketItem, buySkill, buyUpgrade, calculateClickPower, calculateGPS } from "./game.js";
import { SoundManager } from "./sound.js";

const SAVE_KEY = 'cyberClickerSave';

export function saveGame() {
    const gameState = getGameState();
    const saveData = {
        bits: gameState.bits,
        lifetimeBits: gameState.lifetimeBits,
        upgrades: gameState.upgrades,
        achievements: gameState.achievements.map(a => ({ id: a.id, unlocked: a.unlocked })),
        storyEvents: gameState.storyEvents.map(e => ({ id: e.id, triggered: e.triggered })),
        rootAccessLevel: gameState.rootAccessLevel,
        cryptos: gameState.cryptos,
        permanentMultiplier: gameState.permanentMultiplier,
        skillPoints: gameState.skillPoints,
        skills: gameState.skills,
        activeBoosts: gameState.activeBoosts,
        statistics: gameState.statistics,
        tutorialSeen: gameState.tutorialSeen,
        lastSaveTime: Date.now()
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));

    // Show Save Indicator
    const indicator = document.getElementById('save-indicator');
    if (indicator) {
        indicator.classList.add('visible');
        setTimeout(() => indicator.classList.remove('visible'), 2000);
    }
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
            // If save is corrupted, proceed to initialize fresh
        }
    }
    // If no save, or save corrupted, initialize fresh
    loadState(null); // Initialize fresh if no save
    return false;
}

export function hardReset() {
    if (confirm("WARNING: Are you sure you want to wipe ALL game data? This cannot be undone!")) {
        if (confirm("Double Check: Really delete everything?")) {
            localStorage.removeItem(SAVE_KEY);
            location.reload();
        }
    }
}

export function clearSave() {
    localStorage.removeItem(SAVE_KEY);
}

export function exportSave() {
    try {
        const json = JSON.stringify(getGameState());
        const b64 = btoa(json);

        const textArea = /** @type {HTMLTextAreaElement} */ (document.getElementById('save-data-area'));
        if (textArea) {
            textArea.value = b64;
            textArea.select();
            // Try to copy to clipboard automatically
            try {
                navigator.clipboard.writeText(b64).then(() => {
                    logMessage("SAVE EXPORTED: Copied to clipboard!");
                }).catch(() => {
                    logMessage("SAVE EXPORTED: Copy from the text area.");
                });
            } catch (e) {
                logMessage("SAVE EXPORTED: Copy from the text area.");
            }
        }
    } catch (e) {
        console.error("Export failed:", e);
        logMessage("ERROR: Export failed.");
    }
}

export function importSave() {
    try {
        const textArea = /** @type {HTMLTextAreaElement} */ (document.getElementById('save-data-area'));
        if (!textArea || !textArea.value) {
            logMessage("ERROR: No save data found to import.");
            return;
        }

        const b64 = textArea.value.trim();
        const json = atob(b64);
        const data = JSON.parse(json);

        // Basic Validation
        if (typeof data.bits !== 'number' || !data.upgrades) {
            throw new Error("Invalid save data format.");
        }

        if (confirm("WARNING: Importing a save will overwrite your current progress. Are you sure?")) {
            loadState(data);
            saveGame(); // Save immediately

            // Recalculate derived stats
            calculateGPS();
            calculateClickPower();

            // Re-render UI
            updateDisplay();
            renderShop(buyUpgrade);
            renderBlackMarket(buyBlackMarketItem);
            renderSkillTree(buySkill);
            renderAchievements();

            closeSettings();
            logMessage("SYSTEM RESTORED: Save imported successfully.");
            SoundManager.playSFX('success');
        }
    }
    catch (e) {
        console.error("Import failed:", e);
        logMessage("ERROR: Invalid save string.");
        SoundManager.playSFX('error');
    }
}