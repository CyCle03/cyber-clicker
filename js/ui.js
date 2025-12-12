// @ts-check
import { getGameState } from "./state.js";
import { BLACK_MARKET_ITEMS, SKILL_TREE } from "./constants.js";
import { calculateGPSContribution, calculateEfficiency, getEfficiencyRating, calculatePotentialRootAccess } from "./formulas.js";
import { addBits, startDataBreach } from "./game.js";

// DOM Elements
/** @type {HTMLElement} */
let bitsDisplay;
/** @type {HTMLElement} */
let gpsDisplay;
/** @type {HTMLElement} */
let cryptoDisplay;
/** @type {HTMLElement} */
let shopItemList;
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
export let firewallCodeDisplay;
/** @type {HTMLElement} */
let shopCategoriesNav; // New: Container for shop category tabs

/** @type {HTMLInputElement} */
let firewallInput;
export function getFirewallInput() { return firewallInput; }
export function setFirewallInput(element) { firewallInput = element; }

// Shop Pagination State
let shopCurrentPage = 1;
const shopItemsPerPage = 5; // Display 5 upgrades per page
let currentShopCategory = 'All'; // Default category set to All

export function nextShopPage() {
    const gameState = getGameState();
    const allUpgrades = Object.values(gameState.upgrades);
    const filteredUpgrades = allUpgrades.filter(upgrade => {
        if (currentShopCategory === 'All') return true;
        return upgrade.category === currentShopCategory;
    });
    const totalUpgrades = filteredUpgrades.length;
    const maxPage = Math.ceil(totalUpgrades / shopItemsPerPage);
    if (shopCurrentPage < maxPage) {
        shopCurrentPage++;
        renderShop(buyUpgrade);
    }
}

export function prevShopPage() {
    if (shopCurrentPage > 1) {
        shopCurrentPage--;
        renderShop(buyUpgrade);
    }
}

export function switchShopCategory(category) {
    if (currentShopCategory !== category) {
        currentShopCategory = category;
        shopCurrentPage = 1; // Reset page on category switch
        renderShop(buyUpgrade);
    }
}

/**
 * Safely get DOM element by ID with type assertion
 * @template {HTMLElement} T
 * @param {string} id - Element ID
 * @param {new() => T} [type] - Optional type constructor
 * @returns {T|null} Element or null if not found
 */
function getElementById(id, type) {
    const element = document.getElementById(id);
    if (!element) return null;
    return /** @type {T} */ (element);
}

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
    shopItemList = /** @type {HTMLElement} */ (document.getElementById('shop-item-list')); // Renamed
    shopCategoriesNav = /** @type {HTMLElement} */ (document.getElementById('shop-categories-nav')); // New
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


    // Debug Buttons (only in non-deployed environments)
    const isDeployed = window.location.hostname === 'cycle03.github.io';
    if (!isDeployed) {
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
    }

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
    // Handle invalid inputs
    if (typeof num !== 'number' || isNaN(num)) {
        return '0';
    }
    
    // Handle Infinity
    if (!isFinite(num)) {
        return num > 0 ? '∞' : '-∞';
    }
    
    // Handle negative numbers
    const isNegative = num < 0;
    const absNum = Math.abs(num);
    
    if (absNum < 1000) {
        return (isNegative ? '-' : '') + Math.floor(absNum).toLocaleString();
    }

    const suffixes = ["", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc"];
    const suffixNum = Math.floor(("" + Math.floor(absNum)).length / 3);
    
    // Prevent index out of bounds
    if (suffixNum >= suffixes.length) {
        return (isNegative ? '-' : '') + absNum.toExponential(3);
    }

    let shortValue = parseFloat((suffixNum !== 0 ? (absNum / Math.pow(1000, suffixNum)) : absNum).toPrecision(5));
    let shortValueStr = String(shortValue);
    if (shortValue % 1 !== 0) {
        shortValueStr = shortValue.toFixed(3);
    }
    return (isNegative ? '-' : '') + shortValueStr + suffixes[suffixNum];
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
    const gameState = getGameState();
    if (!gameState) {
        console.error("UI: gameState is null in updateDisplay");
        return;
    }
    
    if (bitsDisplay) {
        bitsDisplay.innerText = formatNumber(gameState.bits || 0);
    } else {
        console.error("UI: bitsDisplay is missing in updateDisplay");
    }

    if (gpsDisplay) {
        gpsDisplay.innerText = (gameState.gps || 0).toFixed(1);

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

    // Update shop item progress bars and "BITS needed" text
    const shopItems = shopItemList.querySelectorAll('.upgrade-item');
    const gameStateBits = gameState.bits || 0;

    shopItems.forEach(itemEl => {
        const upgradeId = itemEl.id.replace('upgrade-', '');
        const upgrade = gameState.upgrades[upgradeId];
        if (upgrade) {
            const canAfford = gameStateBits >= upgrade.cost;
            const progressPercent = canAfford ? 100 : Math.min(100, (gameStateBits / upgrade.cost) * 100);
            const bitsNeeded = Math.max(0, upgrade.cost - gameStateBits);

            const progressBar = /** @type {HTMLElement} */ (itemEl.querySelector('.upgrade-progress-bar'));
            const progressText = /** @type {HTMLElement} */ (itemEl.querySelector('.upgrade-progress-text'));
            const costDisplay = /** @type {HTMLElement} */ (itemEl.querySelector('.upgrade-cost'));
            const upgradeInfo = /** @type {HTMLElement} */ (itemEl.querySelector('.upgrade-info'));
            const contributionEl = /** @type {HTMLElement} */ (itemEl.querySelector('.upgrade-contribution'));
            const efficiencyEl = /** @type {HTMLElement} */ (itemEl.querySelector('.upgrade-efficiency'));

            // Update contribution visibility and text
            if (contributionEl) {
                if (upgrade.gps > 0 && upgrade.count > 0) {
                    const contribution = calculateGPSContribution(upgradeId);
                    contributionEl.innerText = `Current: ${contribution.contribution.toFixed(1)} GPS (${contribution.percentage.toFixed(1)}%)`;
                    contributionEl.style.display = 'block';
                } else {
                    contributionEl.style.display = 'none';
                }
            }

            // Update efficiency visibility and text
            if (efficiencyEl) {
                if (upgrade.gps > 0) {
                    const efficiency = calculateEfficiency(upgrade);
                    const rating = getEfficiencyRating(efficiency);
                    efficiencyEl.innerText = rating.text;
                    efficiencyEl.className = `upgrade-efficiency ${rating.class}`;
                    efficiencyEl.style.display = 'flex';
                } else {
                    efficiencyEl.style.display = 'none';
                }
            }


            if (progressBar) progressBar.style.width = `${progressPercent}%`;
            if (progressText) progressText.innerText = `${formatNumber(bitsNeeded)} BITS needed`;

            // Re-evaluate disabled state for the item itself
            if (canAfford) {
                itemEl.classList.remove('disabled');
            } else {
                itemEl.classList.add('disabled');
            }
            
            // Only show progress bar if not affordable
            const progressContainer = itemEl.querySelector('.upgrade-progress-container');
            if (progressContainer) {
                if (canAfford) {
                    progressContainer.style.display = 'block'; // Always show it
                    if (progressText) progressText.innerText = "READY!";
                    if (progressBar) {
                        progressBar.style.width = `100%`;
                        progressBar.style.background = `var(--success-color)`; // Green
                    }
                    upgradeInfo.style.marginBottom = '8px'; // Keep margin consistent
                } else {
                    progressContainer.style.display = 'block';
                    if (progressText) progressText.innerText = `${formatNumber(bitsNeeded)} BITS needed`;
                    if (progressBar) {
                        progressBar.style.width = `${progressPercent}%`;
                        progressBar.style.background = `linear-gradient(90deg, var(--primary-cyan), var(--primary-pink))`;
                    }
                    upgradeInfo.style.marginBottom = '8px'; // Add bottom margin if progress bar is present
                }
            }
        }
    });
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

    el.className = `particle ${randomColor}`; // Corrected class name
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
    const gameState = getGameState();
    const shopCategoriesNav = document.getElementById('shop-categories-nav'); // Get the categories nav element
    if (!shopCategoriesNav) {
        console.error("ERROR: shopCategoriesNav not found!");
        return;
    }

    // Define categories based on upgrade properties (or from a constant if preferred)
    const categories = ['All', 'Production', 'Click']; // Order matters for display
    const categoryDisplayNames = {
        'All': 'ALL UPGRADES',
        'Production': 'PRODUCTION',
        'Click': 'CLICK'
    };

    // Render category tabs
    shopCategoriesNav.innerHTML = '';
    categories.forEach(category => {
        const tabButton = document.createElement('button');
        tabButton.className = `shop-category-btn ${currentShopCategory === category ? 'active' : ''}`;
        tabButton.innerText = categoryDisplayNames[category];
        tabButton.onclick = () => switchShopCategory(category);
        shopCategoriesNav.appendChild(tabButton);
    });

    // Filter upgrades by current category
    const allUpgrades = Object.values(gameState.upgrades);
    const filteredUpgrades = allUpgrades.filter(upgrade => {
        if (currentShopCategory === 'All') return true;
        return upgrade.category === currentShopCategory;
    });
    
    // Sort upgrades by cost
    filteredUpgrades.sort((a, b) => a.cost - b.cost);

    shopItemList.innerHTML = ''; // Clear previous items (renamed from shopContainer)

    const totalUpgrades = filteredUpgrades.length;
    const maxPage = Math.ceil(totalUpgrades / shopItemsPerPage);

    // Ensure current page is valid for the current category
    if (shopCurrentPage > maxPage && maxPage > 0) {
        shopCurrentPage = maxPage;
    } else if (maxPage === 0) {
        shopCurrentPage = 1;
    }


    const startIndex = (shopCurrentPage - 1) * shopItemsPerPage;
    const endIndex = Math.min(startIndex + shopItemsPerPage, totalUpgrades);

    const upgradesToRender = filteredUpgrades.slice(startIndex, endIndex);

    // Render upgrades for the current page and category
    upgradesToRender.forEach(upgrade => {
        const item = document.createElement('div');
        item.className = 'upgrade-item';
        item.id = `upgrade-${upgrade.id}`; // Use upgrade.id directly
        item.onclick = () => buyCallback(upgrade.id);

        let statText = '';
        if (upgrade.gps > 0) {
            statText += `+${upgrade.gps} GPS`;
        }
        if (upgrade.click > 0) {
            if (statText !== '') statText += ', ';
            statText += `+${upgrade.click} Click`;
        }

        // Calculate progress to next purchase
        const canAfford = gameState.bits >= upgrade.cost;
        const progressPercent = canAfford ? 100 : Math.min(100, (gameState.bits / upgrade.cost) * 100);
        const bitsNeeded = Math.max(0, upgrade.cost - gameState.bits);

        // Build contribution text
        const contribution = calculateGPSContribution(upgrade.id);
        let contributionHTML = `
            <div class="upgrade-contribution" style="display: ${upgrade.gps > 0 && upgrade.count > 0 ? 'block' : 'none'};">
                Current: ${contribution.contribution.toFixed(1)} GPS (${contribution.percentage.toFixed(1)}%)
            </div>
        `;

        // Build efficiency badge
        const efficiency = calculateEfficiency(upgrade);
        const rating = getEfficiencyRating(efficiency);
        let efficiencyHTML = `
            <div class="upgrade-efficiency ${rating.class}" style="display: ${upgrade.gps > 0 ? 'flex' : 'none'};">
                ${rating.text}
            </div>
        `;

        // Build progress bar HTML
        const progressBarHTML = `
            <div class="upgrade-progress-container" style="margin-top: 8px; display: ${canAfford ? 'block' : 'block'};">
                <div class="upgrade-progress-bar" style="width: ${progressPercent}%; background: linear-gradient(90deg, var(--primary-cyan), var(--primary-pink)); height: 4px; border-radius: 2px;"></div>
                <div class="upgrade-progress-text" style="font-size: 0.75em; color: #aaa; margin-top: 4px;">
                    ${formatNumber(bitsNeeded)} BITS needed
                </div>
            </div>
        `;

        item.innerHTML = `
    <div class="upgrade-info">
        <h3>${upgrade.name} <span style="font-size:0.8em; color:#fff;">(x${upgrade.count})</span></h3>
        <p>${upgrade.desc} (${statText})</p>
        ${contributionHTML}
        ${progressBarHTML}
    </div>
    <div class="upgrade-cost">
        ${formatNumber(upgrade.cost)} BITS
        ${efficiencyHTML}
    </div>
`;
        shopItemList.appendChild(item); // Appending to shopItemList
    });

    // Add pagination controls
    const paginationHtml = `
            <button class="modal-button" onclick="prevShopPage()" ${shopCurrentPage === 1 ? 'disabled' : ''}>PREV</button>
            <span>Page ${shopCurrentPage} / ${maxPage}</span>
            <button class="modal-button" onclick="nextShopPage()" ${shopCurrentPage === maxPage || maxPage === 0 ? 'disabled' : ''}>NEXT</button>
        `;

    const topPaginationContainer = document.getElementById('shop-pagination-controls');
    if (topPaginationContainer) {
        topPaginationContainer.innerHTML = paginationHtml;
    }

    const bottomPaginationContainer = document.getElementById('shop-pagination-controls-bottom');
    if (bottomPaginationContainer) {
        bottomPaginationContainer.innerHTML = paginationHtml;
    }

    updateShopUI();
}

/**
 * @param {(arg0: string) => void} buyCallback 
 */
export function renderBlackMarket(buyCallback) {
    const gameState = getGameState();
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
    const gameState = getGameState();
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
    const gameState = getGameState();
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
    const gameState = getGameState();
    // Iterate only over currently displayed upgrade items
    const shopItems = shopItemList.querySelectorAll('.upgrade-item');
    shopItems.forEach(itemEl => {
        const upgradeId = itemEl.id.replace('upgrade-', '');
        const upgrade = gameState.upgrades[upgradeId];
        if (upgrade) {
            if (gameState.bits < upgrade.cost) {
                itemEl.classList.add('disabled');
            } else {
                itemEl.classList.remove('disabled');
            }
            // Update progress bar and text for currently displayed items
            const canAfford = gameState.bits >= upgrade.cost;
            const progressPercent = canAfford ? 100 : Math.min(100, (gameState.bits / upgrade.cost) * 100);
            const bitsNeeded = Math.max(0, upgrade.cost - gameState.bits);

            const progressBar = /** @type {HTMLElement} */ (itemEl.querySelector('.upgrade-progress-bar'));
            const progressText = /** @type {HTMLElement} */ (itemEl.querySelector('.upgrade-progress-text'));
            const upgradeInfo = /** @type {HTMLElement} */ (itemEl.querySelector('.upgrade-info'));
            
            if (progressBar) progressBar.style.width = `${progressPercent}%`;
            if (progressText) progressText.innerText = `${formatNumber(bitsNeeded)} BITS needed`;

            const progressContainer = itemEl.querySelector('.upgrade-progress-container');
            if (progressContainer) {
                if (canAfford) {
                    progressContainer.style.display = 'block';
                    if (progressText) progressText.innerText = "READY!";
                    if (progressBar) {
                        progressBar.style.width = `100%`;
                        progressBar.style.background = `var(--success-color)`;
                    }
                    upgradeInfo.style.marginBottom = '8px';
                } else {
                    progressContainer.style.display = 'block';
                    if (progressText) progressText.innerText = `${formatNumber(bitsNeeded)} BITS needed`;
                    if (progressBar) {
                        progressBar.style.width = `${progressPercent}%`;
                        progressBar.style.background = `linear-gradient(90deg, var(--primary-cyan), var(--primary-pink))`;
                    }
                    upgradeInfo.style.marginBottom = '8px';
                }
            }
        }
    });
}

export function renderAchievements() {
    const gameState = getGameState();
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
    const gameState = getGameState();
    if (!gameState || !gameState.statistics) return;

    // Format time as HH:MM:SS
    /** @param {number} seconds */
    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    // Update play time
    const sessionStartTime = gameState.statistics.sessionStartTime || Date.now();
    const currentSessionTime = Math.floor((Date.now() - sessionStartTime) / 1000);
    const totalPlayTime = (gameState.statistics.playTimeSeconds || 0) + currentSessionTime;

    // Update DOM elements
    const statClicks = /** @type {HTMLElement} */ (document.getElementById('stat-clicks'));
    const statBits = /** @type {HTMLElement} */ (document.getElementById('stat-bits'));
    const statTime = /** @type {HTMLElement} */ (document.getElementById('stat-time'));
    const statReboots = /** @type {HTMLElement} */ (document.getElementById('stat-reboots'));
    const statFirewalls = /** @type {HTMLElement} */ (document.getElementById('stat-firewalls'));
    const statFirewallsCleared = /** @type {HTMLElement} */ (document.getElementById('stat-firewalls-cleared'));

    if (statClicks) statClicks.innerText = formatNumber(gameState.statistics.totalClicks || 0);
    if (statBits) statBits.innerText = formatNumber(gameState.statistics.totalBitsEarned || 0);
    if (statTime) statTime.innerText = formatTime(totalPlayTime);
    if (statReboots) statReboots.innerText = String(gameState.statistics.rebootCount || 0);
    if (statFirewalls) statFirewalls.innerText = String(gameState.statistics.firewallsEncountered || 0);
    if (statFirewallsCleared) statFirewallsCleared.innerText = String(gameState.statistics.firewallsCleared || 0);
}

/**
 * @param {number} potentialLevel 
 */
export function updateRebootButton(potentialLevel) {
    const gameState = getGameState();
    if (!gameState || !rebootButton) return;

    const btnText = /** @type {HTMLElement} */ (rebootButton.querySelector('.text'));
    const currentLevel = gameState.rootAccessLevel;
    
    if (potentialLevel > currentLevel) {
        // CAN REBOOT
        if (btnText) btnText.innerText = `REBOOT (LVL ${currentLevel} → ${potentialLevel})`;
        rebootButton.classList.remove('disabled');
        (/** @type {HTMLButtonElement} */ (rebootButton)).disabled = false;
        
        const cryptosGained = potentialLevel - currentLevel;
        if (rebootLevelDisplay) rebootLevelDisplay.innerHTML = `Gain ${cryptosGained} Crypto(s) on reboot.`;
        if (rebootBonusDisplay) rebootBonusDisplay.innerText = `Next Level Bonus: +${potentialLevel * 10}% GPS`;

    } else {
        // CANNOT REBOOT
        if (btnText) btnText.innerText = `REBOOT SYSTEM`;
        rebootButton.classList.add('disabled');
        (/** @type {HTMLButtonElement} */ (rebootButton)).disabled = true;

        const nextLevel = currentLevel + 1;
        const bonusPercent = currentLevel * 10;
        // Formula for required bits for the next level
        const requiredBits = 10000000 * Math.pow(10, nextLevel / 5);
        const bitsToNextLevel = Math.max(0, requiredBits - gameState.lifetimeBits);

        if (rebootLevelDisplay) rebootLevelDisplay.innerHTML = `Root Access: LVL ${currentLevel}<br>(Next: LVL ${nextLevel} at ${formatNumber(requiredBits)} BITS)<br>(${formatNumber(bitsToNextLevel)} BITS remaining)`;
        if (rebootBonusDisplay) rebootBonusDisplay.innerText = `Current Bonus: +${bonusPercent}% GPS`;
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

// Expose pagination functions to the global scope for HTML onclick handlers
window.prevShopPage = prevShopPage;
window.nextShopPage = nextShopPage;
window.switchShopCategory = switchShopCategory;
