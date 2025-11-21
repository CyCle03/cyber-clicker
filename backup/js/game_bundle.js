
/* ==========================================
   BUNDLE GENERATED FOR FILE PROTOCOL SUPPORT
   ========================================== */

/* ---------------- constants.js ---------------- */
const UPGRADES = {
    script: { id: 'script', name: 'Script Kiddie', cost: 15, gps: 0.5, count: 0, desc: 'Automated ping scripts.' },
    bot: { id: 'bot', name: 'Zombie Bot', cost: 100, gps: 5, count: 0, desc: 'Infected IoT device.' },
    server: { id: 'server', name: 'Server Farm', cost: 1100, gps: 40, count: 0, desc: 'Dedicated hashing power.' },
    ai: { id: 'ai', name: 'Neural Net', cost: 12000, gps: 250, count: 0, desc: 'Self-learning algorithm.' },
    quantum: { id: 'quantum', name: 'Quantum Server', cost: 130000, gps: 1500, count: 0, desc: 'Entangled processing units.' },
    overlord: { id: 'overlord', name: 'AI Overlord', cost: 1400000, gps: 10000, count: 0, desc: 'Sentient network controller.' }
};

const BLACK_MARKET_ITEMS = {
    boost: { id: 'boost', name: 'Signal Boost', cost: 5, desc: '+100% GPS for 30s', type: 'consumable', duration: 30000, multiplier: 2 },
    core: { id: 'core', name: 'Quantum Core', cost: 50, desc: '+10% GPS Permanently', type: 'permanent', multiplier: 0.1 },
    warp: { id: 'warp', name: 'Time Warp', cost: 20, desc: 'Instant 1 Hour GPS', type: 'instant', hours: 1 }
};

const GLITCH_CONFIG = {
    minSpawnTime: 60000, // 60s
    maxSpawnTime: 180000, // 180s
    duration: 10000, // 10s
    minReward: 1,
    maxReward: 5
};

const ACHIEVEMENTS = [
    { id: 'hello_world', name: 'Hello World', desc: 'Accumulate 10 Bits', condition: (s) => s.lifetimeBits >= 10, unlocked: false },
    { id: 'script_kiddie', name: 'Script Kiddie', desc: 'Buy your first upgrade', condition: (s) => s.upgrades.script.count >= 1, unlocked: false },
    { id: 'serious_business', name: 'Serious Business', desc: 'Accumulate 1,000 Bits', condition: (s) => s.lifetimeBits >= 1000, unlocked: false },
    { id: 'botnet_master', name: 'Botnet Master', desc: 'Own 10 Zombie Bots', condition: (s) => s.upgrades.bot.count >= 10, unlocked: false },
    { id: 'millionaire', name: 'Millionaire', desc: 'Accumulate 1,000,000 Bits', condition: (s) => s.lifetimeBits >= 1000000, unlocked: false },
    { id: 'billionaire', name: 'Billionaire', desc: 'Accumulate 1,000,000,000 Bits', condition: (s) => s.lifetimeBits >= 1000000000, unlocked: false },
    { id: 'crypto_miner', name: 'Crypto Miner', desc: 'Find 10 Cryptos', condition: (s) => s.cryptos >= 10, unlocked: false },
    { id: 'hacker_elite', name: 'Hacker Elite', desc: 'Reach Root Access Level 5', condition: (s) => s.rootAccessLevel >= 5, unlocked: false }
];

/* ---------------- state.js ---------------- */
let gameState = {};

function initState() {
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

function loadState(savedData) {
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

function resetStateForPrestige(newRootLevel) {
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
}

/* ---------------- ui.js ---------------- */
// DOM Elements
let bitsDisplay, gpsDisplay, cryptoDisplay, shopContainer, blackMarketContainer, gameLog, achievementsContainer, rebootButton, hackButton;

function initUI() {
    bitsDisplay = document.getElementById('bits-display');
    gpsDisplay = document.getElementById('gps-display');
    cryptoDisplay = document.getElementById('crypto-display');
    shopContainer = document.getElementById('shop-container');
    blackMarketContainer = document.getElementById('black-market-container');
    gameLog = document.getElementById('game-log');
    achievementsContainer = document.getElementById('achievements-container');
    rebootButton = document.getElementById('reboot-button');
    hackButton = document.getElementById('hack-button');

    if (!hackButton) { console.error("UI: Hack button not found!"); logMessage("ERROR: Hack button not found!"); }
    if (!bitsDisplay) { console.error("UI: Bits display not found!"); logMessage("ERROR: Bits display not found!"); }
    else { logMessage("DEBUG: Bits display found."); }

    // Tab Logic
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // Deactivate all tabs
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

            // Activate clicked tab
            btn.classList.add('active');
            const tabId = `tab-${btn.dataset.tab}`;
            const tabPane = document.getElementById(tabId);
            if (tabPane) {
                tabPane.classList.add('active');
            } else {
                console.error(`Tab pane not found: ${tabId}`);
            }
        });
    });
}

function formatNumber(num) {
    return Math.floor(num).toLocaleString();
}

function logMessage(msg) {
    const div = document.createElement('div');
    div.className = 'log-entry';
    div.innerText = `> ${msg}`;
    gameLog.prepend(div);

    if (gameLog.children.length > 20) {
        gameLog.lastElementChild.remove();
    }
}

function updateDisplay() {
    if (bitsDisplay) {
        bitsDisplay.innerText = formatNumber(gameState.bits);
    } else {
        console.error("UI: bitsDisplay is missing in updateDisplay");
    }

    if (gpsDisplay) gpsDisplay.innerText = gameState.gps.toFixed(1);
    if (cryptoDisplay) cryptoDisplay.innerText = formatNumber(gameState.cryptos);
}

function createGlitchElement(onClick) {
    const el = document.createElement('div');
    el.className = 'glitch-entity';
    el.innerText = '👾';

    // Random Position
    const x = Math.random() * (window.innerWidth - 100);
    const y = Math.random() * (window.innerHeight - 100);
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;

    el.onclick = () => {
        onClick();
        el.remove();
    };

    document.body.appendChild(el);
    return el;
}

function createFloatingText(x, y, text) {
    const el = document.createElement('div');
    el.className = 'floating-text';
    el.innerText = text;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    document.body.appendChild(el);

    setTimeout(() => el.remove(), 1000);
}

function renderShop(buyCallback) {
    shopContainer.innerHTML = '';
    for (const key in gameState.upgrades) {
        const upgrade = gameState.upgrades[key];
        const item = document.createElement('div');
        item.className = 'upgrade-item';
        item.id = `upgrade-${key}`;
        item.onclick = () => buyCallback(key);

        item.innerHTML = `
            <div class="upgrade-info">
                <h3>${upgrade.name} <span style="font-size:0.8em; color:#fff;">(x${upgrade.count})</span></h3>
                <p>${upgrade.desc} (+${upgrade.gps} GPS)</p>
            </div>
            <div class="upgrade-cost">
                ${formatNumber(upgrade.cost)} BITS
            </div>
        `;
        shopContainer.appendChild(item);
    }
    updateShopUI();
}

function renderBlackMarket(buyCallback) {
    blackMarketContainer.innerHTML = '';
    // DIRECT ACCESS TO BLACK_MARKET_ITEMS for bundle
    for (const key in BLACK_MARKET_ITEMS) {
        const item = BLACK_MARKET_ITEMS[key];
        const el = document.createElement('div');
        el.className = 'market-item';
        el.onclick = () => buyCallback(key);

        el.innerHTML = `
            <h3>${item.name}</h3>
            <p>${item.desc}</p>
            <div class="cost" style="color: var(--primary-gold); font-weight: bold; margin-top: 10px;">
                ${item.cost} CRYPTOS
            </div>
        `;
        blackMarketContainer.appendChild(el);
    }
}

function updateShopUI() {
    for (const key in gameState.upgrades) {
        const upgrade = gameState.upgrades[key];
        const el = document.getElementById(`upgrade-${key}`);
        if (el) {
            if (gameState.bits < upgrade.cost) {
                el.classList.add('disabled');
            } else {
                el.classList.remove('disabled');
            }
        }
    }
}

function renderAchievements() {
    achievementsContainer.innerHTML = '';
    gameState.achievements.forEach(ach => {
        const item = document.createElement('div');
        item.className = `achievement-item ${ach.unlocked ? 'unlocked' : ''}`;
        item.innerHTML = `
            <span class="icon">${ach.unlocked ? '🏆' : '🔒'}</span>
            <span>${ach.name}</span>
        `;
        if (ach.unlocked) {
            item.title = ach.desc;
        }
        achievementsContainer.appendChild(item);
    });
}

function showAchievementNotification(ach) {
    const el = document.createElement('div');
    el.className = 'achievement-popup';
    el.innerHTML = `
        <div class="ach-icon">🏆</div>
        <div class="ach-text">
            <div class="ach-title">${ach.name}</div>
            <div class="ach-desc">${ach.desc}</div>
        </div>
    `;
    document.body.appendChild(el);

    setTimeout(() => el.classList.add('show'), 10);
    setTimeout(() => {
        el.classList.remove('show');
        setTimeout(() => el.remove(), 500);
    }, 3000);
}

function updateRebootButton(potentialLevel) {
    if (potentialLevel > gameState.rootAccessLevel) {
        rebootButton.innerText = `REBOOT (GAIN LEVEL ${potentialLevel})`;
        rebootButton.style.opacity = 1;
    } else {
        rebootButton.innerText = `REBOOT (REQ: ${formatNumber((gameState.rootAccessLevel + 1) * (gameState.rootAccessLevel + 1) * 1000000)} BITS)`;
        rebootButton.style.opacity = 0.5;
    }
}

function flashBitsDisplay() {
    const originalColor = bitsDisplay.style.color;
    bitsDisplay.style.color = '#00ff41';
    setTimeout(() => bitsDisplay.style.color = originalColor, 200);
}

function animateHackButton() {
    hackButton.style.transform = 'scale(0.95)';
    setTimeout(() => hackButton.style.transform = 'scale(1)', 50);
}

// Create UI namespace for game.js compatibility
const UI = {
    initUI,
    logMessage,
    updateDisplay,
    createGlitchElement,
    createFloatingText,
    renderShop,
    renderBlackMarket,
    updateShopUI,
    renderAchievements,
    showAchievementNotification,
    updateRebootButton,
    flashBitsDisplay,
    animateHackButton,
    formatNumber
};

/* ---------------- storage.js ---------------- */
const SAVE_KEY = 'cyberClickerSave';

function saveGame() {
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

function loadGame() {
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

function clearSave() {
    localStorage.removeItem(SAVE_KEY);
}

/* ---------------- game.js ---------------- */
console.log("Game Bundle Loaded");

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
