import { gameState } from './state.js';

// DOM Elements
// DOM Elements
let bitsDisplay, gpsDisplay, cryptoDisplay, shopContainer, blackMarketContainer, gameLog, achievementsContainer, rebootButton, hackButton;

export function initUI() {
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

// Tab Logic
// Tab Logic (moved to initUI to be safe, though querySelectorAll is safe)
// We will keep it here but ensure it runs after DOM load if we wanted, but since it's top level it runs on import.
// Let's move it to initUI to be consistent.

// Helper Functions
function formatNumber(num) {
    return Math.floor(num).toLocaleString();
}

export function logMessage(msg) {
    const div = document.createElement('div');
    div.className = 'log-entry';
    div.innerText = `> ${msg}`;
    gameLog.prepend(div);

    if (gameLog.children.length > 20) {
        gameLog.lastElementChild.remove();
    }
}

export function updateDisplay() {
    if (bitsDisplay) {
        bitsDisplay.innerText = formatNumber(gameState.bits);
    } else {
        console.error("UI: bitsDisplay is missing in updateDisplay");
        // logMessage("ERROR: bitsDisplay missing"); // Be careful not to loop if logMessage uses updateDisplay? No it doesn't.
    }

    if (gpsDisplay) gpsDisplay.innerText = gameState.gps.toFixed(1);
    if (cryptoDisplay) cryptoDisplay.innerText = formatNumber(gameState.cryptos);
}

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

export function createFloatingText(x, y, text) {
    const el = document.createElement('div');
    el.className = 'floating-text';
    el.innerText = text;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    document.body.appendChild(el);

    setTimeout(() => el.remove(), 1000);
}

export function renderShop(buyCallback) {
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

export function renderBlackMarket(buyCallback) {
    blackMarketContainer.innerHTML = '';
    import('./constants.js').then(module => {
        const BLACK_MARKET_ITEMS = module.BLACK_MARKET_ITEMS;
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
    });
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

export function showAchievementNotification(ach) {
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

export function updateRebootButton(potentialLevel) {
    if (potentialLevel > gameState.rootAccessLevel) {
        rebootButton.innerText = `REBOOT (GAIN LEVEL ${potentialLevel})`;
        rebootButton.style.opacity = 1;
    } else {
        rebootButton.innerText = `REBOOT (REQ: ${formatNumber((gameState.rootAccessLevel + 1) * (gameState.rootAccessLevel + 1) * 1000000)} BITS)`;
        rebootButton.style.opacity = 0.5;
    }
}

export function flashBitsDisplay() {
    const originalColor = bitsDisplay.style.color;
    bitsDisplay.style.color = '#00ff41';
    setTimeout(() => bitsDisplay.style.color = originalColor, 200);
}

export function animateHackButton() {
    hackButton.style.transform = 'scale(0.95)';
    setTimeout(() => hackButton.style.transform = 'scale(1)', 50);
}
