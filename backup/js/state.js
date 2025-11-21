import { UPGRADES, ACHIEVEMENTS } from './constants.js';

export let gameState = {};

export function initState() {
    gameState.bits = 0;
    gameState.lifetimeBits = 0;
    gameState.gps = 0;
    gameState.clickPower = 1;
    gameState.rootAccessLevel = 0;
    gameState.cryptos = 0;
    gameState.permanentMultiplier = 1;

    // Deep copy upgrades to avoid mutating the constant definition
    gameState.upgrades = JSON.parse(JSON.stringify(UPGRADES));

    // Achievements need to keep their functions, so we map them
    gameState.achievements = ACHIEVEMENTS.map(ach => ({ ...ach, unlocked: false }));

    gameState.activeBoosts = []; // Array of { multiplier, endTime }
}

export function loadState(savedData) {
    initState(); // Start with fresh state

    if (savedData) {
        gameState.bits = savedData.bits || 0;
        gameState.lifetimeBits = savedData.lifetimeBits || 0;
        gameState.rootAccessLevel = savedData.rootAccessLevel || 0;
        gameState.cryptos = savedData.cryptos || 0;
        gameState.permanentMultiplier = savedData.permanentMultiplier || 1;

        // Load Upgrades
        if (savedData.upgrades) {
            for (const key in savedData.upgrades) {
                if (gameState.upgrades[key]) {
                    gameState.upgrades[key].count = savedData.upgrades[key].count;
                    // Recalculate cost based on count
                    gameState.upgrades[key].cost = Math.ceil(UPGRADES[key].cost * Math.pow(1.15, savedData.upgrades[key].count));
                }
            }
        }

        // Load Achievements
        if (savedData.achievements) {
            savedData.achievements.forEach(savedAch => {
                const ach = gameState.achievements.find(a => a.id === savedAch.id);
                if (ach) {
                    ach.unlocked = savedAch.unlocked;
                }
            });
        }

        // Load Active Boosts
        if (savedData.activeBoosts) {
            // Filter out expired boosts
            const now = Date.now();
            gameState.activeBoosts = savedData.activeBoosts.filter(b => b.endTime > now);
        } else {
            gameState.activeBoosts = [];
        }
    }
}

export function resetStateForPrestige(newRootLevel) {
    gameState.bits = 0;
    gameState.lifetimeBits = 0;
    gameState.gps = 0;
    gameState.clickPower = 1;
    gameState.rootAccessLevel = newRootLevel;
    // Cryptos and Permanent Multiplier are NOT reset
    gameState.activeBoosts = [];


    // Reset Upgrades
    for (const key in gameState.upgrades) {
        gameState.upgrades[key].count = 0;
        gameState.upgrades[key].cost = UPGRADES[key].cost;
    }

    // Achievements are NOT reset on prestige usually, but in this code they weren't explicitly reset either.
    // The original code said: "WARNING: This will reset your Bits and Upgrades, but keep Achievements and Root Access."
    // So we do NOT reset achievements here.
}
