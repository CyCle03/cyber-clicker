// @ts-check
import { getGameState, initState, loadState } from '../js/state.js';

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
            achievements: [{ "id": "click1", "unlocked": true }],
            storyEvents: [{ "id": "intro", "triggered": true }],
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
        assert(gameState.rootAccessLevel === 1, "Loaded rootAccessLevel should be 1");
        assert(gameState.cryptos === 0, "Loaded cryptos should be 0");
        assert(gameState.permanentMultiplier === 1, "Loaded permanentMultiplier should be 1");
        assert(gameState.offlineMultiplier === 1, "Loaded offlineMultiplier should be 1");
        assert(gameState.skillPoints === 5, "Loaded skillPoints should be 5");
        assert(gameState.tutorialSeen === true, "Loaded tutorialSeen should be true");
        assert(gameState.autoGlitchEnabled === true, "Loaded autoGlitchEnabled should be true");
        assert(gameState.skills["click_efficiency"] === 1, "Loaded skills should contain click_efficiency level 1");
        assert(gameState.upgrades["autoClicker"].count === 2, "Loaded upgrades should contain autoClicker count 2");
        assert(gameState.achievements.find(a => a.id === "click1")?.unlocked === true, "Loaded achievements should contain click1 unlocked");
        assert(gameState.storyEvents.find(e => e.id === "intro")?.triggered === true, "Loaded storyEvents should contain intro triggered");
        assert(gameState.statistics.totalClicks === 100, "Loaded statistics should contain totalClicks 100");
    });

    // Summary
    const summary = document.createElement('div');
    summary.className = 'summary';
    summary.innerText = `Total: ${passed + failed}, Passed: ${passed}, Failed: ${failed}`;
    resultsDiv.appendChild(summary);

})();
