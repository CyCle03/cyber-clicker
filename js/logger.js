// @ts-check

import { DEBUG_ENABLED } from './constants.js';

/** @param {any[]} args */
function formatArgs(args) {
    try {
        return args.map(a => {
            if (typeof a === 'string') return a;
            if (a instanceof Error) return a.stack || a.message;
            return JSON.stringify(a);
        }).join(' ');
    } catch {
        return String(args);
    }
}

/** @param {'debug'|'error'} level @param {any[]} args */
function writeToDebugUI(level, args) {
    try {
        const debugLog = document.getElementById('debug-log');
        if (!debugLog) return;
        const div = document.createElement('div');
        div.className = `debug-entry ${level}`;
        div.innerText = `[${new Date().toLocaleTimeString()}] ${formatArgs(args)}`;
        debugLog.prepend(div);
    } catch {
        return;
    }
}

/** @param {...any} args */
export function debugLog(...args) {
    if (!DEBUG_ENABLED) return;
    console.log(...args);
    writeToDebugUI('debug', args);
}

/** @param {...any} args */
export function errorLog(...args) {
    console.error(...args);
    writeToDebugUI('error', args);
}
