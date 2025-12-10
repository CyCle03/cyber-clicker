// @ts-check
import { gameState, initState } from './js/state.js';
import { UPGRADES, SKILL_TREE } from './js/constants.js';
import { addBits, buyUpgrade, calculateGPS, calculatePotentialRootAccess, buySkill } from './js/game.js';

(function () {
    const resultsDiv = /** @type {HTMLElement} */ (document.getElementById('test-results'));
    let passed = 0;
    let failed = 0;

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

    /**
     * @param {string} name 
     * @param {boolean} isPass 
     * @param {string} [errorMsg] 
     */
    function logResult(name, isPass, errorMsg = "") {
        const div = document.createElement('div');
        div.className = isPass ? 'pass' : 'fail';
        div.innerText = `[${isPass ? 'PASS' : 'FAIL'}] ${name} ${errorMsg ? '- ' + errorMsg : ''}`;
        resultsDiv.appendChild(div);
    }

    function resetGameState() {
        // Reset global gameState object
        initState();
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
        // Formula: floor(log10(adjustedBits / 10,000,000) * 5)
        // Target Level 1: 10,000,000 bits
        gameState.lifetimeBits = 10000000;
        let level = calculatePotentialRootAccess();
        assert(level === 0, "10M bits should give Level 0 Root Access");

        gameState.lifetimeBits = 10000000 * Math.pow(10, 1/5);
        level = calculatePotentialRootAccess();
        assert(level === 1, "Correct bits for level 1 root access");
    });

    test("Buy Skill - Success", () => {
        gameState.skillPoints = 2;
        // Assume 'click_efficiency' exists
        if (!SKILL_TREE.click_efficiency) {
            throw new Error("click_efficiency skill not found in SKILL_TREE");
        }

        buySkill('click_efficiency');

        assert(gameState.skillPoints === 1, "Skill point should be deducted (2 - 1 = 1)");
        assert(gameState.skills.click_efficiency === 1, "Skill level should increase to 1");
    });

    test("Buy Skill - Insufficient Points", () => {
        gameState.skillPoints = 0;
        gameState.skills.click_efficiency = 0;

        buySkill('click_efficiency');

        assert(gameState.skillPoints === 0, "Skill points should remain 0");
        assert(gameState.skills.click_efficiency === 0, "Skill level should not increase");
    });

    // Summary
    const summary = document.createElement('div');
    summary.className = 'summary';
    summary.innerText = `Total: ${passed + failed}, Passed: ${passed}, Failed: ${failed}`;
    resultsDiv.appendChild(summary);

})();