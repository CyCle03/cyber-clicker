/* ==========================================
   CYBER CLICKER - MAIN SCRIPT
   ========================================== */

/* ---------------- constants.js ---------------- */
const UPGRADES = {
    clicker: { id: 'clicker', name: "Mech Switch", cost: 30, gps: 0, click: 1, count: 0, desc: "Mechanical switches for tactile feedback." },
    autoClicker: { id: 'autoClicker', name: "Auto-Clicker", cost: 15, gps: 0.1, click: 0, count: 0, desc: "Basic script to automate clicking." },
    bot: { id: 'bot', name: "Script Bot", cost: 100, gps: 1, click: 0, count: 0, desc: "Simple bot to farm bits." },
    server: { id: 'server', name: "Home Server", cost: 1100, gps: 8, click: 0, count: 0, desc: "Dedicated server for processing." },
    farm: { id: 'farm', name: "Server Farm", cost: 12000, gps: 47, click: 0, count: 0, desc: "Rack of servers working in parallel." },
    ai: { id: 'ai', name: "Weak AI", cost: 130000, gps: 260, click: 0, count: 0, desc: "Learning algorithm to optimize mining." },
    quantum: { id: 'quantum', name: "Quantum Core", cost: 1400000, gps: 1400, click: 0, count: 0, desc: "Entangled bits for instant processing." },
    overlord: { id: 'overlord', name: 'AI Overlord', cost: 1400000, gps: 10000, click: 0, count: 0, desc: 'Sentient network controller.' }
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
    { id: 'hello_world', name: 'Hello World', desc: 'Accumulate 10 Bits', condition: (s) => s.lifetimeBits >= 10, unlocked: false, reward: 1 },
    { id: 'script_kiddie', name: 'Script Kiddie', desc: 'Buy your first upgrade', condition: (s) => s.upgrades.autoClicker.count >= 1, unlocked: false, reward: 2 },
    { id: 'serious_business', name: 'Serious Business', desc: 'Accumulate 1,000 Bits', condition: (s) => s.lifetimeBits >= 1000, unlocked: false, reward: 3 },
    { id: 'botnet_master', name: 'Botnet Master', desc: 'Own 10 Zombie Bots', condition: (s) => s.upgrades.bot.count >= 10, unlocked: false, reward: 5 },
    { id: 'millionaire', name: 'Millionaire', desc: 'Accumulate 1,000,000 Bits', condition: (s) => s.lifetimeBits >= 1000000, unlocked: false, reward: 10 },
    { id: 'billionaire', name: 'Billionaire', desc: 'Accumulate 1,000,000,000 Bits', condition: (s) => s.lifetimeBits >= 1000000000, unlocked: false, reward: 20 },
    { id: 'crypto_miner', name: 'Crypto Miner', desc: 'Find 10 Cryptos', condition: (s) => s.cryptos >= 10, unlocked: false, reward: 5 },
    { id: 'hacker_elite', name: 'Hacker Elite', desc: 'Reach Root Access Level 5', condition: (s) => s.rootAccessLevel >= 5, unlocked: false, reward: 15 }
];

/* ---------------- state.js ---------------- */
// Sound System
const SoundManager = {
    ctx: null,
    masterVolume: 0.5,
    muted: false,

    init: function () {
        try {
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
            this.loadSettings();
        } catch (e) {
            console.error("Web Audio API not supported");
        }
    },

    loadSettings: function () {
        const savedVol = localStorage.getItem('cc_volume');
        const savedMute = localStorage.getItem('cc_mute');
        if (savedVol !== null) this.masterVolume = parseFloat(savedVol);
        if (savedMute !== null) this.muted = (savedMute === 'true');

        this.updateUI();
    },

    saveSettings: function () {
        localStorage.setItem('cc_volume', this.masterVolume);
        localStorage.setItem('cc_mute', this.muted);
    },

    updateUI: function () {
        const slider = document.getElementById('volume-slider');
        const valueDisplay = document.getElementById('volume-value');
        const muteBtn = document.getElementById('mute-btn');

        if (slider) slider.value = this.masterVolume * 100;
        if (valueDisplay) valueDisplay.innerText = Math.round(this.masterVolume * 100) + '%';
        if (muteBtn) {
            muteBtn.innerText = this.muted ? "UNMUTE SOUND" : "MUTE SOUND";
            muteBtn.classList.toggle('danger', this.muted);
        }
    },

    playTone: function (freq, type, duration, vol = 1) {
        if (!this.ctx || this.muted) return;

        // Resume context if suspended (browser policy)
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(vol * this.masterVolume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    },

    playSFX: function (name) {
        if (!this.ctx) this.init();

        switch (name) {
            case 'click':
                this.playTone(1200, 'sine', 0.1, 0.3);
                break;
            case 'buy':
                this.playTone(600, 'square', 0.1, 0.3);
                setTimeout(() => this.playTone(1200, 'square', 0.2, 0.3), 100);
                break;
            case 'error':
                this.playTone(150, 'sawtooth', 0.3, 0.5);
                break;
            case 'alert':
                this.playTone(800, 'sawtooth', 0.5, 0.4);
                setTimeout(() => this.playTone(600, 'sawtooth', 0.5, 0.4), 200);
                break;
            case 'success':
                this.playTone(400, 'sine', 0.1, 0.4);
                setTimeout(() => this.playTone(600, 'sine', 0.1, 0.4), 100);
                setTimeout(() => this.playTone(800, 'sine', 0.2, 0.4), 200);
                break;
            case 'reboot':
                this.playTone(100, 'sawtooth', 1.0, 0.8);
                break;
        }
    }
};

// Settings UI Functions
function openSettings() {
    document.getElementById('settings-modal').classList.add('visible');
    SoundManager.updateUI();
}

function closeSettings() {
    document.getElementById('settings-modal').classList.remove('visible');
}

function toggleMute() {
    SoundManager.muted = !SoundManager.muted;
    SoundManager.saveSettings();
    SoundManager.updateUI();
}

document.addEventListener('DOMContentLoaded', () => {
    const slider = document.getElementById('volume-slider');
    if (slider) {
        slider.addEventListener('input', (e) => {
            SoundManager.masterVolume = e.target.value / 100;
            document.getElementById('volume-value').innerText = e.target.value + '%';
            SoundManager.saveSettings();
        });
    }
    // Init Sound
    document.body.addEventListener('click', () => {
        if (SoundManager.ctx && SoundManager.ctx.state === 'suspended') {
            SoundManager.ctx.resume();
        }
    }, { once: true });
});

let gameState = {};

function initState() {
    gameState.bits = 0;
    gameState.lifetimeBits = 0;
    gameState.gps = 0;
    gameState.clickPower = 1;
    gameState.rootAccessLevel = 0;
    gameState.cryptos = 0;
    gameState.permanentMultiplier = 1;
    gameState.firewallActive = false;
    gameState.firewallCode = "";

    // Statistics tracking
    gameState.statistics = {
        totalClicks: 0,
        totalBitsEarned: 0,
        playTimeSeconds: 0,
        rebootCount: 0,
        firewallsEncountered: 0,
        firewallsCleared: 0,
        sessionStartTime: Date.now()
    };

    // Deep copy upgrades to avoid mutating the constant definition
    gameState.upgrades = JSON.parse(JSON.stringify(UPGRADES));

    // Achievements need to keep their functions, so we map them
    gameState.achievements = ACHIEVEMENTS.map(ach => ({ ...ach, unlocked: false }));

    gameState.activeBoosts = []; // Array of { multiplier, endTime }
    gameState.lastSaveTime = Date.now();
}

function loadState(savedData) {
    initState(); // Start with fresh state

    if (savedData) {
        gameState.bits = savedData.bits || 0;
        gameState.lifetimeBits = savedData.lifetimeBits || 0;
        gameState.rootAccessLevel = savedData.rootAccessLevel || 0;
        gameState.cryptos = savedData.cryptos || 0;
        gameState.permanentMultiplier = savedData.permanentMultiplier || 1;
        gameState.lastSaveTime = savedData.lastSaveTime || Date.now();

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

        // Load Statistics
        if (savedData.statistics) {
            // Merge saved statistics with current (initial) statistics.
            // This ensures new stats fields are initialized correctly if they didn't exist in old saves.
            gameState.statistics = { ...gameState.statistics, ...savedData.statistics };
        }
    }
}

function resetStateForPrestige(newRootLevel) {
    gameState.bits = 0;
    gameState.lifetimeBits = 0;
    gameState.gps = 0;
    gameState.clickPower = 1;
    gameState.rootAccessLevel = newRootLevel;
    gameState.permanentMultiplier *= 1.1; // +10% permanent bonus per reboot
    gameState.activeBoosts = [];


    // Reset Upgrades
    for (const key in gameState.upgrades) {
        gameState.upgrades[key].count = 0;
        gameState.upgrades[key].cost = UPGRADES[key].cost;
    }
}

/* ---------------- ui.js ---------------- */
// DOM Elements
let bitsDisplay, gpsDisplay, cryptoDisplay, shopContainer, blackMarketContainer, gameLog, achievementsContainer, rebootButton, rebootBonusDisplay, rebootLevelDisplay, hackButton, firewallOverlay, firewallCodeDisplay, firewallInput;

function switchTab(tabId) {
    // Update active state of buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabId) {
            btn.classList.add('active');
        }
    });

    // Show/Hide tab panes
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('active');
    });
    const activePane = document.getElementById(`tab-${tabId}`);
    if (activePane) {
        activePane.classList.add('active');
    } else {
        console.error(`Tab pane not found: ${tabId}`);
    }
}

function switchMobileTab(tabId) {
    // Update active state of mobile buttons
    document.querySelectorAll('.mobile-nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabId) {
            btn.classList.add('active');
        }
    });

    const terminalSection = document.querySelector('.terminal-section');
    const auxiliarySection = document.querySelector('.auxiliary-section');

    if (tabId === 'terminal') {
        // Show Terminal, Hide Aux
        terminalSection.classList.remove('mobile-hidden');
        auxiliarySection.classList.add('mobile-hidden');
    } else {
        // Hide Terminal, Show Aux
        terminalSection.classList.add('mobile-hidden');
        auxiliarySection.classList.remove('mobile-hidden');

        // Switch the auxiliary tab content
        switchTab(tabId);
    }
}

function initUI() {
    bitsDisplay = document.getElementById('bits-display');
    gpsDisplay = document.getElementById('gps-display');
    cryptoDisplay = document.getElementById('crypto-display');
    shopContainer = document.getElementById('shop-container');
    blackMarketContainer = document.getElementById('black-market-container');
    gameLog = document.getElementById('game-log');
    achievementsContainer = document.getElementById('achievements-container');
    rebootButton = document.getElementById('reboot-button');
    rebootBonusDisplay = document.getElementById('reboot-bonus-display');
    rebootLevelDisplay = document.getElementById('reboot-level-display');
    hackButton = document.getElementById('hack-button');
    firewallOverlay = document.getElementById('firewall-overlay');
    firewallCodeDisplay = document.getElementById('firewall-code-display');
    firewallInput = document.getElementById('firewall-input');

    // Debug Toggle
    const debugToggle = document.getElementById('debug-toggle-btn');
    if (debugToggle) {
        debugToggle.addEventListener('click', () => {
            const consoleEl = document.getElementById('debug-console-container');
            if (consoleEl) consoleEl.classList.toggle('visible');
        });
    }

    if (!hackButton) { console.error("UI: Hack button not found!"); logMessage("ERROR: Hack button not found!"); }
    if (!bitsDisplay) { console.error("UI: Bits display not found!"); logMessage("ERROR: Bits display not found!"); }
    else { logMessage("DEBUG: Bits display found."); }

    // Tab Logic
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            switchTab(btn.dataset.tab);
        });
    });
}

function formatNumber(num) {
    if (num < 1000) return Math.floor(num).toLocaleString();

    const suffixes = ["", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc"];
    const suffixNum = Math.floor(("" + Math.floor(num)).length / 3);

    let shortValue = parseFloat((suffixNum !== 0 ? (num / Math.pow(1000, suffixNum)) : num).toPrecision(5));
    if (shortValue % 1 !== 0) {
        shortValue = shortValue.toFixed(3);
    }
    return shortValue + suffixes[suffixNum];
}

function logMessage(msg) {
    // Route DEBUG and ERROR messages to debug console
    if (msg.startsWith('DEBUG:') || msg.startsWith('ERROR:') || msg.includes('Error')) {
        const debugLog = document.getElementById('debug-log');
        if (debugLog) {
            const div = document.createElement('div');
            div.className = 'debug-entry ' + (msg.includes('ERROR') || msg.includes('Error') ? 'error' : 'debug');
            div.innerText = `[${new Date().toLocaleTimeString()}] ${msg}`;
            debugLog.prepend(div);
        }
        // Only hide DEBUG from main log, keep ERRORs visible
        if (msg.startsWith('DEBUG:')) return;
    }

    if (!gameLog) gameLog = document.getElementById('game-log');
    if (!gameLog) return;

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

    if (gpsDisplay) {
        gpsDisplay.innerText = gameState.gps.toFixed(1);

        // Calculate and display total bonus
        const bonusEl = document.getElementById('gps-bonus');
        if (bonusEl) {
            let totalMultiplier = 1;

            // 1. Root Access Bonus
            if (gameState.rootAccessLevel > 0) {
                totalMultiplier *= (1 + gameState.rootAccessLevel * 0.1);
            }

            // 2. Permanent Multiplier
            if (gameState.permanentMultiplier > 1) {
                totalMultiplier *= gameState.permanentMultiplier;
            }

            // 3. Active Boosts
            const now = Date.now();
            gameState.activeBoosts.forEach(b => {
                if (b.endTime > now) totalMultiplier *= b.multiplier;
            });

            if (totalMultiplier > 1) {
                const bonusPercent = ((totalMultiplier - 1) * 100).toFixed(0);
                bonusEl.innerText = `(+${bonusPercent}%)`;
                bonusEl.style.display = 'inline';
            } else {
                bonusEl.style.display = 'none';
            }
        }
    }
    if (cryptoDisplay) cryptoDisplay.innerText = formatNumber(gameState.cryptos);

    // Update reboot button state
    const potentialLevel = calculatePotentialRootAccess();
    updateRebootButton(potentialLevel);

    // Update statistics
    renderStatistics();

    // Update active effects (for countdown timers)
    if (document.getElementById('active-effects-container')) {
        renderActiveEffects();
    }
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

function createBinaryParticle(x, y) {
    const el = document.createElement('div');
    el.className = 'binary-particle';
    el.innerText = Math.random() > 0.5 ? '1' : '0';
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;

    // Random direction
    const angle = Math.random() * Math.PI * 2;
    const distance = 50 + Math.random() * 100;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance;

    el.style.setProperty('--tx', `${tx}px`);
    el.style.setProperty('--ty', `${ty}px`);

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

        let statText = '';
        if (upgrade.gps > 0) {
            statText += `+${upgrade.gps} GPS`;
        }
        if (upgrade.click > 0) {
            if (statText !== '') statText += ', ';
            statText += `+${upgrade.click} Click`;
        }

        // Calculate additional info
        const contribution = calculateGPSContribution(key);
        const efficiency = calculateEfficiency(upgrade);
        const rating = getEfficiencyRating(efficiency);

        // Build contribution text
        let contributionHTML = '';
        if (upgrade.gps > 0 && upgrade.count > 0) {
            contributionHTML = `
                <div class="upgrade-contribution">
                    Current: ${contribution.contribution.toFixed(1)} GPS (${contribution.percentage.toFixed(1)}%)
                </div>
            `;
        }

        // Build efficiency badge
        let efficiencyHTML = '';
        if (upgrade.gps > 0) {
            efficiencyHTML = `
                <div class="upgrade-efficiency ${rating.class}">
                    ${rating.text}
                </div>
            `;
        }

        item.innerHTML = `
    <div class="upgrade-info">
        <h3>${upgrade.name} <span style="font-size:0.8em; color:#fff;">(x${upgrade.count})</span></h3>
        <p>${upgrade.desc} (${statText})</p>
        ${contributionHTML}
    </div>
    <div class="upgrade-cost">
        ${formatNumber(upgrade.cost)} BITS
        ${efficiencyHTML}
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

    // Render active effects
    renderActiveEffects();
}

function renderActiveEffects() {
    const container = document.getElementById('active-effects-container');
    if (!container) return;

    let effectsHTML = '';

    // Show permanent multiplier if > 1
    if (gameState.permanentMultiplier > 1) {
        const bonusPercent = ((gameState.permanentMultiplier - 1) * 100).toFixed(0);
        effectsHTML += `
            <div class="effect-item permanent">
                <span class="effect-icon">⚡</span>
                <span class="effect-name">Permanent GPS Boost</span>
                <span class="effect-value">+${bonusPercent}%</span>
            </div>
        `;
    }

    // Show active boosts
    const now = Date.now();
    gameState.activeBoosts = gameState.activeBoosts.filter(boost => boost.endTime > now);

    gameState.activeBoosts.forEach(boost => {
        const remaining = Math.ceil((boost.endTime - now) / 1000);
        const bonusPercent = ((boost.multiplier - 1) * 100).toFixed(0);
        effectsHTML += `
            <div class="effect-item active">
                <span class="effect-icon">🔥</span>
                <span class="effect-name">Signal Boost</span>
                <span class="effect-value">+${bonusPercent}% (${remaining}s)</span>
            </div>
        `;
    });

    if (effectsHTML) {
        container.innerHTML = `
            <div class="effects-header">ACTIVE EFFECTS</div>
            ${effectsHTML}
        `;
        container.style.display = 'block';
    } else {
        container.style.display = 'none';
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
    <div class="ach-info">
        <span class="ach-name">${ach.name}</span>
        <span class="ach-reward" style="font-size:0.8em; color:var(--primary-gold);">+${ach.reward} 🪙</span>
    </div>
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
    <div class="ach-reward" style="color:var(--primary-gold); font-weight:bold; margin-top:5px;">+${ach.reward} CRYPTOS</div>
</div>
`;
    document.body.appendChild(el);

    setTimeout(() => {
        el.style.opacity = 0;
        setTimeout(() => el.remove(), 500);
    }, 3000);
}

function renderStatistics() {
    if (!gameState.statistics) return;

    // Format time as HH:MM:SS
    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    // Update play time
    const currentSessionTime = Math.floor((Date.now() - gameState.statistics.sessionStartTime) / 1000);
    const totalPlayTime = gameState.statistics.playTimeSeconds + currentSessionTime;

    // Update DOM elements
    const statClicks = document.getElementById('stat-clicks');
    const statBits = document.getElementById('stat-bits');
    const statTime = document.getElementById('stat-time');
    const statReboots = document.getElementById('stat-reboots');
    const statFirewalls = document.getElementById('stat-firewalls');
    const statFirewallsCleared = document.getElementById('stat-firewalls-cleared');

    if (statClicks) statClicks.innerText = formatNumber(gameState.statistics.totalClicks);
    if (statBits) statBits.innerText = formatNumber(gameState.statistics.totalBitsEarned);
    if (statTime) statTime.innerText = formatTime(totalPlayTime);
    if (statReboots) statReboots.innerText = gameState.statistics.rebootCount;
    if (statFirewalls) statFirewalls.innerText = gameState.statistics.firewallsEncountered || 0;
    if (statFirewallsCleared) statFirewallsCleared.innerText = gameState.statistics.firewallsCleared || 0;
}

function updateRebootButton(potentialLevel) {
    const btnText = rebootButton.querySelector('.text');
    if (potentialLevel > gameState.rootAccessLevel) {
        if (btnText) btnText.innerText = `REBOOT (LVL ${gameState.rootAccessLevel} → ${potentialLevel})`;
        rebootButton.classList.remove('disabled');
    } else {
        if (btnText) btnText.innerText = `REBOOT SYSTEM`;
        rebootButton.classList.add('disabled');
    }

    if (rebootLevelDisplay) {
        const nextLevel = gameState.rootAccessLevel + 1;
        const requiredBits = nextLevel * nextLevel * 1000000;
        if (potentialLevel > gameState.rootAccessLevel) {
            rebootLevelDisplay.innerHTML = `Root Access: LVL ${gameState.rootAccessLevel}<br>→ LVL ${potentialLevel} (Ready!)`;
        } else {
            rebootLevelDisplay.innerHTML = `Root Access: LVL ${gameState.rootAccessLevel}<br>(Next: LVL ${nextLevel} at ${formatNumber(requiredBits)} BITS)`;
        }
    }

    if (rebootBonusDisplay) {
        rebootBonusDisplay.innerText = `Current Bonus: +${(gameState.rootAccessLevel * 10).toFixed(0)}% GPS`;
    }
}

let flashTimeout;
function flashBitsDisplay() {
    if (flashTimeout) clearTimeout(flashTimeout);
    bitsDisplay.style.color = '#00ff41';
    flashTimeout = setTimeout(() => {
        bitsDisplay.style.color = '';
        flashTimeout = null;
    }, 200);
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
    createBinaryParticle,
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
        activeBoosts: gameState.activeBoosts,
        statistics: gameState.statistics,
        lastSaveTime: Date.now()
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

function hardReset() {
    if (confirm("WARNING: Are you sure you want to wipe ALL game data? This cannot be undone!")) {
        if (confirm("Double Check: Really delete everything?")) {
            localStorage.removeItem(SAVE_KEY);
            location.reload();
        }
    }
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
    if (gameState.statistics) {
        gameState.statistics.totalBitsEarned += amount;
    }
    UI.updateDisplay();
    checkUnlocks();
}

// Helper functions for upgrade information
function calculateGPSContribution(upgradeKey) {
    const upgrade = gameState.upgrades[upgradeKey];
    const contribution = upgrade.gps * upgrade.count;
    const percentage = gameState.gps > 0 ? (contribution / gameState.gps) * 100 : 0;
    return { contribution, percentage };
}

function calculateEfficiency(upgrade) {
    if (upgrade.gps === 0) return Infinity; // Click upgrades have no GPS efficiency
    return upgrade.cost / upgrade.gps; // Lower is better
}

function getEfficiencyRating(efficiency) {
    if (efficiency === Infinity) return { text: 'N/A', class: 'neutral' };
    if (efficiency < 500) return { text: 'Excellent', class: 'excellent' };
    if (efficiency < 2000) return { text: 'Good', class: 'good' };
    if (efficiency < 10000) return { text: 'Fair', class: 'fair' };
    return { text: 'Poor', class: 'poor' };
}



function calculateClickPower() {
    let power = 1; // Base power
    for (const key in gameState.upgrades) {
        const upgrade = gameState.upgrades[key];
        if (upgrade.click) {
            power += upgrade.click * upgrade.count;
        }
    }
    // Apply multipliers if any (currently none for click, but good for future)
    gameState.clickPower = power;
}

function calculateGPS() {
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
    gameState.activeBoosts = gameState.activeBoosts.filter(b => b.endTime > now); // Cleanup expired
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
            UI.showAchievementNotification(ach);
            UI.logMessage(`ACHIEVEMENT UNLOCKED: ${ach.name} (+${ach.reward} CRYPTOS)`);
            UI.renderAchievements();
            UI.updateDisplay(); // Update Crypto display
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

        SoundManager.playSFX('buy');
        calculateGPS();
        calculateClickPower();
        UI.updateDisplay();
        UI.renderShop(buyUpgrade); // Re-render to update costs and counts
        saveGame(); // Auto-save on purchase
        UI.logMessage(`System upgraded: ${upgrade.name}`);
    } else {
        SoundManager.playSFX('error');
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
        SoundManager.playSFX('error');
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
            UI.logMessage(`SYSTEM REBOOTED. ROOT ACCESS: LEVEL ${gameState.rootAccessLevel}`);
            UI.logMessage(`REWARD: +${cryptosGained} CRYPTOS`);
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

// Firewall Logic
function spawnFirewall() {
    if (gameState.firewallActive) return;

    gameState.firewallActive = true;
    if (gameState.statistics) {
        gameState.statistics.firewallsEncountered++;
    }

    // Generate Random Hex Code (4 chars)
    const chars = "0123456789ABCDEF";
    let code = "";
    for (let i = 0; i < 4; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    gameState.firewallCode = code;

    firewallOverlay.classList.add('visible');
    firewallCodeDisplay.innerText = code;
    firewallInput.value = "";
    // firewallInput.focus(); // Removed to prevent mobile keyboard popup

    SoundManager.playSFX('alert');
    UI.logMessage("⚠️ WARNING: FIREWALL DETECTED! GPS REDUCED!");
    calculateGPS();
    UI.updateDisplay();
}

// Expose for testing
window.testFirewall = spawnFirewall;

function checkFirewallInput() {
    if (!gameState.firewallActive) return;

    const input = document.getElementById('firewall-input');
    if (input.value.toUpperCase() === gameState.firewallCode) {
        clearFirewall();
        input.value = "";
    }
}

function handleKeypadInput(key) {
    const input = document.getElementById('firewall-input');
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
    UI.logMessage(`FIREWALL BREACHED! REWARD: +${formatNumber(reward)} BITS`);
    UI.updateDisplay();
}

// Interval IDs
let gameLoopId, autoSaveId, eventLoopId, rebootBtnId;

// Initialization
function init() {
    try {
        // Clear existing intervals if any (for reboot)
        if (gameLoopId) cancelAnimationFrame(gameLoopId);
        if (autoSaveId) clearInterval(autoSaveId);
        if (eventLoopId) clearInterval(eventLoopId);
        if (rebootBtnId) clearInterval(rebootBtnId);

        UI.initUI(); // Initialize UI elements first

        // Firewall Input Listener
        if (firewallInput) {
            // Remove old listener
            const newInput = firewallInput.cloneNode(true);
            firewallInput.parentNode.replaceChild(newInput, firewallInput);
            firewallInput = newInput;

            firewallInput.addEventListener('input', checkFirewallInput);
            // Removed forced focus on blur to prevent mobile keyboard issues
        }

        // Global Keydown Listener for Firewall
        document.addEventListener('keydown', (e) => {
            if (gameState.firewallActive) {
                const key = e.key.toUpperCase();
                const validKeys = "0123456789ABCDEF";

                // Handle Backspace
                if (e.key === 'Backspace') {
                    firewallInput.value = firewallInput.value.slice(0, -1);
                    return;
                }

                // Handle Enter
                if (e.key === 'Enter') {
                    checkFirewallInput();
                    return;
                }

                // Handle Hex Input
                if (validKeys.includes(key) && key.length === 1) {
                    if (firewallInput.value.length < 4) {
                        firewallInput.value += key;
                        checkFirewallInput();
                    }
                }
            }
        });

        // Global Error Handler for debugging (only add once)
        if (!window.errorHandlerAdded) {
            window.addEventListener('error', (e) => {
                if (UI && UI.logMessage) {
                    UI.logMessage(`ERROR: ${e.message}`);
                }
            });
            window.errorHandlerAdded = true;
        }

        UI.logMessage("DEBUG: Starting init...");
        UI.logMessage("DEBUG: UI Initialized");

        const loaded = loadGame();
        if (loaded) {
            calculateGPS();
            calculateClickPower();
            UI.logMessage("Save data loaded.");

            // Offline Progress Calculation
            if (gameState.lastSaveTime) {
                const now = Date.now();
                const secondsOffline = (now - gameState.lastSaveTime) / 1000;
                if (secondsOffline > 60 && gameState.gps > 0) { // Minimum 60 seconds
                    const offlineEarnings = secondsOffline * gameState.gps;
                    addBits(offlineEarnings);

                    // Show Overlay
                    const overlay = document.getElementById('offline-overlay');
                    const amountDisplay = document.getElementById('offline-amount-display');
                    const timeDisplay = document.getElementById('offline-time-display');

                    if (overlay && amountDisplay && timeDisplay) {
                        amountDisplay.innerText = `+${formatNumber(offlineEarnings)} BITS`;
                        timeDisplay.innerText = `Time Offline: ${formatNumber(secondsOffline)}s`;
                        overlay.classList.add('visible');
                    }
                    UI.logMessage(`OFFLINE: Earned ${formatNumber(offlineEarnings)} Bits over ${formatNumber(secondsOffline)}s`);
                }
            }

        } else {
            UI.logMessage("Connection established.");
        }

        UI.logMessage(`DEBUG: Upgrades count: ${Object.keys(gameState.upgrades || {}).length}`);
        UI.renderShop = renderShop;
        UI.renderBlackMarket = renderBlackMarket;
        UI.renderAchievements = renderAchievements;
        UI.renderStatistics = renderStatistics;
        UI.updateRebootButton = updateRebootButton;

        // Cleaned up duplicate assignments here

        // Initial render
        UI.renderShop(buyUpgrade);
        UI.renderBlackMarket(buyBlackMarketItem);
        UI.renderAchievements();
        UI.updateDisplay();

        // Initialize Mobile View State
        if (window.innerWidth <= 768) {
            switchMobileTab('terminal');
        }

        // Update Reboot Button Text periodically
        rebootBtnId = setInterval(() => {
            const potential = calculatePotentialRootAccess();
            UI.updateRebootButton(potential);
        }, 1000);

        // Start Glitch System
        spawnGlitch();

        // Event Listeners
        const hackBtn = document.getElementById('hack-button');
        if (hackBtn) {
            // Remove old listener (clone node)
            const newHackBtn = hackBtn.cloneNode(true);
            hackBtn.parentNode.replaceChild(newHackBtn, hackBtn);
            // Re-attach listener
            newHackBtn.addEventListener('click', (e) => {
                try {
                    if (gameState.statistics) {
                        gameState.statistics.totalClicks++;
                    }
                    addBits(gameState.clickPower);
                    UI.createFloatingText(e.clientX, e.clientY, `+${gameState.clickPower}`);
                    UI.animateHackButton();
                    SoundManager.playSFX('click');

                    // Spawn particles
                    for (let i = 0; i < 8; i++) {
                        UI.createBinaryParticle(e.clientX, e.clientY);
                    }
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
            const newRebootBtn = rebootBtn.cloneNode(true);
            rebootBtn.parentNode.replaceChild(newRebootBtn, rebootBtn);
            rebootButton = newRebootBtn; // Update global reference

            newRebootBtn.addEventListener('click', () => {
                rebootSystem();
            });
        }

        // Keydown listener (only add once)
        if (!window.keyDownHandlerAdded) {
            document.addEventListener('keydown', (e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                    e.preventDefault();
                    saveGame();
                    UI.logMessage("Game saved manually.");
                    UI.flashBitsDisplay();
                }
            });
            window.keyDownHandlerAdded = true;
        }

        // Game Loop (RequestAnimationFrame)
        let lastTickTime = performance.now();
        function gameLoop(currentTime) {
            const deltaTime = (currentTime - lastTickTime) / 1000; // Convert to seconds
            lastTickTime = currentTime;

            if (gameState.gps > 0) {
                addBits(gameState.gps * deltaTime);
            }
            
            gameLoopId = requestAnimationFrame(gameLoop);
        }
        gameLoopId = requestAnimationFrame(gameLoop);

        // Auto-Save
        autoSaveId = setInterval(() => {
            saveGame();
        }, 30000);

        // Random Event Loop (Check every 10 seconds)
        eventLoopId = setInterval(() => {
            // 5% chance every 10 seconds -> approx every 3.3 minutes
            if (!gameState.firewallActive && Math.random() < 0.05 && gameState.gps > 0) {
                spawnFirewall();
            }
        }, 10000);

        UI.logMessage("DEBUG: Init complete");

    } catch (e) {
        console.error("Init failed:", e);
        if (UI && UI.logMessage) UI.logMessage(`CRITICAL ERROR: Init failed: ${e.message}`);
    }
}

// Start the game
init();
