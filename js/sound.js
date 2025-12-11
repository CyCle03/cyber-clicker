// @ts-check

/**
 * @typedef {Object} SoundManagerType
 * @property {AudioContext|null} audioCtx
 * @property {number} masterVolume
 * @property {boolean} muted
 * @property {function(): void} init
 * @property {function(): void} loadSettings
 * @property {function(): void} initAudio
 * @property {function(string): void} playSFX
 * @property {function(number, OscillatorType, number, number=): void} playTone
 * @property {function(): void} saveSettings
 * @property {function(): void} updateUI
 * @property {function(): void} toggleMute
 */

/** @type {SoundManagerType} */
export const SoundManager = {
    audioCtx: null,
    masterVolume: 0.5,
    muted: false,

    init: function () {
        try {
            // @ts-ignore
            const Win = /** @type {any} */ (window);
            Win.AudioContext = Win.AudioContext || Win.webkitAudioContext;
            // Don't create AudioContext immediately - wait for user interaction
            // AudioContext will be created lazily in initAudio() when needed
            this.loadSettings();
        } catch (e) {
            console.error("Web Audio API not supported");
        }
    },

    loadSettings: function () {
        const savedVol = localStorage.getItem('cc_volume');
        const savedMute = localStorage.getItem('cc_mute');
        if (savedVol !== null) this.masterVolume = parseFloat(savedVol);
        if (savedMute !== null) this.muted = (savedMute === 'true');

        this.updateUI();
    },

    initAudio: function () {
        if (this.audioCtx) return;
        // @ts-ignore
        const Win = /** @type {any} */ (window);
        const AudioContext = Win.AudioContext || Win.webkitAudioContext;
        if (AudioContext) {
            this.audioCtx = new AudioContext();
        }
    },
    /**
     * @param {string} name 
     */
    playSFX: function (name) {
        if (!this.audioCtx) this.initAudio(); // Create AudioContext lazily on first use
        if (!this.audioCtx) return;
        if (this.muted) return;
        
        // Resume AudioContext if it's suspended (required after user gesture)
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume().catch(() => {
                // Ignore errors if resume fails
            });
        }

        switch (name) {
            case 'click':
                this.playTone(1200, 'sine', 0.1, 0.3);
                break;
            case 'buy':
                this.playTone(600, 'square', 0.1, 0.3);
                break;
            case 'error':
                this.playTone(150, 'sawtooth', 0.3, 0.5);
                break;
            case 'alert':
                this.playTone(800, 'sawtooth', 0.5, 0.4);
                setTimeout(() => this.playTone(600, 'sawtooth', 0.5, 0.4), 200);
                break;
            case 'success':
                this.playTone(400, 'sine', 0.1, 0.4);
                setTimeout(() => this.playTone(600, 'sine', 0.1, 0.4), 100);
                setTimeout(() => this.playTone(800, 'sine', 0.2, 0.4), 200);
                break;
            case 'reboot':
                this.playTone(100, 'sawtooth', 1.0, 0.8);
                break;
            case 'achievement': // Added achievement sound
                this.playTone(400, 'sine', 0.1);
                setTimeout(() => this.playTone(600, 'sine', 0.1), 100);
                setTimeout(() => this.playTone(800, 'sine', 0.2), 200);
                break;
            case 'typing': // Added typing sound
                this.playTone(1000 + Math.random() * 500, 'square', 0.02);
                break;
        }
    },

    /**
     * @param {number} freq 
     * @param {OscillatorType} type 
     * @param {number} duration 
     * @param {number} [vol] 
     */
    playTone: function (freq, type, duration, vol = 1) {
        if (!this.audioCtx) return;
        
        // If AudioContext is suspended, try to resume it
        // If resume fails or context is still suspended, skip playback to avoid warnings
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume().catch(() => {
                // If resume fails, don't play the sound
                return;
            });
            // If still suspended after resume attempt, skip playback
            if (this.audioCtx.state === 'suspended') {
                return;
            }
        }
        
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

        gain.gain.setValueAtTime(vol * this.masterVolume, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        try {
            osc.start();
            osc.stop(this.audioCtx.currentTime + duration);
        } catch (e) {
            // Ignore errors if AudioContext is not allowed to start
        }
    },

    saveSettings: function () {
        localStorage.setItem('cc_volume', String(this.masterVolume));
        localStorage.setItem('cc_mute', String(this.muted));
    },

    updateUI: function () {
        const slider = /** @type {HTMLInputElement} */ (document.getElementById('volume-slider'));
        const valueDisplay = document.getElementById('volume-value');
        const muteBtn = document.getElementById('mute-btn');

        if (slider) slider.value = String(this.masterVolume * 100);
        if (valueDisplay) valueDisplay.innerText = Math.round(this.masterVolume * 100) + '%';
        if (muteBtn) {
            muteBtn.innerText = this.muted ? "UNMUTE SOUND" : "MUTE SOUND";
            muteBtn.classList.toggle('danger', this.muted);
        }
    },

    toggleMute: function() {
        this.muted = !this.muted;
        this.saveSettings();
        this.updateUI();
    }
};
