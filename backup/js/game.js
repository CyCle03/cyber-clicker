import { gameState, resetStateForPrestige } from './state.js';
import { saveGame, loadGame } from './storage.js';
import * as UI from './ui.js';
import { GLITCH_CONFIG, BLACK_MARKET_ITEMS } from './constants.js';

console.log("Game.js loaded");

// Core Functions
function addBits(amount) {
    // UI.logMessage(`DEBUG: addBits called with ${amount}`);
    gameState.bits += amount;
    gameState.lifetimeBits += amount;
    UI.updateDisplay();
    checkUnlocks();
}

function calculateGPS() {
    let gps = 0;
    for (const key in gameState.upgrades) {
        const upgrade = gameState.upgrades[key];
        gps += upgrade.gps * upgrade.count;
    }

    // Prestige Bonus: +10% per Root Access Level
    if (gameState.rootAccessLevel > 0) {
        gps *= (1 + gameState.rootAccessLevel * 0.1);
    }

    // Permanent Multiplier (Quantum Cores)
    if (gameState.permanentMultiplier > 1) {
        gps *= gameState.permanentMultiplier;
    }

    // Temporary Boosts
    const now = Date.now();
    let boostMultiplier = 1;
    gameState.activeBoosts = gameState.activeBoosts.filter(b => b.endTime > now); // Cleanup expired
    gameState.activeBoosts.forEach(b => {
        boostMultiplier *= b.multiplier;
    });
    gps *= boostMultiplier;

    gameState.gps = gps;
}

function checkUnlocks() {
    gameState.achievements.forEach(ach => {
        if (!ach.unlocked && ach.condition(gameState)) {
            ach.unlocked = true;
            UI.showAchievementNotification(ach);
            UI.logMessage(`ACHIEVEMENT UNLOCKED: ${ach.name}`);
            UI.renderAchievements();
            saveGame();
        }
    });
    UI.updateShopUI();
}

function buyUpgrade(key) {
    const upgrade = gameState.upgrades[key];
    if (gameState.bits >= upgrade.cost) {
        gameState.bits -= upgrade.cost;
        upgrade.count++;
        upgrade.cost = Math.ceil(upgrade.cost * 1.15); // Cost scaling

        calculateGPS();
        UI.updateDisplay();
        UI.renderShop(buyUpgrade); // Re-render to update costs and counts
        saveGame(); // Auto-save on purchase
        UI.logMessage(`System upgraded: ${upgrade.name}`);
    } else {
        UI.logMessage("Insufficient funds.");
    }
}

function buyBlackMarketItem(key) {
    const item = BLACK_MARKET_ITEMS[key];
    if (gameState.cryptos >= item.cost) {
        gameState.cryptos -= item.cost;

        if (item.type === 'consumable') {
            gameState.activeBoosts.push({
                multiplier: item.multiplier,
                endTime: Date.now() + item.duration
            });
            UI.logMessage(`ACTIVATED: ${item.name}`);
        } else if (item.type === 'permanent') {
            gameState.permanentMultiplier += item.multiplier;
            UI.logMessage(`UPGRADED: ${item.name}`);
        } else if (item.type === 'instant') {
            // Calculate potential earnings for X hours
            // We need base GPS without temporary boosts for fairness, or maybe with?
            // Let's use current GPS for maximum fun.
            const reward = gameState.gps * 3600 * item.hours;
            addBits(reward);
            UI.logMessage(`WARPED TIME: +${UI.formatNumber(reward)} Bits`);
        }

        calculateGPS();
        UI.updateDisplay();
        UI.renderBlackMarket(buyBlackMarketItem);
        saveGame();
    } else {
        UI.logMessage("Insufficient Cryptos.");
    }
}

// Prestige System
function calculatePotentialRootAccess() {
    return Math.floor(Math.sqrt(gameState.lifetimeBits / 1000000));
}

function rebootSystem() {
    const potentialLevel = calculatePotentialRootAccess();
    if (potentialLevel > gameState.rootAccessLevel) {
        if (confirm(`SYSTEM REBOOT REQUIRED.\n\nGain Root Access Level ${potentialLevel}?\n(Current: ${gameState.rootAccessLevel})\n\nWARNING: This will reset your Bits and Upgrades, but keep Achievements and Root Access.`)) {
            resetStateForPrestige(potentialLevel);
            saveGame();
            init(); // Re-init UI
            UI.logMessage(`SYSTEM REBOOTED. ROOT ACCESS: LEVEL ${gameState.rootAccessLevel}`);
        }
    } else {
        UI.logMessage("Insufficient data for reboot.");
    }
}

// Event Listeners moved to init()

// ... (existing imports)

// ... (existing functions)

// Glitch System
function spawnGlitch() {
    const time = Math.random() * (GLITCH_CONFIG.maxSpawnTime - GLITCH_CONFIG.minSpawnTime) + GLITCH_CONFIG.minSpawnTime;
    setTimeout(() => {
        const glitchEl = UI.createGlitchElement(handleGlitchClick);

        // Despawn after duration
        setTimeout(() => {
            if (glitchEl.parentNode) {
                glitchEl.remove();
                UI.logMessage("Glitch signal lost...");
                spawnGlitch(); // Schedule next one even if missed
            }
        }, GLITCH_CONFIG.duration);

    }, time);
}

function handleGlitchClick() {
    const reward = Math.floor(Math.random() * (GLITCH_CONFIG.maxReward - GLITCH_CONFIG.minReward + 1)) + GLITCH_CONFIG.minReward;
    gameState.cryptos += reward;
    UI.updateDisplay();
    UI.logMessage(`GLITCH HACKED! Recovered ${reward} Cryptos.`);
    UI.createFloatingText(window.innerWidth / 2, window.innerHeight / 2, `+${reward} 🪙`);
    saveGame();
    spawnGlitch(); // Schedule next one
}

// ... (existing event listeners)



// Initialization
function init() {
    try {
        // Global Error Handler for debugging
        window.addEventListener('error', (e) => {
            if (UI && UI.logMessage) {
                UI.logMessage(`ERROR: ${e.message}`);
            }
        });

        UI.logMessage("DEBUG: Starting init...");
        UI.initUI(); // Initialize UI elements first
        UI.logMessage("DEBUG: UI Initialized");

        const loaded = loadGame();
        if (loaded) {
            calculateGPS();
            UI.logMessage("Save data loaded.");
        } else {
            UI.logMessage("Connection established.");
        }

        UI.logMessage(`DEBUG: Upgrades count: ${Object.keys(gameState.upgrades || {}).length}`);
        UI.renderShop(buyUpgrade);
        UI.renderBlackMarket(buyBlackMarketItem);
        UI.renderAchievements();
        UI.updateDisplay();

        // Update Reboot Button Text periodically
        setInterval(() => {
            const potential = calculatePotentialRootAccess();
            UI.updateRebootButton(potential);
        }, 1000);

        // Start Glitch System
        spawnGlitch();

        // Event Listeners
        const hackBtn = document.getElementById('hack-button');
        if (hackBtn) {
            hackBtn.addEventListener('click', (e) => {
                try {
                    addBits(gameState.clickPower);
                    UI.createFloatingText(e.clientX, e.clientY, `+${gameState.clickPower}`);
                    UI.animateHackButton();
                } catch (err) {
                    UI.logMessage(`CLICK ERROR: ${err.message}`);
                }
            });
            UI.logMessage("DEBUG: Hack button listener attached");
        } else {
            console.error("Hack button not found!");
            UI.logMessage("ERROR: Hack button not found!");
        }

        const rebootBtn = document.getElementById('reboot-button');
        if (rebootBtn) {
            rebootBtn.addEventListener('click', rebootSystem);
        }

        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                saveGame();
                UI.logMessage("Game saved manually.");
                UI.flashBitsDisplay();
            }
        });

        // Game Loop
        setInterval(() => {
            if (gameState.gps > 0) {
                addBits(gameState.gps / 10);
            }
        }, 100);

        // Auto-Save
        setInterval(() => {
            saveGame();
        }, 30000);

        UI.logMessage("DEBUG: Init complete");

    } catch (e) {
        console.error("Init Error:", e);
        if (UI && UI.logMessage) UI.logMessage(`INIT FATAL: ${e.message}`);
    }
}

// Start the game
window.addEventListener('load', init);
