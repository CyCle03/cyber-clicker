
global.window = {
    addEventListener: () => { },
    innerWidth: 1024,
    innerHeight: 768
};
global.document = {
    getElementById: () => ({
        addEventListener: () => { },
        style: {},
        classList: { add: () => { }, remove: () => { } },
        appendChild: () => { }
    }),
    querySelectorAll: () => [],
    createElement: () => ({
        style: {},
        classList: { add: () => { }, remove: () => { } },
        appendChild: () => { },
        children: []
    }),
    body: {
        appendChild: () => { }
    },
    addEventListener: () => { }
};
global.localStorage = {
    getItem: () => null,
    setItem: () => { }
};

try {
    Object.defineProperty(globalThis, 'navigator', {
        value: { userAgent: 'node' },
        configurable: true
    });
} catch (e) {
    // ignore
}

console.log("Starting debug check...");
try {
    await import('./js/game.js');
    console.log("Game module imported successfully.");
} catch (e) {
    console.error("Error importing game module:", e);
}
