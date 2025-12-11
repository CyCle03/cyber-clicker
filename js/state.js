// @ts-check
import { ACHIEVEMENTS, SKILL_TREE, STORY_EVENTS, UPGRADES } from "./constants.js";
import { SoundManager } from "./sound.js";

/**
 * @typedef {object} GameState
 * @property {number} bits
 * @property {number} lifetimeBits
 * @property {number} gps
 * @property {number} clickPower
 * @property {number} rootAccessLevel
 * @property {number} cryptos
 * @property {number} permanentMultiplier
 * @property {number} offlineMultiplier
 * @property {number} skillPoints
 * @property {Object.<string, number>} skills
 * @property {boolean} firewallActive
 * @property {string} firewallCode
 * @property {boolean} autoGlitchEnabled
 * @property {object} statistics
 * @property {number} statistics.totalClicks
 * @property {number} statistics.totalBitsEarned
 * @property {number} statistics.playTimeSeconds
 * @property {number} statistics.rebootCount
 * @property {number} statistics.firewallsEncountered
 * @property {number} statistics.firewallsCleared
 * @property {number} statistics.sessionStartTime
 * @property {Object.<string, import('./constants.js').Upgrade>} upgrades
 * @property {Array.<import('./constants.js').Achievement & {unlocked: boolean}>} achievements
 * @property {Array.<import('./constants.js').StoryEvent & {triggered: boolean}>} storyEvents
 * @property {boolean} tutorialSeen
 * @property {Array.<{multiplier: number, endTime: number}>} activeBoosts
 * @property {Array.<{clickMultiplier: number, endTime: number}>} activeClickBoosts
 * @property {number} lastSaveTime
 */

/** @type {GameState} */
const gameState = /** @type {any} */ ({});

export const getGameState = () => gameState;

export function initState() {
    const newState = {
        bits: 0,
        lifetimeBits: 0,
        gps: 0,
        clickPower: 1,
        rootAccessLevel: 0,
        cryptos: 0,
        permanentMultiplier: 1,
        offlineMultiplier: 1,
        skillPoints: 0,
        skills: {}, // id -> level
        firewallActive: false,
        firewallCode: "",
        autoGlitchEnabled: false,

        // Statistics tracking
        statistics: {
            totalClicks: 0,
            totalBitsEarned: 0,
            playTimeSeconds: 0,
            rebootCount: 0,
            firewallsEncountered: 0,
            firewallsCleared: 0,
            sessionStartTime: Date.now()
        },

        // Deep copy upgrades to avoid mutating the constant definition
        upgrades: JSON.parse(JSON.stringify(UPGRADES)),

        // Initialize skills
        achievements: ACHIEVEMENTS.map(ach => ({ ...ach, unlocked: false })),

        // Story events state
        storyEvents: STORY_EVENTS.map(evt => ({ ...evt, triggered: false })),

        tutorialSeen: false,
        activeBoosts: [], // Array of { multiplier, endTime }
        activeClickBoosts: [], // Array of { clickMultiplier, endTime }
        lastSaveTime: Date.now()
    };

    for (const key in SKILL_TREE) {
        newState.skills[key] = 0;
    }

    Object.assign(gameState, newState);
}

/**
 * @param {any} savedData 
 */
export function loadState(savedData) {
    // Ensure gameState is initialized before loading
    if (!gameState.achievements || !Array.isArray(gameState.achievements)) {
        initState();
    }
    
    if (savedData) {
        gameState.bits = savedData.bits || 0;
        gameState.lifetimeBits = savedData.lifetimeBits || 0;
        gameState.rootAccessLevel = savedData.rootAccessLevel || 0;
        gameState.cryptos = savedData.cryptos || 0;
        gameState.permanentMultiplier = savedData.permanentMultiplier || 1;
        gameState.offlineMultiplier = savedData.offlineMultiplier || 1;
        gameState.skillPoints = savedData.skillPoints || 0;
        gameState.lastSaveTime = savedData.lastSaveTime || Date.now();
        gameState.tutorialSeen = savedData.tutorialSeen || false;
        gameState.autoGlitchEnabled = savedData.autoGlitchEnabled || false;
        gameState.firewallActive = savedData.firewallActive || false;
        gameState.firewallCode = savedData.firewallCode || "";
        gameState.firewallActive = savedData.firewallActive || false;
        gameState.firewallCode = savedData.firewallCode || "";

        // Load Skills
        if (savedData.skills) {
            Object.assign(gameState.skills, savedData.skills);
        }

        // Load Upgrades
        if (savedData.upgrades) {
            for (const key in savedData.upgrades) {
                if (gameState.upgrades[key]) {
                    gameState.upgrades[key].count = savedData.upgrades[key].count;
                    // Recalculate cost based on count
                    gameState.upgrades[key].cost = Math.ceil(UPGRADES[/** @type {keyof typeof UPGRADES} */(key)].cost * Math.pow(1.15, savedData.upgrades[key].count));
                }
            }
        }

        // Load Achievements
        if (savedData.achievements) {
            savedData.achievements.forEach(/** @type {any} */(savedAch) => {
                const ach = gameState.achievements.find(a => a.id === savedAch.id);
                if (ach) {
                    ach.unlocked = savedAch.unlocked;
                }
            });
        }

        // Load Story Events
        if (savedData.storyEvents) {
            savedData.storyEvents.forEach(/** @type {any} */(savedEvt) => {
                const evt = gameState.storyEvents.find(e => e.id === savedEvt.id);
                if (evt) {
                    evt.triggered = savedEvt.triggered;
                }
            });
        }

        // Load Active Boosts
        if (savedData.activeBoosts) {
            // Filter out expired boosts
            const now = Date.now();
            gameState.activeBoosts = savedData.activeBoosts.filter(/** @type {any} */(b) => b.endTime > now);
        } else {
            gameState.activeBoosts = [];
        }

        // Load Active Click Boosts
        if (savedData.activeClickBoosts) {
            const now = Date.now();
            gameState.activeClickBoosts = savedData.activeClickBoosts.filter(/** @type {any} */(b) => b.endTime > now);
        } else {
            gameState.activeClickBoosts = [];
        }

        // Load Statistics
        if (savedData.statistics) {
            // Merge saved statistics with current (initial) statistics.
            // This ensures new stats fields are initialized correctly if they didn't exist in old saves.
            Object.assign(gameState.statistics, savedData.statistics);
        }

        // Migration: Grant skill points to players who rebirthed before skill tree was added
        // If player has root access level but no skill points, grant them retroactively
        if (gameState.rootAccessLevel > 0 && gameState.skillPoints === 0) {
            // Calculate total skill points that should have been earned
            let totalSkillPointsEarned = 0;
            for (const skillId in gameState.skills) {
                totalSkillPointsEarned += gameState.skills[skillId] * SKILL_TREE[/** @type {keyof typeof SKILL_TREE} */(skillId)].cost;
            }
            // Grant skill points = root level - already spent points
            gameState.skillPoints = gameState.rootAccessLevel - totalSkillPointsEarned;
            console.log(`Migration: Granted ${gameState.skillPoints} skill points based on Root Access Level ${gameState.rootAccessLevel}`);
        }
    }
}

/** @param {number} newRootLevel */
export function resetStateForPrestige(newRootLevel) {
    const levelsGained = newRootLevel - gameState.rootAccessLevel;
    
    Object.assign(gameState, {
        bits: 0,
        lifetimeBits: 0,
        gps: 0,
        clickPower: 1,
        rootAccessLevel: newRootLevel,
        permanentMultiplier: gameState.permanentMultiplier * 1.1, // +10% permanent bonus per reboot
        skillPoints: gameState.skillPoints + (levelsGained > 0 ? levelsGained : 0),
        activeBoosts: [],
        upgrades: JSON.parse(JSON.stringify(UPGRADES)), // Reset upgrades
    });
}
