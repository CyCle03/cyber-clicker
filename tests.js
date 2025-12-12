// @ts-check
import { getGameState, initState, loadState } from './js/state.js';
import { UPGRADES, SKILL_TREE } from './js/constants.js';
import { addBits, buyUpgrade, calculateGPS, buySkill } from './js/game.js';
import { calculatePotentialRootAccess } from './js/formulas.js'; // Import from formulas.js
import { initUI, renderShop, updateShopUI, updateRebootButton } from './js/ui.js'; // Import initUI
import { SoundManager } from './js/sound.js';

(function () {
    // Keep test output clean: filter noisy DEBUG logs during tests only.
    /** @type {typeof console.log} */
    const originalConsoleLog = console.log.bind(console);
    /** @type {typeof console.debug} */
    const originalConsoleDebug = (console.debug || console.log).bind(console);

    /** @param {any[]} args */
    function shouldSuppressConsoleArgs(args) {
        return typeof args[0] === 'string' && args[0].startsWith('DEBUG:');
    }

    console.log = (...args) => {
        if (shouldSuppressConsoleArgs(args)) return;
        originalConsoleLog(...args);
    };

    console.debug = (...args) => {
        if (shouldSuppressConsoleArgs(args)) return;
        originalConsoleDebug(...args);
    };

    // Tests should not depend on or overwrite the player's real save.
    try {
        localStorage.removeItem('cyberClickerSave');
    } catch (e) {
        // Ignore storage access errors in restricted environments
    }

    // Prevent AudioContext warnings during tests.
    try {
        SoundManager.muted = true;
        SoundManager.playSFX = function () { };
        SoundManager.playTone = function () { };
    } catch (e) {
        // Ignore if sound manager is unavailable
    }

    const resultsDiv = /** @type {HTMLElement} */ (document.getElementById('test-results'));
    let passed = 0;
    let failed = 0;

    initUI(); // Initialize UI elements

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

    test("State | Initial State", () => {
        const gameState = getGameState();
        assert(gameState.bits === 0, "Bits should start at 0");
        assert(gameState.gps === 0, "GPS should start at 0");
        assert(gameState.clickPower === 1, "Click Power should start at 1");
    });

    test("State | Get Game State", () => {
        const gameState = getGameState();
        gameState.bits = 100;
        const newGameState = getGameState();
        assert(newGameState.bits === 100, "getGameState should return the mutated state");
    });
    
    test("State | Load State", () => {
        const savedData = {
            bits: 123,
            lifetimeBits: 456,
            rootAccessLevel: 1,
            cryptos: 789,
            permanentMultiplier: 1.2,
            offlineMultiplier: 1.5,
            skillPoints: 5,
            lastSaveTime: Date.now(),
            tutorialSeen: true,
            autoGlitchEnabled: true,
            skills: { "click_efficiency": 1 },
            upgrades: { "autoClicker": { "count": 2 } },
            achievements: [{ "id": "first_click", "unlocked": true }],
            storyEvents: [{ "id": "first_click", "triggered": true }],
            activeBoosts: [],
            activeClickBoosts: [],
            statistics: {
                totalClicks: 100,
                totalBitsEarned: 1000,
                playTimeSeconds: 3600,
                rebootCount: 1,
                firewallsEncountered: 2,
                firewallsCleared: 1,
            }
        };

        loadState(savedData);
        const gameState = getGameState();

        assert(gameState.bits === 123, "Loaded bits should be 123");
        assert(gameState.lifetimeBits === 456, "Loaded lifetimeBits should be 456");
        assert(gameState.cryptos === 789, "Loaded cryptos should be 789");
        assert(gameState.permanentMultiplier === 1.2, "Loaded permanentMultiplier should be 1.2");
        assert(gameState.offlineMultiplier === 1.5, "Loaded offlineMultiplier should be 1.5");
        assert(gameState.skillPoints === 5, "Loaded skillPoints should be 5");
        assert(gameState.tutorialSeen === true, "Loaded tutorialSeen should be true");
        assert(gameState.autoGlitchEnabled === true, "Loaded autoGlitchEnabled should be true");
        assert(gameState.skills["click_efficiency"] === 1, "Loaded skills should contain click_efficiency level 1");
        assert(gameState.upgrades["autoClicker"].count === 2, "Loaded upgrades should contain autoClicker count 2");
        assert(gameState.achievements.find(a => a.id === "first_click")?.unlocked === true, "Loaded achievements should contain first_click unlocked");
        assert(gameState.storyEvents.find(e => e.id === "first_click")?.triggered === true, "Loaded storyEvents should contain first_click triggered");
        assert(gameState.statistics.totalClicks === 100, "Loaded statistics should contain totalClicks 100");
    });

    test("Game | Add Bits", () => {
        const gameState = getGameState();
        addBits(100);
        assert(gameState.bits === 100, "Bits should increase by 100");
        assert(gameState.lifetimeBits === 100, "Lifetime bits should increase by 100");
    });

    test("Game | Buy Upgrade - Success", () => {
        const gameState = getGameState();
        gameState.bits = 1000;
        buyUpgrade("clicker"); // Cost 30
        assert(gameState.upgrades.clicker.count === 1, "Clicker count should be 1");
        assert(gameState.bits === 970, "Bits should decrease by upgrade cost");
    });

    test("Game | Buy Upgrade - Insufficient Funds", () => {
        const gameState = getGameState();
        gameState.bits = 10;
        buyUpgrade("clicker"); // Cost 30
        assert(gameState.upgrades.clicker.count === 0, "Clicker count should remain 0");
        assert(gameState.bits === 10, "Bits should remain 10");
    });

    test("Game | Calculate GPS", () => {
        const gameState = getGameState();
        gameState.upgrades.autoClicker.count = 10; // 0.1 GPS each
        gameState.upgrades.bot.count = 2; // 1 GPS each
        calculateGPS();
        assert(gameState.gps === (10 * 0.1 + 2 * 1), "GPS should be sum of upgrade GPS"); // 1 + 2 = 3
    });

    test("Game | Calculate GPS with Root Access Bonus", () => {
        const gameState = getGameState();
        gameState.rootAccessLevel = 1; // +10% GPS
        gameState.upgrades.autoClicker.count = 10;
        calculateGPS();
        assert(gameState.gps === (10 * 0.1 * 1.1), "GPS should include root access bonus");
    });

    test("Game | Calculate Potential Root Access - No Skill", () => {
        const gameState = getGameState();
        gameState.lifetimeBits = 10000000; // Base requirement for level 1 (with new formula adjustment)
        let potential = calculatePotentialRootAccess();
        assert(potential === 0, "Should be 0 for exactly 10M bits");

        gameState.lifetimeBits = 10000000 * Math.pow(10, 1/5) + 1; // Slightly more than required for level 1
        potential = calculatePotentialRootAccess();
        assert(potential === 1, "Should be 1 for enough bits for level 1");
    });

    test("Game | Calculate Potential Root Access - With Prestige Master Skill", () => {
        const gameState = getGameState();
        gameState.skills.prestige_master = 1; // 10% reduction
        gameState.lifetimeBits = 10000000 * Math.pow(10, 1/5) * 0.9 + 1; // 90% of required for level 1
        let potential = calculatePotentialRootAccess();
        assert(potential === 1, "Should be 1 with skill reduction");

    });

    test("Game | Buy Skill - Success", () => {
        const gameState = getGameState();
        gameState.skillPoints = 5;
        buySkill("click_efficiency"); // Cost 1
        assert(gameState.skills.click_efficiency === 1, "Click efficiency skill level should be 1");
        assert(gameState.skillPoints === 4, "Skill points should decrease by skill cost");
    });

    test("Game | Buy Skill - Insufficient Points", () => {
        const gameState = getGameState();
        gameState.skillPoints = 0;
        buySkill("click_efficiency"); // Cost 1
        assert(gameState.skills.click_efficiency === 0, "Click efficiency skill level should remain 0");
        assert(gameState.skillPoints === 0, "Skill points should remain 0");
    });

    test("Game | Buy Skill - Maxed Out", () => {
        const gameState = getGameState();
        gameState.skillPoints = 10;
        gameState.skills.click_efficiency = SKILL_TREE.click_efficiency.maxLevel;
        buySkill("click_efficiency");
        assert(gameState.skills.click_efficiency === SKILL_TREE.click_efficiency.maxLevel, "Click efficiency skill level should remain maxed");
    });

    test("UI | Shop - Disabled when unaffordable, clickable again when affordable", () => {
        const gameState = getGameState();

        // Ensure shop is rendered with the buy callback captured.
        gameState.bits = 0;
        renderShop(buyUpgrade);

        const clickerEl = /** @type {HTMLElement|null} */ (document.getElementById('upgrade-clicker'));
        assert(!!clickerEl, "Clicker element should exist after renderShop");
        if (!clickerEl) throw new Error('Clicker element missing');

        assert(clickerEl.classList.contains('disabled'), "Unaffordable item should be disabled");
        assert(clickerEl.onclick === null, "Unaffordable item should not be clickable");

        // Become affordable; UI should restore click handler.
        gameState.bits = 1000;
        updateShopUI();
        assert(!clickerEl.classList.contains('disabled'), "Affordable item should no longer be disabled");
        assert(typeof clickerEl.onclick === 'function', "Affordable item should be clickable");

        // Simulate click and ensure upgrade was purchased.
        clickerEl.click();
        assert(gameState.upgrades.clicker.count === 1, "Clicking should purchase the upgrade");
    });

    test("UI | Reboot Display - Shows remaining bits and READY state", () => {
        const gameState = getGameState();
        const rebootLevelDisplay = /** @type {HTMLElement|null} */ (document.getElementById('reboot-level-display'));
        assert(!!rebootLevelDisplay, "reboot-level-display should exist");
        if (!rebootLevelDisplay) throw new Error('reboot-level-display missing');

        // Not ready case
        gameState.rootAccessLevel = 0;
        gameState.lifetimeBits = 0;
        updateRebootButton(calculatePotentialRootAccess());
        assert(rebootLevelDisplay.innerHTML.includes('Remaining:'), "Reboot display should include Remaining bits");
        assert(rebootLevelDisplay.innerHTML.includes('Next:'), "Reboot display should include Next level info");

        // Ready case
        const nextLevel = gameState.rootAccessLevel + 1;
        const requiredBits = 10000000 * Math.pow(10, nextLevel / 5);
        gameState.lifetimeBits = requiredBits + 1;
        updateRebootButton(calculatePotentialRootAccess());
        assert(rebootLevelDisplay.innerHTML.includes('READY'), "Reboot display should show READY when potential level increases");
    });

    // Summary
    const summary = document.createElement('div');
    summary.className = 'summary';
    summary.innerText = `Total: ${passed + failed}, Passed: ${passed}, Failed: ${failed}`;
    resultsDiv.appendChild(summary);

})();