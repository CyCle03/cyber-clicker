// @ts-check
import { gameState, resetStateForPrestige } from './state.js';
import { logMessage, showAchievementNotification, renderAchievements, updateShopUI, createGlitchElement, createFloatingText, formatNumber, firewallOverlay, firewallInput } from './ui.js';
import { SoundManager } from './sound.js';
import { saveGame } from './storage.js';
import { BLACK_MARKET_ITEMS, GLITCH_CONFIG, SKILL_TREE, TUTORIAL_STEPS } from './constants.js';
import * as UI from './ui.js';

// Tutorial Logic
let currentTutorialStep = 0;
function showTutorial() {
    const overlay = document.getElementById('tutorial-overlay');
    const content = document.getElementById('tutorial-content');
    const nextBtn = document.getElementById('tutorial-next-btn');

    if (!overlay || !content || !nextBtn) return;

    currentTutorialStep = 0;
    updateTutorialStep();
    overlay.classList.add('visible');

    nextBtn.onclick = () => {
        currentTutorialStep++;
        if (currentTutorialStep < TUTORIAL_STEPS.length) {
            updateTutorialStep();
        } else {
            overlay.classList.remove('visible');
            gameState.tutorialSeen = true;
            saveGame();
        }
    };
}

function updateTutorialStep() {
    const content = document.getElementById('tutorial-content');
    const nextBtn = document.getElementById('tutorial-next-btn');

    if (!content || !nextBtn) return;

    content.innerHTML = TUTORIAL_STEPS[currentTutorialStep].text;
    nextBtn.innerText = currentTutorialStep === TUTORIAL_STEPS.length - 1 ? "CLOSE" : "NEXT";
}

// Core Functions
/** @param {number} amount */
export function addBits(amount) {
    // UI.logMessage(`DEBUG: addBits called with ${amount}`);
    gameState.bits += amount;
    gameState.lifetimeBits += amount;
    if (gameState && gameState.statistics) {
        gameState.statistics.totalBitsEarned += amount;
    }
    UI.updateDisplay();
    checkUnlocks();
    checkStoryEvents();
}

// Helper functions for upgrade information
/** @param {string} upgradeKey */
export function calculateGPSContribution(upgradeKey) {
    const upgrade = gameState.upgrades[upgradeKey];
    const contribution = upgrade.gps * upgrade.count;
    const percentage = gameState.gps > 0 ? (contribution / gameState.gps) * 100 : 0;
    return { contribution, percentage };
}

/** @param {any} upgrade */
export function calculateEfficiency(upgrade) {
    if (upgrade.gps === 0) return Infinity; // Click upgrades have no GPS efficiency
    return upgrade.cost / upgrade.gps; // Lower is better
}

/** @param {number} efficiency */
export function getEfficiencyRating(efficiency) {
    if (efficiency === Infinity) return { text: 'N/A', class: 'neutral' };
    if (efficiency < 500) return { text: 'Excellent', class: 'excellent' };
    if (efficiency < 2000) return { text: 'Good', class: 'good' };
    if (efficiency < 10000) return { text: 'Fair', class: 'fair' };
    return { text: 'Poor', class: 'poor' };
}



export function calculateClickPower() {
    let power = 1; // Base power
    for (const key in gameState.upgrades) {
        const upgrade = gameState.upgrades[key];
        if (upgrade.click) {
            power += upgrade.click * upgrade.count;
        }
    }

    // Apply active click boost multipliers
    const now = Date.now();
    gameState.activeClickBoosts = gameState.activeClickBoosts.filter(b => b.endTime > now);
    for (const boost of gameState.activeClickBoosts) {
        power *= boost.clickMultiplier;
    }

    gameState.clickPower = power;
}

export function calculateGPS() {
    let gps = 0;
    for (const key in gameState.upgrades) {
        const upgrade = gameState.upgrades[key];
        if (upgrade.gps) {
            gps += upgrade.gps * upgrade.count;
        }
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
    gameState.activeBoosts = gameState.activeBoosts.filter(/** @type {any} */(b) => b.endTime > now); // Cleanup expired
    gameState.activeBoosts.forEach(b => {
        boostMultiplier *= b.multiplier;
    });
    gps *= boostMultiplier;

    // Firewall Penalty
    if (gameState.firewallActive) {
        gps *= 0.5;
    }

    gameState.gps = gps;
}

function checkUnlocks() {
    gameState.achievements.forEach(ach => {
        if (!ach.unlocked && ach.condition(gameState)) {
            ach.unlocked = true;
            gameState.cryptos += ach.reward || 0; // Award Cryptos
            SoundManager.playSFX('achievement'); // Play achievement sound
            showAchievementNotification(ach);
            logMessage(`ACHIEVEMENT UNLOCKED: ${ach.name} (+${ach.reward} CRYPTOS)`);
            renderAchievements();
            UI.updateDisplay(); // Update Crypto display
            saveGame();
        }
    });
    updateShopUI();
}

function checkStoryEvents() {
    gameState.storyEvents.forEach(evt => {
        if (!evt.triggered && evt.condition(gameState)) {
            evt.triggered = true;
            logMessage(`[STORY] ${evt.message}`);
            saveGame();
        }
    });
}

/** @param {string} key */
export function buyUpgrade(key) {
    const upgrade = gameState.upgrades[/** @type {keyof typeof gameState.upgrades} */(key)];
    if (gameState.bits >= upgrade.cost) {
        gameState.bits -= upgrade.cost;
        upgrade.count++;
        upgrade.cost = Math.ceil(upgrade.cost * 1.15); // Cost scaling

        SoundManager.playSFX('buy');
        calculateGPS();
        calculateClickPower();
        UI.updateDisplay();

        // Save scroll position before re-rendering
        const shopPane = document.getElementById('tab-shop');
        const scrollPos = shopPane ? shopPane.scrollTop : 0;

        UI.renderShop(buyUpgrade); // Re-render to update costs and counts

        // Restore scroll position after re-rendering
        if (shopPane) {
            shopPane.scrollTop = scrollPos;
        }

        saveGame(); // Auto-save on purchase
        logMessage(`System upgraded: ${upgrade.name}`);
    } else {
        SoundManager.playSFX('error');
        logMessage("Insufficient funds.");
    }
}

/** @param {string} key */
export function buyBlackMarketItem(key) {
    const item = BLACK_MARKET_ITEMS[/** @type {keyof typeof BLACK_MARKET_ITEMS} */(key)];
    if (gameState.cryptos >= item.cost) {
        gameState.cryptos -= item.cost;

        if (item.type === 'consumable') {
            const consumable = /** @type {any} */ (item);
            // Handle click multiplier separately
            if (consumable.clickMultiplier) {
                gameState.activeClickBoosts.push({
                    clickMultiplier: consumable.clickMultiplier,
                    endTime: Date.now() + consumable.duration
                });
                logMessage(`ACTIVATED: ${item.name} - Click power boosted!`);
            } else {
                // GPS boost
                gameState.activeBoosts.push({
                    multiplier: consumable.multiplier,
                    endTime: Date.now() + consumable.duration
                });
                logMessage(`ACTIVATED: ${item.name}`);
            }
        } else if (item.type === 'permanent') {
            const permanent = /** @type {any} */ (item);
            // Special handling for auto-glitch bot
            if (item.id === 'autoGlitch') {
                gameState.autoGlitchEnabled = true;
                logMessage(`UPGRADED: ${item.name} - Glitches will be auto-collected!`);
            } else if (item.id === 'offlineBoost') {
                gameState.offlineMultiplier += permanent.offlineMultiplier;
                logMessage(`UPGRADED: ${item.name} - Offline earnings increased!`);
            } else {
                gameState.permanentMultiplier += permanent.multiplier;
                logMessage(`UPGRADED: ${item.name}`);
            }
        } else if (item.type === 'instant') {
            const instant = /** @type {any} */ (item);
            const reward = gameState.gps * 3600 * instant.hours;
            addBits(reward);
            logMessage(`WARPED TIME: +${formatNumber(reward)} Bits`);
        }

        calculateGPS();
        UI.updateDisplay();
        UI.renderBlackMarket(buyBlackMarketItem);
        saveGame();
    } else {
        SoundManager.playSFX('error');
        logMessage("Insufficient Cryptos.");
    }
}

/** @param {string} skillId */
export function buySkill(skillId) {
    const skill = SKILL_TREE[/** @type {keyof typeof SKILL_TREE} */(skillId)];
    if (!skill) return;

    const currentLevel = gameState.skills[skillId] || 0;
    if (currentLevel >= skill.maxLevel) {
        logMessage("Skill already maxed.");
        return;
    }

    if (gameState.skillPoints >= skill.cost) {
        gameState.skillPoints -= skill.cost;
        gameState.skills[skillId] = currentLevel + 1;

        // Apply immediate effects if any logic requires it
        // Most effects are calculated continuously (GPS, Click Power)

        SoundManager.playSFX('buy');

        calculateGPS();
        calculateClickPower();
        UI.updateDisplay();
        UI.renderSkillTree(buySkill);
        saveGame();
        logMessage(`Skill Acquired: ${skill.name}`);
    } else {
        SoundManager.playSFX('error');
        logMessage("Insufficient Skill Points.");
    }
}

// Prestige System
export function calculatePotentialRootAccess() {
    // Exponential scaling: Each level requires 10x more bits than the previous tier
    // Level 1: 10M bits
    // Level 2: 31.6M bits  
    // Level 3: 100M bits
    // Level 4: 316M bits
    // Level 5: 1B bits
    // Minimum requirement increased to 10M for better game pacing
    if (gameState.lifetimeBits < 10000000) return 0;

    // Apply Prestige Master skill to reduce requirements
    const prestigeMasterLevel = gameState.skills.prestige_master || 0;
    const reductionMultiplier = 1 - (prestigeMasterLevel * 0.1); // 10% reduction per level
    const adjustedBits = gameState.lifetimeBits / reductionMultiplier;

    return Math.floor(Math.log10(adjustedBits / 10000000) * 5);
}

export function rebootSystem() {
    const potentialLevel = calculatePotentialRootAccess();
    if (potentialLevel > gameState.rootAccessLevel) {
        const cryptosGained = potentialLevel - gameState.rootAccessLevel;
        if (confirm(`SYSTEM REBOOT REQUIRED.\n\nGain Root Access Level ${potentialLevel}?\n(Current: ${gameState.rootAccessLevel})\n\nREWARD: ${cryptosGained} CRYPTOS\n\nWARNING: This will reset your Bits and Upgrades, but keep Achievements, Cryptos, and Root Access.`)) {
            gameState.cryptos += cryptosGained;
            if (gameState.statistics) {
                gameState.statistics.rebootCount++;
            }
            resetStateForPrestige(potentialLevel);
            SoundManager.playSFX('reboot');
            saveGame();
            location.reload();
            logMessage(`SYSTEM REBOOTED. ROOT ACCESS: LEVEL ${gameState.rootAccessLevel}`);
            logMessage(`REWARD: +${cryptosGained} CRYPTOS`);
        }
    } else {
        logMessage("Insufficient data for reboot.");
    }
}

// Glitch System
function spawnGlitch() {
    const time = Math.random() * (GLITCH_CONFIG.maxSpawnTime - GLITCH_CONFIG.minSpawnTime) + GLITCH_CONFIG.minSpawnTime;
    setTimeout(() => {
        const glitchEl = createGlitchElement(handleGlitchClick);

        // Auto-glitch bot logic
        if (gameState.autoGlitchEnabled && Math.random() < 0.5) {
            // Auto-click after a small delay for visual effect
            setTimeout(() => {
                if (glitchEl.parentNode) {
                    handleGlitchClick();
                    glitchEl.remove();
                    logMessage("Auto-Glitch Bot collected the glitch!");
                    spawnGlitch(); // Schedule next one
                }
            }, 100 + Math.random() * 400);
        } else {
            // Despawn after duration if not auto-collected
            setTimeout(() => {
                if (glitchEl.parentNode) {
                    glitchEl.remove();
                    logMessage("Glitch signal lost...");
                    spawnGlitch(); // Schedule next one even if missed
                }
            }, GLITCH_CONFIG.duration);
        }

    }, time);
}

function handleGlitchClick() {
    const baseReward = Math.floor(Math.random() * (GLITCH_CONFIG.maxReward - GLITCH_CONFIG.minReward + 1)) + GLITCH_CONFIG.minReward;
    // Apply Crypto Magnet skill bonus
    const cryptoMagnetBonus = gameState.skills.crypto_magnet || 0;
    const reward = baseReward + cryptoMagnetBonus;

    gameState.cryptos += reward;
    UI.updateDisplay();
    logMessage(`GLITCH HACKED! Recovered ${reward} Cryptos.`);
    createFloatingText(window.innerWidth / 2, window.innerHeight / 2, `+${reward} 🪙`);
    saveGame();
    spawnGlitch(); // Schedule next one
}

// Firewall Logic
function spawnFirewall() {
    if (gameState.firewallActive) return;

    gameState.firewallActive = true;
    if (gameState && gameState.statistics) {
        gameState.statistics.firewallsEncountered++;
    }

    // Generate Random Hex Code (4 chars)
    const chars = "0123456789ABCDEF";
    let code = "";
    for (let i = 0; i < 4; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    gameState.firewallCode = code;

    firewallOverlay.classList.add('visible');
    UI.firewallCodeDisplay.innerText = code;
    firewallInput.value = "";
    // firewallInput.focus(); // Removed to prevent mobile keyboard popup

    SoundManager.playSFX('alert');
    logMessage("⚠️ WARNING: FIREWALL DETECTED! GPS REDUCED!");
    calculateGPS();
    UI.updateDisplay();
}

function checkFirewallInput() {
    if (!gameState.firewallActive) return;

    const input = /** @type {HTMLInputElement} */ (document.getElementById('firewall-input'));
    if (input) {
        if (input.value.toUpperCase() === gameState.firewallCode) {
            clearFirewall();
            input.value = "";
        } else {
            input.style.borderColor = 'red';
            setTimeout(() => input.style.borderColor = 'var(--primary-cyan)', 500);
            SoundManager.playSFX('error');
        }
    }
}

/** @param {string} key */
export function handleKeypadInput(key) {
    const input = /** @type {HTMLInputElement} */ (document.getElementById('firewall-input'));
    if (!input) return;

    if (key === 'CLR') {
        input.value = "";
    } else if (key === 'OK') {
        checkFirewallInput();
    } else {
        if (input.value.length < 4) {
            input.value += key;
            checkFirewallInput(); // Check immediately on input
        }
    }
}

function clearFirewall() {
    gameState.firewallActive = false;
    if (gameState.statistics) {
        gameState.statistics.firewallsCleared++;
    }

    firewallOverlay.classList.remove('visible');

    // Reward: 5 minutes of UNMUTE GPS
    // We need to recalculate GPS first to remove the penalty
    calculateGPS();
    const reward = gameState.gps * 300;
    addBits(reward);

    SoundManager.playSFX('success');
    logMessage(`FIREWALL BREACHED! REWARD: +${formatNumber(reward)} BITS`);
    UI.updateDisplay();
}

// Data Breach Mini-game
/** @type {HTMLElement} */
let breachOverlay;
/** @type {HTMLElement} */
let breachGrid;
/** @type {HTMLElement} */
let breachTimerDisplay;
/** @type {HTMLElement} */
let breachScoreDisplay;

/** @type {number|undefined} */
let breachInterval;
let breachTimeLeft = 0;
let breachScore = 0;
let breachTotalData = 0;
let breachActive = false;

export function startDataBreach() {
    if (breachActive) return;
    breachActive = true;
    breachTimeLeft = 10; // 10 seconds
    breachScore = 0;
    breachTotalData = 0;

    if (breachOverlay) breachOverlay.classList.remove('hidden');
    generateBreachGrid();
    updateBreachUI();

    breachInterval = window.setInterval(() => {
        breachTimeLeft -= 0.1;
        if (breachTimeLeft <= 0) {
            endDataBreach(false);
        }
        updateBreachUI();
    }, 100);
}

function generateBreachGrid() {
    if (!breachGrid) return;
    breachGrid.innerHTML = '';
    const gridSize = 25; // 5x5
    const dataCount = 5 + Math.floor(Math.random() * 5); // 5-10 data nodes
    const iceCount = 3 + Math.floor(Math.random() * 3); // 3-5 ICE nodes
    breachTotalData = dataCount;

    let nodes = Array(gridSize).fill('empty');

    // Place Data
    let placed = 0;
    while (placed < dataCount) {
        const idx = Math.floor(Math.random() * gridSize);
        if (nodes[idx] === 'empty') {
            nodes[idx] = 'data';
            placed++;
        }
    }

    // Place ICE
    placed = 0;
    while (placed < iceCount) {
        const idx = Math.floor(Math.random() * gridSize);
        if (nodes[idx] === 'empty') {
            nodes[idx] = 'ice';
            placed++;
        }
    }

    // Render Grid
    nodes.forEach((type, index) => {
        const node = document.createElement('div');
        node.className = `breach-node ${type}`;
        node.dataset.type = type;
        node.dataset.index = String(index);
        node.onclick = () => handleNodeClick(node, type);
        breachGrid.appendChild(node);
    });
}

/**
 * @param {HTMLElement} node 
 * @param {string} type 
 */
function handleNodeClick(node, type) {
    if (!breachActive || node.classList.contains('hacked') || node.classList.contains('revealed')) return;

    if (type === 'data') {
        node.classList.add('revealed', 'hacked');
        node.innerText = '1';
        breachScore++;
        SoundManager.playSFX('typing');

        if (breachScore >= breachTotalData) {
            endDataBreach(true);
        }
    } else if (type === 'ice') {
        node.classList.add('revealed');
        node.innerText = 'X';
        SoundManager.playSFX('error');
        breachTimeLeft -= 2.0; // Penalty
        createFloatingText(node.getBoundingClientRect().left, node.getBoundingClientRect().top, "-2s");
    } else {
        // Empty
        node.classList.add('revealed');
    }
    updateBreachUI();
}

function updateBreachUI() {
    if (breachTimerDisplay) breachTimerDisplay.innerText = `TIME: ${Math.max(0, breachTimeLeft).toFixed(1)}s`;
    if (breachScoreDisplay) breachScoreDisplay.innerText = `DATA: ${breachScore}/${breachTotalData}`;
}

/**
 * @param {boolean} success 
 */
function endDataBreach(success) {
    breachActive = false;
    if(breachInterval) clearInterval(breachInterval);

    setTimeout(() => {
        if (breachOverlay) breachOverlay.classList.add('hidden');
        if (success) {
            const reward = gameState.gps * 60 * 5; // 5 minutes of GPS
            addBits(reward);
            logMessage(`BREACH SUCCESSFUL! Stolen Data Value: ${formatNumber(reward)} Bits`);
            SoundManager.playSFX('success');
        } else {
            logMessage(`BREACH FAILED. Connection Terminated.`);
            SoundManager.playSFX('error');
        }
    }, 1000);
}

// Expose functions to the global scope for HTML onclick handlers
window.handleKeypadInput = handleKeypadInput;
window.hardReset = UI.hardReset;
window.openSettings = UI.openSettings;
window.closeSettings = UI.closeSettings;
window.toggleMute = SoundManager.toggleMute;
window.exportSave = UI.exportSave;
window.importSave = UI.importSave;
window.switchMobileTab = UI.switchMobileTab;
window.startDataBreach = startDataBreach;
