// @ts-check
import { ACHIEVEMENTS, SKILL_TREE, STORY_EVENTS, UPGRADES } from "./constants.js";
import { SoundManager } from "./sound.js";

/**
 * @typedef {import('../script.js').GameState} GameState
 */

/** @type {GameState} */
export let gameState = /** @type {any} */ ({});

export function initState() {
    gameState.bits = 0;
    gameState.lifetimeBits = 0;
    gameState.gps = 0;
    gameState.clickPower = 1;
    gameState.rootAccessLevel = 0;
    gameState.cryptos = 0;
    gameState.permanentMultiplier = 1;
    gameState.offlineMultiplier = 1;
    gameState.skillPoints = 0;
    gameState.skills = {}; // id -> level
    gameState.firewallActive = false;
    gameState.firewallCode = "";
    gameState.autoGlitchEnabled = false;

    // Statistics tracking
    gameState.statistics = {
        totalClicks: 0,
        totalBitsEarned: 0,
        playTimeSeconds: 0,
        rebootCount: 0,
        firewallsEncountered: 0,
        firewallsCleared: 0,
        sessionStartTime: Date.now()
    };

    // Deep copy upgrades to avoid mutating the constant definition
    gameState.upgrades = JSON.parse(JSON.stringify(UPGRADES));

    // Initialize skills
    for (const key in SKILL_TREE) {
        gameState.skills[key] = 0;
    }

    // Achievements need to keep their functions, so we map them
    gameState.achievements = ACHIEVEMENTS.map(ach => ({ ...ach, unlocked: false }));

    // Story events state
    gameState.storyEvents = STORY_EVENTS.map(evt => ({ ...evt, triggered: false }));

    gameState.tutorialSeen = false;
    gameState.activeBoosts = []; // Array of { multiplier, endTime }
    gameState.activeClickBoosts = []; // Array of { clickMultiplier, endTime }
    gameState.lastSaveTime = Date.now();
}

/**
 * @param {any} savedData 
 */
export function loadState(savedData) {
    initState(); // Start with fresh state

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

        // Load Skills
        if (savedData.skills) {
            gameState.skills = { ...gameState.skills, ...savedData.skills };
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
            gameState.statistics = { ...gameState.statistics, ...savedData.statistics };
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
    gameState.bits = 0;
    gameState.lifetimeBits = 0;
    gameState.gps = 0;
    gameState.clickPower = 1;
    gameState.rootAccessLevel = newRootLevel;
    gameState.permanentMultiplier *= 1.1; // +10% permanent bonus per reboot
    gameState.skillPoints += (newRootLevel - gameState.rootAccessLevel); // Earn points for new levels
    // Actually, skill points should be total based on level, but let's just add new ones for now.
    // Better: Skill Points = Root Level (Total). Used points are tracked in skills.
    // Let's simplify: You get 1 SP per Root Level.
    // On Prestige, you keep your skills? Or reset them?
    // Standard idle game: Skills usually persist or you get points to rebuy.
    // Let's say Skills PERSIST across reboots (permanent perks).
    // So we just update skill points based on level increase.
    // Wait, if I reboot from lvl 0 to 1, I get 1 point.
    // If I reboot again from 0 to 2 (total), do I get 2 points?
    // Root Access Level is cumulative or reset?
    // "Root Access: LVL X". It seems permanent.
    // So:
    const levelsGained = newRootLevel - gameState.rootAccessLevel;
    if (levelsGained > 0) {
        gameState.skillPoints += levelsGained;
    }

    gameState.activeBoosts = [];


    // Reset Upgrades
    for (const key in gameState.upgrades) {
        gameState.upgrades[key].count = 0;
        gameState.upgrades[key].cost = UPGRADES[/** @type {keyof typeof UPGRADES} */(key)].cost;
    }
}
