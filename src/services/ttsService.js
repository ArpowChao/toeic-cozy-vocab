/**
 * Web Speech API TTS & Pleasant Sound Effects Service
 */

const TTS_ACCENT_KEY = 'cozy_toeic_tts_accent';
const TTS_RATE_KEY = 'cozy_toeic_tts_rate';

let speechSynth = typeof window !== 'undefined' ? window.speechSynthesis : null;
let currentAccent = (typeof localStorage !== 'undefined' && localStorage.getItem(TTS_ACCENT_KEY)) || 'en-US';
let speechRate = (typeof localStorage !== 'undefined' && Number(localStorage.getItem(TTS_RATE_KEY))) || 0.88;

/**
 * Configure TTS settings and persist to localStorage
 */
export function setTTSConfig({ accent = 'en-US', rate = 0.88 }) {
  currentAccent = accent;
  speechRate = Number(rate) || 0.88;
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(TTS_ACCENT_KEY, currentAccent);
    localStorage.setItem(TTS_RATE_KEY, String(speechRate));
  }
}

/**
 * Get current TTS settings
 */
export function getTTSConfig() {
  return { accent: currentAccent, rate: speechRate };
}

/**
 * Pronounce text in English
 * @param {string} text - Word or sentence to speak
 * @param {string} [overrideAccent] - 'en-US' or 'en-GB'
 * @param {number} [overrideRate] - Optional speed multiplier (e.g. 0.72 for slow speech)
 * @returns {Promise<void>}
 */
export function speakText(text, overrideAccent, overrideRate) {
  return new Promise((resolve) => {
    if (!speechSynth || !text) {
      resolve();
      return;
    }

    // Cancel ongoing speech
    speechSynth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const targetLang = overrideAccent || currentAccent;
    utterance.lang = targetLang;
    utterance.rate = overrideRate !== undefined ? overrideRate : speechRate;
    utterance.pitch = 1.0;

    // Pick suitable voice if available
    const voices = speechSynth.getVoices();
    const voice = voices.find((v) => v.lang.startsWith(targetLang.substring(0, 2)) && v.lang.includes(targetLang.split('-')[1]));
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();

    speechSynth.speak(utterance);
  });
}

/**
 * Web Audio API Pleasant Chime Generator
 * Provides cozy and delightful sounds without external audio files
 */
class SoundEngine {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Play warm soft card flip sound
  playFlip() {
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, this.ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  // Play success chime for Good / Easy
  playSuccess() {
    this.init();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 major triad
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.07);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.07 + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(this.ctx.currentTime + idx * 0.07);
      osc.stop(this.ctx.currentTime + idx * 0.07 + 0.25);
    });
  }

  // Play gentle low chime for Again / Hard
  playAgain() {
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(330, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(220, this.ctx.currentTime + 0.18);

    gain.gain.setValueAtTime(0.09, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.18);
  }
}

export const soundEffects = new SoundEngine();
