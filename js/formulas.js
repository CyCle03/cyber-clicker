// @ts-check
import { getGameState } from "./state.js";

/** @param {string} upgradeKey */
export function calculateGPSContribution(upgradeKey) {
    const gameState = getGameState();
    const upgrade = gameState.upgrades[upgradeKey];
    const contribution = upgrade.gps * upgrade.count;
    const percentage = gameState.gps > 0 ? (contribution / gameState.gps) * 100 : 0;
    return { contribution, percentage };
}

/** @param {any} upgrade */
export function calculateEfficiency(upgrade) {
    if (upgrade.gps === 0) return Infinity; // Click upgrades have no GPS efficiency
    return upgrade.cost / upgrade.gps; // Lower is better
}

/** @param {number} efficiency */
export function getEfficiencyRating(efficiency) {
    if (efficiency === Infinity) return { text: 'N/A', class: 'neutral' };
    if (efficiency < 500) return { text: 'Excellent', class: 'excellent' };
    if (efficiency < 2000) return { text: 'Good', class: 'good' };
    if (efficiency < 10000) return { text: 'Fair', class: 'fair' };
    return { text: 'Poor', class: 'poor' };
}

export function calculatePotentialRootAccess() {
    const gameState = getGameState();
    // Exponential scaling: Each level requires 10x more bits than the previous tier
    // Level 1: 10M bits
    // Level 2: 31.6M bits  
    // Level 3: 100M bits
    // Level 4: 316M bits
    // Level 5: 1B bits
    // Minimum requirement increased to 10M for better game pacing
    if (gameState.lifetimeBits < 10000000) return 0;

    // Apply Prestige Master skill to reduce requirements
    const prestigeMasterLevel = gameState.skills.prestige_master || 0;
    const reductionMultiplier = 1 - (prestigeMasterLevel * 0.1); // 10% reduction per level
    const adjustedBits = gameState.lifetimeBits / reductionMultiplier;

    return Math.floor(Math.log10(adjustedBits / 10000000) * 5);
}
