// @ts-check

const resultsDiv = /** @type {HTMLElement} */ (document.getElementById('test-results'));
let passed = 0;
let failed = 0;

// @ts-ignore
const gameState = window.gameState || {};
// @ts-ignore
const UPGRADES = window.UPGRADES || {};
// @ts-ignore
const addBits = window.addBits || (() => { });
// @ts-ignore
const buyUpgrade = window.buyUpgrade || (() => { });
// @ts-ignore
const calculateGPS = window.calculateGPS || (() => { });
// @ts-ignore
const calculatePotentialRootAccess = window.calculatePotentialRootAccess || (() => { });

/**
 * @param {string} name 
 * @param {function():void} fn 
 */
function test(name, fn) {
    try {
        // Reset Game State before each test
        resetGameState();
        fn();
        logResult(name, true);
        passed++;
    } catch (e) {
        logResult(name, false, /** @type {Error} */(e).message);
        failed++;
        console.error(e);
    }
}

/**
 * @param {boolean} condition 
 * @param {string} message 
 */
function assert(condition, message) {
    if (!condition) {
        throw new Error(message || "Assertion failed");
    }
}

function logResult(name, isPass, errorMsg = "") {
    const div = document.createElement('div');
    div.className = isPass ? 'pass' : 'fail';
    div.innerText = `[${isPass ? 'PASS' : 'FAIL'}] ${name} ${errorMsg ? '- ' + errorMsg : ''}`;
    resultsDiv.appendChild(div);
}

function resetGameState() {
    // Reset global gameState object
    gameState.bits = 0;
    gameState.lifetimeBits = 0;
    gameState.gps = 0;
    gameState.clickPower = 1;
    gameState.rootAccessLevel = 0;
    gameState.cryptos = 0;
    gameState.permanentMultiplier = 1;
    gameState.upgrades = JSON.parse(JSON.stringify(UPGRADES)); // Deep copy
    gameState.activeBoosts = [];
    gameState.statistics = {
        totalClicks: 0,
        totalBitsEarned: 0,
        playTimeSeconds: 0,
        rebootCount: 0,
        firewallsEncountered: 0,
        firewallsCleared: 0,
        sessionStartTime: Date.now()
    };
}

// --- TESTS ---

test("Initial State", () => {
    assert(gameState.bits === 0, "Bits should start at 0");
    assert(gameState.gps === 0, "GPS should start at 0");
    assert(gameState.clickPower === 1, "Click Power should start at 1");
});

test("Add Bits", () => {
    addBits(10);
    assert(gameState.bits === 10, "Adding 10 bits should result in 10 bits");
    assert(gameState.lifetimeBits === 10, "Lifetime bits should increase");
    assert(gameState.statistics.totalBitsEarned === 10, "Statistics should update");
});

test("Buy Upgrade - Cost Deduction", () => {
    gameState.bits = 100;
    buyUpgrade('autoClicker'); // Cost 15
    assert(gameState.bits === 85, "Bits should be deducted (100 - 15 = 85)");
    assert(gameState.upgrades.autoClicker.count === 1, "Upgrade count should increase");
});

test("Buy Upgrade - Cost Scaling", () => {
    gameState.bits = 1000;
    const initialCost = gameState.upgrades.autoClicker.cost; // 15
    buyUpgrade('autoClicker');
    const newCost = gameState.upgrades.autoClicker.cost;
    assert(newCost > initialCost, "Cost should increase after purchase");
    // Cost scaling is usually * 1.15
    assert(Math.abs(newCost - (initialCost * 1.15)) < 0.1, "Cost should scale by 1.15x");
});

test("Calculate GPS", () => {
    gameState.upgrades.autoClicker.count = 10; // 0.1 GPS each -> 1.0 GPS
    gameState.upgrades.bot.count = 1; // 1.0 GPS each -> 1.0 GPS
    calculateGPS();
    // Total GPS = 2.0
    assert(Math.abs(gameState.gps - 2.0) < 0.01, "GPS should be calculated correctly (2.0)");
});

test("Root Access Calculation", () => {
    // Formula: floor(cbrt(lifetimeBits / 1,000,000))
    // Target Level 1: 1,000,000 bits
    gameState.lifetimeBits = 1000000;
    const level = calculatePotentialRootAccess();
    assert(level === 1, "1M bits should give Level 1 Root Access");

    // Target Level 2: 8,000,000 bits (2^3 * 1M)
    gameState.lifetimeBits = 8000000;
    const level2 = calculatePotentialRootAccess();
    assert(level2 === 2, "8M bits should give Level 2 Root Access");
});

// Summary
const summary = document.createElement('div');
summary.className = 'summary';
summary.innerText = `Total: ${passed + failed}, Passed: ${passed}, Failed: ${failed}`;
resultsDiv.appendChild(summary);
