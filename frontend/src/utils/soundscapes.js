// Pure Web Audio API Ambient Generator - 100% offline, zero external dependencies

class SoundscapeEngine {
  constructor() {
    this.ctx = null;
    this.activeTrack = null;
    this.nodes = [];
    this.gainNode = null;
    this.volume = 0.4;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.1);
    }
  }

  stop() {
    if (this.nodes.length) {
      this.nodes.forEach(node => {
        try {
          if (node.stop) node.stop();
          if (node.disconnect) node.disconnect();
        } catch {
          // ignore
        }
      });
      this.nodes = [];
    }
    this.activeTrack = null;
  }

  playRain() {
    this.init();
    this.stop();
    if (!this.ctx) return;

    this.activeTrack = 'rain';
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    // Pinkish rain noise generator
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(950, this.ctx.currentTime);

    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(this.gainNode);
    this.gainNode.connect(this.ctx.destination);

    whiteNoise.start();
    this.nodes.push(whiteNoise, filter, this.gainNode);
  }

  playFireplace() {
    this.init();
    this.stop();
    if (!this.ctx) return;

    this.activeTrack = 'fireplace';
    // Gentle rumble
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.06;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, this.ctx.currentTime);

    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);

    noise.connect(filter);
    filter.connect(this.gainNode);
    this.gainNode.connect(this.ctx.destination);

    noise.start();
    this.nodes.push(noise, filter, this.gainNode);

    // Periodic crackle interval
    const crackleInterval = setInterval(() => {
      if (this.activeTrack !== 'fireplace' || !this.ctx) {
        clearInterval(crackleInterval);
        return;
      }
      if (Math.random() > 0.4) {
        try {
          const osc = this.ctx.createOscillator();
          const popGain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(400 + Math.random() * 700, this.ctx.currentTime);
          popGain.gain.setValueAtTime(0.08 * this.volume, this.ctx.currentTime);
          popGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.04);
          osc.connect(popGain);
          popGain.connect(this.ctx.destination);
          osc.start();
          osc.stop(this.ctx.currentTime + 0.05);
        } catch {
          // ignore
        }
      }
    }, 280);
  }

  playSingingBowl() {
    this.init();
    this.stop();
    if (!this.ctx) return;

    this.activeTrack = 'bowl';
    const fundamental = 174; // 174 Hz solfeggio frequency for deep peace
    const harmonics = [1, 2.01, 3.02, 4.04];
    const gains = [0.25, 0.12, 0.06, 0.03];

    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    this.gainNode.connect(this.ctx.destination);
    this.nodes.push(this.gainNode);

    harmonics.forEach((h, idx) => {
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(fundamental * h, this.ctx.currentTime);

      // Gentle tremolo
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(0.18 + idx * 0.05, this.ctx.currentTime);
      lfoGain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(oscGain.gain);
      lfo.start();
      this.nodes.push(lfo, lfoGain);

      oscGain.gain.setValueAtTime(gains[idx], this.ctx.currentTime);
      osc.connect(oscGain);
      oscGain.connect(this.gainNode);
      osc.start();
      this.nodes.push(osc, oscGain);
    });
  }
}

export const soundscape = new SoundscapeEngine();
