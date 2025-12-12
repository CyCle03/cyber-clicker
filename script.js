// @ts-check

/**
 * @typedef {object} Achievement
 * @property {string} id
 * @property {string} name
 * @property {string} desc
 * @property {(s: any) => boolean} condition
 * @property {boolean} [unlocked]
 * @property {number} reward
 */

/**
 * @typedef {object} StoryEvent
 * @property {string} id
 * @property {(s: any) => boolean} condition
 * @property {string} message
 * @property {boolean} [triggered]
 */

export {};
