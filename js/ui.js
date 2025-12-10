// @ts-check
import { gameState } from "./state.js";
import { BLACK_MARKET_ITEMS, SKILL_TREE } from "./constants.js";
import { calculateGPSContribution, calculateEfficiency, getEfficiencyRating, calculatePotentialRootAccess } from "./game.js";

// DOM Elements
/** @type {HTMLElement} */
let bitsDisplay;
/** @type {HTMLElement} */
let gpsDisplay;
/** @type {HTMLElement} */
let cryptoDisplay;
/** @type {HTMLElement} */
let shopContainer;
/** @type {HTMLElement} */
let blackMarketContainer;
/** @type {HTMLElement} */
let skillTreeContainer;
/** @type {HTMLElement} */
let gameLog;
/** @type {HTMLElement} */
let achievementsContainer;
/** @type {HTMLElement} */
let rebootButton;
/** @type {HTMLElement} */
let rebootBonusDisplay;
/** @type {HTMLElement} */
let rebootLevelDisplay;
/** @type {HTMLElement} */
let hackButton;
/** @type {HTMLElement} */
export let firewallOverlay;
/** @type {HTMLElement} */
let firewallCodeDisplay;
/** @type {HTMLInputElement} */
export let firewallInput;

/**
 * @param {string} tabId 
 */
export function switchTab(tabId) {
    // Update active state of buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        const el = /** @type {HTMLElement} */ (btn);
        el.classList.remove('active');
        if (el.dataset.tab === tabId) {
            el.classList.add('active');
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

/**
 * @param {string} tabId 
 */
export function switchMobileTab(tabId) {
    // Update active state of mobile buttons
    document.querySelectorAll('.mobile-nav-btn').forEach(btn => {
        const el = /** @type {HTMLElement} */ (btn);
        if (el.dataset.tab === tabId) {
            el.classList.add('active');
        } else {
            el.classList.remove('active');
        }
    });

    const terminalSection = document.querySelector('.terminal-section');
    const auxiliarySection = document.querySelector('.auxiliary-section');

    if (!terminalSection || !auxiliarySection) return;

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

export function initUI() {
    bitsDisplay = /** @type {HTMLElement} */ (document.getElementById('bits-display'));
    gpsDisplay = /** @type {HTMLElement} */ (document.getElementById('gps-display'));
    cryptoDisplay = /** @type {HTMLElement} */ (document.getElementById('crypto-display'));
    shopContainer = /** @type {HTMLElement} */ (document.getElementById('shop-container'));
    blackMarketContainer = /** @type {HTMLElement} */ (document.getElementById('black-market-container'));
    gameLog = /** @type {HTMLElement} */ (document.getElementById('game-log'));
    achievementsContainer = /** @type {HTMLElement} */ (document.getElementById('achievements-container'));
    rebootButton = /** @type {HTMLElement} */ (document.getElementById('reboot-button'));
    rebootBonusDisplay = /** @type {HTMLElement} */ (document.getElementById('reboot-bonus-display'));
    rebootLevelDisplay = /** @type {HTMLElement} */ (document.getElementById('reboot-level-display'));
    hackButton = /** @type {HTMLElement} */ (document.getElementById('hack-button'));
    firewallOverlay = /** @type {HTMLElement} */ (document.getElementById('firewall-overlay'));
    firewallCodeDisplay = /** @type {HTMLElement} */ (document.getElementById('firewall-code-display'));
    firewallInput = /** @type {HTMLInputElement} */ (document.getElementById('firewall-input'));

    // Initialize all section displays to none, then activate the default one
    const shop = document.getElementById('shop-section');
    const blackMarket = document.getElementById('black-market-section');
    const achievements = document.getElementById('achievements-section');
    const statistics = document.getElementById('statistics-section');
    const settings = document.getElementById('settings-section');
    const about = document.getElementById('about-section');
    const tutorial = document.getElementById('tutorial-section');
    const save = document.getElementById('save-section');
    const offline = document.getElementById('offline-section');
    const breach = document.getElementById('breach-section');
    const skillTree = document.getElementById('skill-tree-section');
    const exportImport = document.getElementById('export-import-section');

    skillTreeContainer = /** @type {HTMLElement} */ (document.getElementById('skill-tree-container'));



    if (shop) shop.style.display = 'none';
    if (blackMarket) blackMarket.style.display = 'none';
    if (achievements) achievements.style.display = 'none';
    if (statistics) statistics.style.display = 'none';
    if (settings) settings.style.display = 'none';
    if (about) about.style.display = 'none';
    if (tutorial) tutorial.style.display = 'none';
    if (save) save.style.display = 'none';
    if (offline) offline.style.display = 'none';
    if (breach) breach.style.display = 'none';
    if (skillTree) skillTree.style.display = 'none';
    // exportImport handling removed as it's now part of the settings modal


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
        const el = /** @type {HTMLElement} */ (btn); // Added type assertion
        if (el.dataset.tab) { // Changed to use 'el' and added null check for dataset.tab
            el.addEventListener('click', () => {
                if (el.dataset.tab) {
                    switchTab(el.dataset.tab);
                }
            });
        }
    });
}

/**
 * @param {number} num 
 */
export function formatNumber(num) {
    if (num < 1000) return Math.floor(num).toLocaleString();

    const suffixes = ["", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc"];
    const suffixNum = Math.floor(("" + Math.floor(num)).length / 3);

    let shortValue = parseFloat((suffixNum !== 0 ? (num / Math.pow(1000, suffixNum)) : num).toPrecision(5));
    let shortValueStr = String(shortValue);
    if (shortValue % 1 !== 0) {
        shortValueStr = shortValue.toFixed(3);
    }
    return shortValueStr + suffixes[suffixNum];
}

/**
 * @param {string} msg 
 */
export function logMessage(msg) {
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

    if (!gameLog) gameLog = /** @type {HTMLElement} */ (document.getElementById('game-log'));
    if (!gameLog) return;

    const div = /** @type {HTMLElement} */ (document.createElement('div'));
    div.className = 'log-entry';
    div.innerText = `> ${msg}`;
    gameLog.prepend(div);

    if (gameLog.children.length > 20) {
        if (gameLog.lastElementChild) {
            gameLog.lastElementChild.scrollIntoView();
        }
    }
}

export function updateDisplay() {
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

/**
 * @param {() => void} onClick 
 */
export function createGlitchElement(onClick) {
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

/**
 * @param {number} x 
 * @param {number} y 
 * @param {string} text 
 */
export function createFloatingText(x, y, text) {
    const debugBtn = document.createElement('button');
    debugBtn.innerText = "DEBUG: +1M Bits";
    debugBtn.onclick = () => addBits(1000000);
    debugBtn.style.position = 'fixed';
    debugBtn.style.bottom = '10px';
    debugBtn.style.left = '10px';
    debugBtn.style.zIndex = '9999';
    document.body.appendChild(debugBtn);

    const breachBtn = document.createElement('button');
    breachBtn.innerText = "DEBUG: Start Breach";
    breachBtn.onclick = () => {
        if (typeof startDataBreach === 'function') {
            startDataBreach();
        } else {
            console.error("startDataBreach not found");
        }
    };
    breachBtn.style.position = 'fixed';
    breachBtn.style.bottom = '40px';
    breachBtn.style.left = '10px';
    breachBtn.style.zIndex = '9999';
    document.body.appendChild(breachBtn);

    const el = document.createElement('div');
    el.className = 'floating-text';
    el.innerText = text;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    document.body.appendChild(el);

    setTimeout(() => el.remove(), 1000);
}

/**
 * @param {number} x 
 * @param {number} y 
 */
export function createBinaryParticle(x, y) {
    const el = document.createElement('div');
    const colors = ['particle-cyan', 'particle-pink', 'particle-gold'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    el.className = `binary-particle ${randomColor}`;
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

/**
 * @param {(arg0: string) => void} buyCallback 
 */
export function renderShop(buyCallback) {
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

/**
 * @param {(arg0: string) => void} buyCallback 
 */
export function renderBlackMarket(buyCallback) {
    blackMarketContainer.innerHTML = '';
    // DIRECT ACCESS TO BLACK_MARKET_ITEMS for bundle
    for (const key in BLACK_MARKET_ITEMS) {
        const item = BLACK_MARKET_ITEMS[/** @type {keyof typeof BLACK_MARKET_ITEMS} */(key)];

        // Hide auto-glitch bot if already purchased
        if (item.id === 'autoGlitch' && gameState.autoGlitchEnabled) {
            continue;
        }

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

/**
 * @param {(arg0: string) => void} buyCallback 
 */
export function renderSkillTree(buyCallback) {
    if (!skillTreeContainer) return;
    skillTreeContainer.innerHTML = '';

    const spDisplay = document.getElementById('skill-points-value');
    if (spDisplay) spDisplay.innerText = String(gameState.skillPoints);

    for (const key in SKILL_TREE) {
        const skill = SKILL_TREE[/** @type {keyof typeof SKILL_TREE} */(key)];
        const currentLevel = gameState.skills[key] || 0;
        const isMaxed = currentLevel >= skill.maxLevel;
        const canAfford = gameState.skillPoints >= skill.cost;
        const isLocked = !canAfford && !isMaxed; // Simple lock logic for now

        const el = document.createElement('div');
        el.className = `skill-node ${isMaxed ? 'maxed' : (canAfford ? 'affordable' : 'locked')} ${currentLevel > 0 ? 'unlocked' : ''}`;
        el.onclick = () => {
            if (!isMaxed && canAfford) {
                buyCallback(key);
            }
        };

        el.innerHTML = `
            <div class="skill-icon">🧠</div>
            <div class="skill-name">${skill.name}</div>
            <div class="skill-desc">${skill.desc}</div>
            <div class="skill-level">Level: ${currentLevel} / ${skill.maxLevel}</div>
            <div class="skill-cost" style="${isMaxed ? 'color:#0f0' : ''}">
                ${isMaxed ? 'MAXED' : `${skill.cost} SP`}
            </div>
        `;
        skillTreeContainer.appendChild(el);
    }
}

export function renderActiveEffects() {
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

export function updateShopUI() {
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

export function renderAchievements() {
    achievementsContainer.innerHTML = '';
    gameState.achievements.forEach(/** @type {any} */(ach) => {
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

/** @param {any} ach */
export function showAchievementNotification(ach) {
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
        el.style.opacity = '0';
        setTimeout(() => el.remove(), 500);
    }, 3000);
}

export function renderStatistics() {
    if (!gameState.statistics) return;

    // Format time as HH:MM:SS
    /** @param {number} seconds */
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
    const statClicks = /** @type {HTMLElement} */ (document.getElementById('stat-clicks'));
    const statBits = /** @type {HTMLElement} */ (document.getElementById('stat-bits'));
    const statTime = /** @type {HTMLElement} */ (document.getElementById('stat-time'));
    const statReboots = /** @type {HTMLElement} */ (document.getElementById('stat-reboots'));
    const statFirewalls = /** @type {HTMLElement} */ (document.getElementById('stat-firewalls'));
    const statFirewallsCleared = /** @type {HTMLElement} */ (document.getElementById('stat-firewalls-cleared'));

    if (statClicks) statClicks.innerText = formatNumber(gameState.statistics.totalClicks);
    if (statBits) statBits.innerText = formatNumber(gameState.statistics.totalBitsEarned);
    if (statTime) statTime.innerText = formatTime(totalPlayTime);
    if (statReboots) statReboots.innerText = String(gameState.statistics.rebootCount);
    if (statFirewalls) statFirewalls.innerText = String(gameState.statistics.firewallsEncountered || 0);
    if (statFirewallsCleared) statFirewallsCleared.innerText = String(gameState.statistics.firewallsCleared || 0);
}

/**
 * @param {number} potentialLevel 
 */
export function updateRebootButton(potentialLevel) {
    const btnText = /** @type {HTMLElement} */ (rebootButton.querySelector('.text'));
    if (potentialLevel > gameState.rootAccessLevel) {
        if (btnText) btnText.innerText = `REBOOT (LVL ${gameState.rootAccessLevel} → ${potentialLevel})`;
        rebootButton.classList.remove('disabled');
    } else {
        if (btnText) btnText.innerText = `REBOOT SYSTEM`;
        rebootButton.classList.add('disabled');
        // Display Root Access info
        const currentLevel = gameState.rootAccessLevel;
        // Assuming calculatePotentialRootAccess is defined elsewhere and returns a number
        // If not, this line might cause an error. Keeping it as per user's request.
        const potentialLevel = calculatePotentialRootAccess();
        const nextLevel = currentLevel + 1;

        // Updated to match new 10M base requirement
        const requiredBits = 10000000 * Math.pow(10, nextLevel / 5);
        const bonusPercent = currentLevel * 10;

        if (rebootLevelDisplay) rebootLevelDisplay.innerText = `Root Access: LVL ${currentLevel}<br>(Next: LVL ${nextLevel} at ${formatNumber(requiredBits)} BITS)`;
        if (rebootBonusDisplay) rebootBonusDisplay.innerText = `Current Bonus: +${bonusPercent}% GPS`;

        // Enable/disable reboot button
        if (potentialLevel > currentLevel) {
            rebootButton.classList.remove('disabled');
            (/** @type {HTMLButtonElement} */ (rebootButton)).disabled = false;
        } else {
            rebootButton.classList.add('disabled');
            (/** @type {HTMLButtonElement} */ (rebootButton)).disabled = true;
        }
    }
}

/** @type {any} */
let flashTimeout;
export function flashBitsDisplay() {
    if (flashTimeout) clearTimeout(flashTimeout);
    bitsDisplay.style.color = '#00ff41';
    flashTimeout = setTimeout(() => {
        bitsDisplay.style.color = '';
        flashTimeout = null;
    }, 200);
}

export function animateHackButton() {
    hackButton.style.transform = 'scale(0.95)';
    setTimeout(() => hackButton.style.transform = 'scale(1)', 50);
}

// Settings UI Functions
export function openSettings() {
    const modal = document.getElementById('settings-modal');
    if (modal) modal.classList.add('visible');
}

export function closeSettings() {
    const modal = document.getElementById('settings-modal');
    if (modal) modal.classList.remove('visible');
}
