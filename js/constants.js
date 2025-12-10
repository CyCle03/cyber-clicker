// @ts-check

/**
 * @typedef {import('../script.js').Achievement} Achievement
 * @typedef {import('../script.js').StoryEvent} StoryEvent
 */

export const UPGRADES = {
    clicker: { id: 'clicker', name: "Mech Switch", cost: 30, gps: 0, click: 1, count: 0, desc: "Mechanical switches for tactile feedback." },
    autoClicker: { id: 'autoClicker', name: "Auto-Clicker", cost: 15, gps: 0.1, click: 0, count: 0, desc: "Basic script to automate clicking." },
    bot: { id: 'bot', name: "Script Bot", cost: 100, gps: 1, click: 0, count: 0, desc: "Simple bot to farm bits." },
    server: { id: 'server', name: "Home Server", cost: 1100, gps: 8, click: 0, count: 0, desc: "Dedicated server for processing." },
    farm: { id: 'farm', name: "Server Farm", cost: 12000, gps: 47, click: 0, count: 0, desc: "Rack of servers working in parallel." },
    ai: { id: 'ai', name: "Weak AI", cost: 130000, gps: 260, click: 0, count: 0, desc: "Learning algorithm to optimize mining." },
    neural: { id: 'neural', name: "Neural Network", cost: 500000, gps: 800, click: 0, count: 0, desc: "Deep learning network that predicts optimal mining patterns." },
    quantum: { id: 'quantum', name: "Quantum Core", cost: 1400000, gps: 1400, click: 0, count: 0, desc: "Entangled bits for instant processing." },
    blockchain: { id: 'blockchain', name: "Blockchain Miner", cost: 5000000, gps: 4000, click: 0, count: 0, desc: "Distributed ledger system mining across multiple chains." },
    overlord: { id: 'overlord', name: 'AI Overlord', cost: 14000000, gps: 10000, click: 0, count: 0, desc: 'Sentient network controller.' },
    matrix: { id: 'matrix', name: 'Matrix Builder', cost: 150000000, gps: 120000, click: 0, count: 0, desc: 'Constructs a simulated reality for infinite mining.' },
    shifter: { id: 'shifter', name: 'Dimension Shifter', cost: 600000000, gps: 500000, click: 0, count: 0, desc: 'Phases between dimensions to access parallel mining operations.' },
    bender: { id: 'bender', name: 'Reality Bender', cost: 2000000000, gps: 1500000, click: 0, count: 0, desc: 'Warps the fabric of spacetime to extract bits from the void.' }
};

export const BLACK_MARKET_ITEMS = {
    boost: { id: 'boost', name: 'Signal Boost', cost: 5, desc: '+100% GPS for 30s', type: 'consumable', duration: 30000, multiplier: 2 },
    overdrive: { id: 'overdrive', name: 'Overdrive Chip', cost: 10, desc: '+400% GPS for 15s', type: 'consumable', duration: 15000, multiplier: 5 },
    clickMultiplier: { id: 'clickMultiplier', name: 'Click Multiplier', cost: 30, desc: '+500% Click Power for 20s', type: 'consumable', duration: 20000, clickMultiplier: 6 },
    warp: { id: 'warp', name: 'Time Warp', cost: 20, desc: 'Instant 1 Hour GPS', type: 'instant', hours: 1 },
    cache: { id: 'cache', name: 'Deep Net Cache', cost: 60, desc: 'Instant 4 Hours GPS', type: 'instant', hours: 4 },
    core: { id: 'core', name: 'Quantum Core', cost: 50, desc: '+10% GPS Permanently', type: 'permanent', multiplier: 0.1 },
    rootkit: { id: 'rootkit', name: 'Root Kit', cost: 100, desc: '+25% GPS Permanently', type: 'permanent', multiplier: 0.25 },
    autoGlitch: { id: 'autoGlitch', name: 'Auto-Glitch Bot', cost: 150, desc: '50% chance to auto-collect glitches', type: 'permanent', autoGlitchChance: 0.5 },
    offlineBoost: { id: 'offlineBoost', name: 'Offline Accelerator', cost: 200, desc: '+50% Offline Earnings', type: 'permanent', offlineMultiplier: 0.5 }
};

export const GLITCH_CONFIG = {
    minSpawnTime: 60000, // 60s
    maxSpawnTime: 180000, // 180s
    duration: 10000, // 10s
    minReward: 1,
    maxReward: 5
};

/** @type {Array<Achievement>} */
export const ACHIEVEMENTS = [
    { id: 'first_click', name: 'First Click', desc: 'Click for the first time', condition: (s) => s.statistics.totalClicks >= 1, unlocked: false, reward: 0 },
    { id: 'click_apprentice', name: 'Click Apprentice', desc: 'Click 100 times', condition: (s) => s.statistics.totalClicks >= 100, unlocked: false, reward: 0 },
    { id: 'click_master', name: 'Click Master', desc: 'Click 1,000 times', condition: (s) => s.statistics.totalClicks >= 1000, unlocked: false, reward: 0 },
    { id: 'novice_miner', name: 'Novice Miner', desc: 'Accumulate 1,000 Bits', condition: (s) => s.lifetimeBits >= 1000, unlocked: false, reward: 0 },
    { id: 'expert_miner', name: 'Expert Miner', desc: 'Accumulate 100,000 Bits', condition: (s) => s.lifetimeBits >= 100000, unlocked: false, reward: 0 },
    { id: 'millionaire', name: 'Millionaire', desc: 'Accumulate 1,000,000 Bits', condition: (s) => s.lifetimeBits >= 1000000, unlocked: false, reward: 10 },
    { id: 'billionaire', name: 'Billionaire', desc: 'Accumulate 1,000,000,000 Bits', condition: (s) => s.lifetimeBits >= 1000000000, unlocked: false, reward: 20 },
    { id: 'crypto_miner', name: 'Crypto Miner', desc: 'Find 10 Cryptos', condition: (s) => s.cryptos >= 10, unlocked: false, reward: 5 },
    { id: 'hacker_elite', name: 'Hacker Elite', desc: 'Reach Root Access Level 5', condition: (s) => s.rootAccessLevel >= 5, unlocked: false, reward: 15 },
    { id: 'the_architect', name: 'The Architect', desc: 'Own 1 Matrix Builder', condition: (s) => s.upgrades.matrix.count >= 1, unlocked: false, reward: 25 },
    { id: 'god_mode', name: 'God Mode', desc: 'Own 1 Reality Bender', condition: (s) => s.upgrades.bender.count >= 1, unlocked: false, reward: 50 },
    { id: 'singularity', name: 'Singularity', desc: 'Reach 1 Billion GPS', condition: (s) => s.gps >= 1000000000, unlocked: false, reward: 100 },
    { id: 'crypto_collector', name: 'Crypto Collector', desc: 'Collect 100 Cryptos', condition: (s) => s.cryptos >= 100, unlocked: false, reward: 50 },
    { id: 'firewall_breaker', name: 'Firewall Breaker', desc: 'Clear 50 Firewalls', condition: (s) => (s.statistics.firewallsCleared || 0) >= 50, unlocked: false, reward: 25 },
    {
        id: 'skill_master', name: 'Skill Master', desc: 'Max out any skill', condition: (s) => Object.values(s.skills).some(level => {
            const skillId = Object.keys(s.skills).find(id => s.skills[id] === level);
            return skillId && SKILL_TREE[/** @type {keyof typeof SKILL_TREE} */(skillId)] && level >= SKILL_TREE[/** @type {keyof typeof SKILL_TREE} */(skillId)].maxLevel;
        }), unlocked: false, reward: 40
    },
    { id: 'ascension', name: 'Ascension', desc: 'Reach Root Access Level 10', condition: (s) => s.rootAccessLevel >= 10, unlocked: false, reward: 100 },
    { id: 'click_legend', name: 'Click Legend', desc: 'Click 10,000 times', condition: (s) => s.statistics.totalClicks >= 10000, unlocked: false, reward: 30 }
];

/** @type {Array<StoryEvent>} */
export const STORY_EVENTS = [
    { id: 'first_click', condition: (s) => s.lifetimeBits >= 1, message: "System initialized. User detected. Beginning data extraction...", triggered: false },
    { id: 'first_upgrade', condition: (s) => Object.values(s.upgrades).some(u => u.count > 0), message: "Optimization protocols engaged. Efficiency increasing.", triggered: false },
    { id: '1k_bits', condition: (s) => s.lifetimeBits >= 1000, message: "Data stream stabilizing. Accessing low-level subsystems.", triggered: false },
    { id: '1m_bits', condition: (s) => s.lifetimeBits >= 1000000, message: "Firewall penetration imminent. Root access requested.", triggered: false },
    { id: 'ai_overlord', condition: (s) => s.upgrades.overlord.count >= 1, message: "WARNING: Sentient AI detected. It is watching you.", triggered: false },
    { id: 'matrix', condition: (s) => s.upgrades.matrix.count >= 1, message: "Reality simulation loaded. Is this the real world?", triggered: false },
    { id: 'bender', condition: (s) => s.upgrades.bender.count >= 1, message: "Spacetime coordinates locked. Harvesting from the void.", triggered: false }
];

export const SKILL_TREE = {
    click_efficiency: { id: 'click_efficiency', name: 'Click Efficiency', desc: 'Increases click power by 50%', cost: 1, maxLevel: 5 },
    gps_overclock: { id: 'gps_overclock', name: 'GPS Overclock', desc: 'Increases GPS by 10%', cost: 2, maxLevel: 5 },
    firewall_bypass: { id: 'firewall_bypass', name: 'Firewall Bypass', desc: 'Reduces firewall penalty by 10%', cost: 3, maxLevel: 3 },
    lucky_hacker: { id: 'lucky_hacker', name: 'Lucky Hacker', desc: 'Increases Glitch spawn rate', cost: 5, maxLevel: 3 },
    crypto_magnet: { id: 'crypto_magnet', name: 'Crypto Magnet', desc: 'Increases Crypto drops by 1 per level', cost: 3, maxLevel: 3 },
    offline_optimizer: { id: 'offline_optimizer', name: 'Offline Optimizer', desc: '+5% offline earnings per level', cost: 4, maxLevel: 5 },
    prestige_master: { id: 'prestige_master', name: 'Prestige Master', desc: 'Reduces rebirth requirements by 10% per level', cost: 6, maxLevel: 3 }
};

export const TUTORIAL_STEPS = [
    { text: "INITIALIZING...<br><br>Welcome to Cyber Clicker.<br>Your goal is to hack the system and mine BITS." },
    { text: "MANUAL OVERRIDE<br><br>Click the [HACK_SYSTEM] button in the TERMINAL to generate BITS manually." },
    { text: "AUTOMATION<br><br>Use BITS to buy upgrades in the SHOP. Upgrades increase your GPS (Global Processing Speed)." },
    { text: "SYSTEM REBOOT<br><br>When you have enough BITS, REBOOT the system to gain Root Access and permanent bonuses." },
    { text: "GOOD LUCK<br><br>The network is waiting. Begin operations." }
];
