// @ts-check
import { initState, loadState, getGameState } from './state.js';
import { initUI, logMessage, updateDisplay, renderShop, renderBlackMarket, renderSkillTree, renderAchievements, animateHackButton, createBinaryParticle, firewallInput, formatNumber, updateRebootButton } from './ui.js';
import { loadGame, saveGame } from './storage.js';
import { addBits, calculateGPS, calculateClickPower, buyUpgrade, buyBlackMarketItem, buySkill, rebootSystem, handleKeypadInput, initDataBreach, showTutorial, spawnFirewall, spawnGlitch, checkFirewallInput } from './game.js';
import { SoundManager } from './sound.js';
import { calculatePotentialRootAccess } from './formulas.js';

let gameLoopId;
let autoSaveId;
let eventLoopId;
let rebootBtnId;

// Initialization
function init() {
    try {
        const gameState = getGameState();
        // Clear existing intervals if any (for reboot)
        if (gameLoopId) cancelAnimationFrame(gameLoopId);
        if (autoSaveId) clearInterval(autoSaveId);
        if (eventLoopId) clearInterval(eventLoopId);
        if (rebootBtnId) clearInterval(rebootBtnId);

        initUI(); // Initialize UI elements first

        // Firewall Input Listener
        if (firewallInput && firewallInput.parentNode) {
            // Remove old listener
            const newInput = /** @type {HTMLInputElement} */ (firewallInput.cloneNode(true));
            firewallInput.parentNode.replaceChild(newInput, firewallInput);
            firewallInput = newInput;

            firewallInput.addEventListener('input', checkFirewallInput);
        }

        // Global Keydown Listener for Firewall
        document.addEventListener('keydown', (e) => {
            if (getGameState().firewallActive) {
                const key = e.key.toUpperCase();
                if ("0123456789ABCDEF".includes(key) && firewallInput.value.length < 4) {
                    firewallInput.value += key;
                    checkFirewallInput();
                } else if (e.key === 'Backspace') {
                    firewallInput.value = firewallInput.value.slice(0, -1);
                } else if (e.key === 'Enter') {
                    checkFirewallInput();
                }
            }
        });


        const hasSave = loadGame();
        if (!hasSave) {
            initState();
            showTutorial();
        }

        initDataBreach();
        SoundManager.init();

        // Calculate offline progress
        const now = Date.now();
        const offlineTime = now - getGameState().lastSaveTime;
        if (offlineTime > 10000) { // More than 10 seconds
            const offlineGps = getGameState().gps * (getGameState().offlineMultiplier || 1);
            const offlineBits = Math.floor((offlineGps * offlineTime) / 1000);
            if (offlineBits > 0) {
                addBits(offlineBits);
                const offlineOverlay = document.getElementById('offline-overlay');
                if (offlineOverlay) {
                    const offlineAmount = document.getElementById('offline-amount-display');
                    const offlineTimeDisplay = document.getElementById('offline-time-display');
                    if (offlineAmount) offlineAmount.innerText = `+${formatNumber(offlineBits)} BITS`;
                    if (offlineTimeDisplay) offlineTimeDisplay.innerText = `Time Offline: ${Math.floor(offlineTime / 1000)}s`;
                    offlineOverlay.classList.add('visible');
                }
            }
        }


        // Re-calculate all derived stats
        calculateGPS();
        calculateClickPower();

        // Initial Render
        updateDisplay();
        renderShop(buyUpgrade);
        renderBlackMarket(buyBlackMarketItem);
        renderSkillTree(buySkill);
        renderAchievements();

        // Event Listeners
        const hackButton = document.getElementById('hack-button');
        if (hackButton) {
            hackButton.addEventListener('click', () => {
                addBits(getGameState().clickPower);
                if (getGameState().statistics) {
                    getGameState().statistics.totalClicks++;
                }
                SoundManager.playSFX('click');
                animateHackButton();
                for (let i = 0; i < 3; i++) {
                    createBinaryParticle(window.innerWidth / 2, window.innerHeight / 2);
                }
            });
        }

        const rebootBtn = document.getElementById('reboot-button');
        if (rebootBtn) {
            rebootBtn.addEventListener('click', rebootSystem);
        }

        // Start Game Loops
        gameLoopId = requestAnimationFrame(gameLoop);
        autoSaveId = setInterval(saveGame, 15000); // Save every 15s
        eventLoopId = setInterval(() => {
            if (Math.random() < 0.1) spawnFirewall();
        }, 60000); // Check for firewall every minute
        rebootBtnId = setInterval(() => updateRebootButton(calculatePotentialRootAccess()), 5000);

        spawnGlitch();
        logMessage("System Online.");
        if (hasSave) {
            logMessage("Save data loaded.");
        }

    } catch (e) {
        console.error("Initialization failed:", e);
        logMessage(`ERROR: ${e.message}`);
    }
}

// Game Loop
let lastTimestamp = 0;
function gameLoop(timestamp) {
    if (!lastTimestamp) lastTimestamp = timestamp;
    const deltaTime = (timestamp - lastTimestamp) / 1000; // seconds
    lastTimestamp = timestamp;

    addBits(getGameState().gps * deltaTime);
    updateDisplay();

    gameLoopId = requestAnimationFrame(gameLoop);
}

// Start on DOM Load
document.addEventListener('DOMContentLoaded', init);