export const UPGRADES = {
    script: { id: 'script', name: 'Script Kiddie', cost: 15, gps: 0.5, count: 0, desc: 'Automated ping scripts.' },
    bot: { id: 'bot', name: 'Zombie Bot', cost: 100, gps: 5, count: 0, desc: 'Infected IoT device.' },
    server: { id: 'server', name: 'Server Farm', cost: 1100, gps: 40, count: 0, desc: 'Dedicated hashing power.' },
    ai: { id: 'ai', name: 'Neural Net', cost: 12000, gps: 250, count: 0, desc: 'Self-learning algorithm.' },
    quantum: { id: 'quantum', name: 'Quantum Server', cost: 130000, gps: 1500, count: 0, desc: 'Entangled processing units.' },
    overlord: { id: 'overlord', name: 'AI Overlord', cost: 1400000, gps: 10000, count: 0, desc: 'Sentient network controller.' }
};

export const BLACK_MARKET_ITEMS = {
    boost: { id: 'boost', name: 'Signal Boost', cost: 5, desc: '+100% GPS for 30s', type: 'consumable', duration: 30000, multiplier: 2 },
    core: { id: 'core', name: 'Quantum Core', cost: 50, desc: '+10% GPS Permanently', type: 'permanent', multiplier: 0.1 },
    warp: { id: 'warp', name: 'Time Warp', cost: 20, desc: 'Instant 1 Hour GPS', type: 'instant', hours: 1 }
};

export const GLITCH_CONFIG = {
    minSpawnTime: 60000, // 60s
    maxSpawnTime: 180000, // 180s
    duration: 10000, // 10s
    minReward: 1,
    maxReward: 5
};

export const ACHIEVEMENTS = [
    { id: 'hello_world', name: 'Hello World', desc: 'Accumulate 10 Bits', condition: (s) => s.lifetimeBits >= 10, unlocked: false },
    { id: 'script_kiddie', name: 'Script Kiddie', desc: 'Buy your first upgrade', condition: (s) => s.upgrades.script.count >= 1, unlocked: false },
    { id: 'serious_business', name: 'Serious Business', desc: 'Accumulate 1,000 Bits', condition: (s) => s.lifetimeBits >= 1000, unlocked: false },
    { id: 'botnet_master', name: 'Botnet Master', desc: 'Own 10 Zombie Bots', condition: (s) => s.upgrades.bot.count >= 10, unlocked: false },
    { id: 'millionaire', name: 'Millionaire', desc: 'Accumulate 1,000,000 Bits', condition: (s) => s.lifetimeBits >= 1000000, unlocked: false },
    { id: 'billionaire', name: 'Billionaire', desc: 'Accumulate 1,000,000,000 Bits', condition: (s) => s.lifetimeBits >= 1000000000, unlocked: false },
    { id: 'crypto_miner', name: 'Crypto Miner', desc: 'Find 10 Cryptos', condition: (s) => s.cryptos >= 10, unlocked: false },
    { id: 'hacker_elite', name: 'Hacker Elite', desc: 'Reach Root Access Level 5', condition: (s) => s.rootAccessLevel >= 5, unlocked: false }
];
