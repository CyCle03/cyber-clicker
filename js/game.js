// @ts-check
import { getGameState, resetStateForPrestige } from './state.js';
import { logMessage, showAchievementNotification, renderAchievements, updateShopUI, createGlitchElement, createFloatingText, formatNumber, firewallOverlay, getFirewallInput, setFirewallInput, openSettings, closeSettings, switchMobileTab, renderBlackMarket, renderSkillTree, updateDisplay, renderShop } from './ui.js';
import { SoundManager } from './sound.js';
import { saveGame, hardReset, exportSave, importSave } from './storage.js';
import { BLACK_MARKET_ITEMS, GLITCH_CONFIG, SKILL_TREE, TUTORIAL_STEPS } from './constants.js';
import { calculatePotentialRootAccess } from './formulas.js';

/**
 * Safely update statistics field
 * @param {string} field - Statistics field name
 * @param {number|function} valueOrUpdater - Value to set or function that takes current value and returns new value
 */
function updateStatistic(field, valueOrUpdater) {
    const gameState = getGameState();
    if (!gameState || !gameState.statistics) {
        console.warn(`updateStatistic: statistics not available for field ${field}`);
        return;
    }
    
    if (typeof valueOrUpdater === 'function') {
        gameState.statistics[field] = valueOrUpdater(gameState.statistics[field] || 0);
    } else {
        gameState.statistics[field] = (gameState.statistics[field] || 0) + valueOrUpdater;
    }
}

// Tutorial Logic
let currentTutorialStep = 0;
export function showTutorial() {
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
            getGameState().tutorialSeen = true;
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
    if (typeof amount !== 'number' || isNaN(amount) || !isFinite(amount)) {
        console.error("addBits: Invalid amount", amount);
        return;
    }
    
    const gameState = getGameState();
    if (!gameState) {
        console.error("addBits: gameState is null");
        return;
    }
    
    gameState.bits = (gameState.bits || 0) + amount;
    gameState.lifetimeBits = (gameState.lifetimeBits || 0) + amount;
    updateStatistic('totalBitsEarned', amount);
    updateDisplay();
    checkUnlocks();
    checkStoryEvents();
}

export function calculateClickPower() {
    const gameState = getGameState();
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
    const gameState = getGameState();
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
    gameState.activeBoosts = gameState.activeBoosts.filter((b) => b.endTime > now); // Cleanup expired
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
    const gameState = getGameState();
    gameState.achievements.forEach(ach => {
        if (!ach.unlocked && ach.condition(gameState)) {
            ach.unlocked = true;
            gameState.cryptos += ach.reward || 0; // Award Cryptos
            SoundManager.playSFX('achievement'); // Play achievement sound
            showAchievementNotification(ach);
            logMessage(`ACHIEVEMENT UNLOCKED: ${ach.name} (+${ach.reward} CRYPTOS)`);
            renderAchievements();
            updateDisplay(); // Update Crypto display
            saveGame();
        }
    });
    updateShopUI();
}

function checkStoryEvents() {
    const gameState = getGameState();
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
    const gameState = getGameState();
    const upgrade = gameState.upgrades[/** @type {keyof typeof gameState.upgrades} */(key)];
    if (gameState.bits >= upgrade.cost) {
        gameState.bits -= upgrade.cost;
        upgrade.count++;
        upgrade.cost = Math.ceil(upgrade.cost * 1.15); // Cost scaling

        SoundManager.playSFX('buy');
        calculateGPS();
        calculateClickPower();
        updateDisplay();

        // Save scroll position before re-rendering
        const shopPane = document.getElementById('tab-shop');
        const scrollPos = shopPane ? shopPane.scrollTop : 0;

        renderShop(buyUpgrade); // Re-render to update costs and counts

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
    const gameState = getGameState();
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
        updateDisplay();
        renderBlackMarket(buyBlackMarketItem);
        saveGame();
    } else {
        SoundManager.playSFX('error');
        logMessage("Insufficient Cryptos.");
    }
}

/** @param {string} skillId */
export function buySkill(skillId) {
    const gameState = getGameState();
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

        SoundManager.playSFX('buy');

        calculateGPS();
        calculateClickPower();
        updateDisplay();
        renderSkillTree(buySkill);
        saveGame();
        logMessage(`Skill Acquired: ${skill.name}`);
    } else {
        SoundManager.playSFX('error');
        logMessage("Insufficient Skill Points.");
    }
}

// Prestige System
export function rebootSystem() {
    const gameState = getGameState();
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
export function spawnGlitch() {
    const time = Math.random() * (GLITCH_CONFIG.maxSpawnTime - GLITCH_CONFIG.minSpawnTime) + GLITCH_CONFIG.minSpawnTime;
    setTimeout(() => {
        const glitchEl = createGlitchElement(handleGlitchClick);

        if (getGameState().autoGlitchEnabled && Math.random() < 0.5) {
            setTimeout(() => {
                if (glitchEl.parentNode) {
                    handleGlitchClick();
                    glitchEl.remove();
                    logMessage("Auto-Glitch Bot collected the glitch!");
                    spawnGlitch(); 
                }
            }, 100 + Math.random() * 400);
        } else {
            setTimeout(() => {
                if (glitchEl.parentNode) {
                    glitchEl.remove();
                    logMessage("Glitch signal lost...");
                    spawnGlitch();
                }
            }, GLITCH_CONFIG.duration);
        }

    }, time);
}

function handleGlitchClick() {
    const gameState = getGameState();
    const baseReward = Math.floor(Math.random() * (GLITCH_CONFIG.maxReward - GLITCH_CONFIG.minReward + 1)) + GLITCH_CONFIG.minReward;
    const cryptoMagnetBonus = gameState.skills.crypto_magnet || 0;
    const reward = baseReward + cryptoMagnetBonus;

    gameState.cryptos += reward;
    updateDisplay();
    logMessage(`GLITCH HACKED! Recovered ${reward} Cryptos.`);
    createFloatingText(window.innerWidth / 2, window.innerHeight / 2, `+${reward} 🪙`);
    saveGame();
    spawnGlitch();
}

// Firewall Logic
export function spawnFirewall() {
    const gameState = getGameState();
    if (gameState.firewallActive) return;

    gameState.firewallActive = true;
    updateStatistic('firewallsEncountered', 1);
    }

    const chars = "0123456789ABCDEF";
    let code = "";
    for (let i = 0; i < 4; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    gameState.firewallCode = code;

    firewallOverlay.classList.add('visible');
    firewallCodeDisplay.innerText = code;
    getFirewallInput().value = "";

    SoundManager.playSFX('alert');
    logMessage("⚠️ WARNING: FIREWALL DETECTED! GPS REDUCED!");
    calculateGPS();
    updateDisplay();
}

export function checkFirewallInput() {
    const gameState = getGameState();
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
            checkFirewallInput();
        }
    }
}

function clearFirewall() {
    const gameState = getGameState();
    gameState.firewallActive = false;
    updateStatistic('firewallsCleared', 1);
    }

    firewallOverlay.classList.remove('visible');

    calculateGPS();
    const reward = gameState.gps * 300;
    addBits(reward);

    SoundManager.playSFX('success');
    logMessage(`FIREWALL BREACHED! REWARD: +${formatNumber(reward)} BITS`);
    updateDisplay();
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

export function initDataBreach() {
    breachOverlay = /** @type {HTMLElement} */ (document.getElementById('breach-overlay'));
    breachGrid = /** @type {HTMLElement} */ (document.getElementById('breach-grid'));
    breachTimerDisplay = /** @type {HTMLElement} */ (document.getElementById('breach-timer'));
    breachScoreDisplay = /** @type {HTMLElement} */ (document.getElementById('breach-score'));
}

export function startDataBreach() {
    if (breachActive) return;
    breachActive = true;
    breachTimeLeft = 10;
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
    const gridSize = 25;
    const dataCount = 5 + Math.floor(Math.random() * 5);
    const iceCount = 3 + Math.floor(Math.random() * 3);
    breachTotalData = dataCount;

    let nodes = Array(gridSize).fill('empty');

    let placed = 0;
    while (placed < dataCount) {
        const idx = Math.floor(Math.random() * gridSize);
        if (nodes[idx] === 'empty') {
            nodes[idx] = 'data';
            placed++;
        }
    }

    placed = 0;
    while (placed < iceCount) {
        const idx = Math.floor(Math.random() * gridSize);
        if (nodes[idx] === 'empty') {
            nodes[idx] = 'ice';
            placed++;
        }
    }

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
        breachTimeLeft -= 2.0;
        createFloatingText(node.getBoundingClientRect().left, node.getBoundingClientRect().top, "-2s");
    } else {
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
    const gameState = getGameState();
    breachActive = false;
    if(breachInterval) clearInterval(breachInterval);

    setTimeout(() => {
        if (breachOverlay) breachOverlay.classList.add('hidden');
        if (success) {
            const reward = gameState.gps * 60 * 5;
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
window.hardReset = hardReset;
window.openSettings = openSettings;
window.closeSettings = closeSettings;
window.toggleMute = SoundManager.toggleMute;
window.exportSave = exportSave;
window.importSave = importSave;
window.switchMobileTab = switchMobileTab;
window.startDataBreach = startDataBreach;