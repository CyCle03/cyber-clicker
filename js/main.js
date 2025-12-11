// @ts-check
import { initState, loadState, getGameState } from './state.js';
import { initUI, logMessage, updateDisplay, renderShop, renderBlackMarket, renderSkillTree, renderAchievements, animateHackButton, createBinaryParticle, getFirewallInput, setFirewallInput, formatNumber, updateRebootButton, switchTab } from './ui.js';
import { loadGame, saveGame } from './storage.js';
import { addBits, calculateGPS, calculateClickPower, buyUpgrade, buyBlackMarketItem, buySkill, rebootSystem, initDataBreach, showTutorial, spawnFirewall, spawnGlitch, checkFirewallInput } from './game.js';
import { SoundManager } from './sound.js';
import { calculatePotentialRootAccess } from './formulas.js';
import { GAME_CONSTANTS } from './constants.js';

let gameLoopId;
let autoSaveId;
let eventLoopId;
let rebootBtnId;
let firewallKeydownHandler = null;
/** @type {(() => void) | null} */
let _hackButtonListener = null;
/** @type {(() => void) | null} */
let _rebootButtonListener = null;
/** @type {((event: Event) => void) | null} */
let _firewallInputListener = null;
let audioContextResumed = false;

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
        let currentFirewallInputEl = getFirewallInput();
        if (currentFirewallInputEl) {
            // Remove previous listener if it exists to prevent duplicates on re-init
            if (_firewallInputListener) {
                currentFirewallInputEl.removeEventListener('input', _firewallInputListener);
            }
            // Create a new handler to ensure 'this' context if needed, or just bind checkFirewallInput
            const newFirewallInputHandler = () => checkFirewallInput();
            currentFirewallInputEl.addEventListener('input', newFirewallInputHandler);
            _firewallInputListener = newFirewallInputHandler; // Store reference to the handler
        }

        // Global Keydown Listener for Firewall - Remove old listener if exists
        if (firewallKeydownHandler) {
            document.removeEventListener('keydown', firewallKeydownHandler);
        }
        
        firewallKeydownHandler = (e) => {
            if (getGameState().firewallActive) {
                const firewallInputEl = getFirewallInput();
                if (!firewallInputEl) return;
                
                const key = e.key.toUpperCase();
                if ("0123456789ABCDEF".includes(key) && firewallInputEl.value.length < 4) {
                    firewallInputEl.value += key;
                    checkFirewallInput();
                    e.preventDefault(); // Prevent default browser action (e.g., scrolling)
                    e.stopPropagation(); // Stop event from bubbling up to other listeners
                } else if (e.key === 'Backspace') {
                    firewallInputEl.value = firewallInputEl.value.slice(0, -1);
                    e.preventDefault(); // Prevent default browser action
                    e.stopPropagation(); // Stop event from bubbling up
                } else if (e.key === 'Enter') {
                    checkFirewallInput();
                    e.preventDefault(); // Prevent default browser action (e.g., form submission)
                    e.stopPropagation(); // Stop event from bubbling up
                }
            }
        };
        
        document.addEventListener('keydown', firewallKeydownHandler);
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Don't trigger shortcuts when typing in input fields
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }
            
            // Spacebar: Click hack button
            if (e.code === 'Space' && !e.repeat) {
                e.preventDefault();
                const hackButton = document.getElementById('hack-button');
                if (hackButton && !hackButton.disabled) {
                    hackButton.click();
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
        const offlineTimeMs = now - getGameState().lastSaveTime;
        
        if (offlineTimeMs > GAME_CONSTANTS.OFFLINE_PROGRESS_THRESHOLD) { // More than 10 seconds
            // Cap offline time to prevent excessive gains
            const cappedOfflineTimeMs = Math.min(offlineTimeMs, GAME_CONSTANTS.MAX_OFFLINE_TIME_MS);
            const offlineGps = getGameState().gps * (getGameState().offlineMultiplier || 1);
            const offlineBits = Math.floor((offlineGps * cappedOfflineTimeMs) / 1000);
            
            if (offlineBits > 0) {
                addBits(offlineBits);
                const offlineOverlay = document.getElementById('offline-overlay');
                if (offlineOverlay) {
                    const offlineAmount = document.getElementById('offline-amount-display');
                    const offlineTimeDisplay = document.getElementById('offline-time-display');
                    if (offlineAmount) offlineAmount.innerText = `+${formatNumber(offlineBits)} BITS`;
                    if (offlineTimeDisplay) {
                        const formattedTime = formatOfflineTime(offlineTimeMs);
                        offlineTimeDisplay.innerText = `Time Offline: ${formattedTime}`;
                    }
                    offlineOverlay.classList.add('visible');
                    setTimeout(() => {
                        offlineOverlay.classList.remove('visible');
                    }, GAME_CONSTANTS.OFFLINE_OVERLAY_DISPLAY_DURATION);
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

        // Event Listeners - Clone nodes to prevent duplicate listeners
        let hackButtonHandler = () => {
            if (!audioContextResumed) {
                SoundManager.resumeAudioContext();
                audioContextResumed = true;
            }
            addBits(getGameState().clickPower);
            // Update click statistics
            const gameState = getGameState();
            if (gameState && gameState.statistics) {
                gameState.statistics.totalClicks = (gameState.statistics.totalClicks || 0) + 1;
            }
            SoundManager.playSFX('click');
            animateHackButton();
            for (let i = 0; i < GAME_CONSTANTS.BINARY_PARTICLE_COUNT; i++) {
                createBinaryParticle(window.innerWidth / 2, window.innerHeight / 2);
            }
        };

        const hackButton = document.getElementById('hack-button');
        if (hackButton) {
            // Remove previous listener if it exists to prevent duplicates on re-init
            if (_hackButtonListener) {
                hackButton.removeEventListener('click', _hackButtonListener);
            }
            hackButton.addEventListener('click', hackButtonHandler);
            _hackButtonListener = hackButtonHandler; // Store reference to the handler
        }

        const rebootBtn = document.getElementById('reboot-button');
        if (rebootBtn) {
            // Remove previous listener if it exists to prevent duplicates on re-init
            if (_rebootButtonListener) {
                rebootBtn.removeEventListener('click', _rebootButtonListener);
            }
            rebootBtn.addEventListener('click', rebootSystem);
            _rebootButtonListener = rebootSystem; // Store reference to the handler
        }

        // Start Game Loops
        gameLoopId = requestAnimationFrame(gameLoop);
        autoSaveId = setInterval(saveGame, GAME_CONSTANTS.AUTO_SAVE_INTERVAL); // Save every 15s
        eventLoopId = setInterval(() => {
            if (Math.random() < GAME_CONSTANTS.FIREWALL_SPAWN_CHANCE) spawnFirewall();
        }, GAME_CONSTANTS.EVENT_LOOP_INTERVAL); // Check for firewall every minute
        rebootBtnId = setInterval(() => updateRebootButton(calculatePotentialRootAccess()), GAME_CONSTANTS.REBOOT_BUTTON_UPDATE_INTERVAL);

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

// Format offline time for display
/**
 * @param {number} timeMs - Time in milliseconds
 * @returns {string} Formatted time string
 */
function formatOfflineTime(timeMs) {
    const seconds = Math.floor(timeMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
        return `${days}d ${hours % 24}h ${minutes % 60}m`;
    } else if (hours > 0) {
        return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`;
    } else {
        return `${seconds}s`;
    }
}

// Game Loop
let lastTimestamp = 0;
let lastUpdateTime = 0;
const UPDATE_INTERVAL = GAME_CONSTANTS.UI_UPDATE_INTERVAL; // Update display every 100ms instead of every frame

function gameLoop(timestamp) {
    if (!lastTimestamp) lastTimestamp = timestamp;
    const deltaTime = (timestamp - lastTimestamp) / 1000; // seconds
    lastTimestamp = timestamp;

    addBits(getGameState().gps * deltaTime);
    
    // Throttle display updates for better performance
    if (timestamp - lastUpdateTime >= UPDATE_INTERVAL) {
        updateDisplay();
        lastUpdateTime = timestamp;
    }

    gameLoopId = requestAnimationFrame(gameLoop);
}

// Start on DOM Load
document.addEventListener('DOMContentLoaded', init);