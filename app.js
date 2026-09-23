document.addEventListener("DOMContentLoaded", () => {

  // ==========================================
  // 1. CUSTOM HUD CURSOR TRACKER
  // ==========================================
  const cursor = document.querySelector('.custom-cursor');
  const follower = document.querySelector('.custom-cursor-follower');
  const hoverTargets = document.querySelectorAll('.hover-target');

  let mouseX = -100, mouseY = -100;
  let followerX = -100, followerY = -100;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (cursor) {
      cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
    }
  });

  function animateCursor() {
    followerX += (mouseX - followerX) * 0.15;
    followerY += (mouseY - followerY) * 0.15;
    if (follower) {
      follower.style.transform = `translate3d(${followerX}px, ${followerY}px, 0)`;
    }
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  hoverTargets.forEach(target => {
    target.addEventListener('mouseenter', () => follower?.classList.add('hovered'));
    target.addEventListener('mouseleave', () => follower?.classList.remove('hovered'));
  });

  // ==========================================
  // 2. INTERACTIVE SPACETIME GRID FUNNEL CANVAS (Ref Image 1)
  // ==========================================
  const gridCanvas = document.getElementById("spacetime-grid-canvas");
  if (gridCanvas) {
    const ctx = gridCanvas.getContext("2d");
    let width, height, centerX, centerY;
    let localMouse = { x: 0, y: 0 };

    function resizeGrid() {
      width = gridCanvas.width = gridCanvas.parentElement.clientWidth;
      height = gridCanvas.height = gridCanvas.parentElement.clientHeight;
      centerX = width / 2;
      centerY = height / 2;
    }
    resizeGrid();
    window.addEventListener("resize", resizeGrid);

    gridCanvas.parentElement.addEventListener("mousemove", (e) => {
      const rect = gridCanvas.getBoundingClientRect();
      localMouse.x = e.clientX - rect.left - centerX;
      localMouse.y = e.clientY - rect.top - centerY;
    });

    let time = 0;

    function drawGrid() {
      ctx.clearRect(0, 0, width, height);
      time += 0.015;

      const numCircles = 16;
      const numRadials = 24;
      const maxRadius = Math.min(width, height) * 0.42;

      // Outer HUD Ring Frame
      ctx.beginPath();
      ctx.arc(centerX, centerY, maxRadius + 15, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Concentric Warped Circles (Spacetime Depth Well)
      for (let i = 1; i <= numCircles; i++) {
        const factor = i / numCircles;
        const radius = Math.pow(factor, 1.8) * maxRadius;

        ctx.beginPath();
        for (let a = 0; a <= Math.PI * 2; a += 0.05) {
          // Gravitational warping distortion toward center & mouse
          const warp = Math.sin(a * 4 + time) * (2 / factor);
          const mouseDist = Math.hypot(localMouse.x, localMouse.y);
          const mouseInfluence = Math.max(0, 1 - mouseDist / 300) * 15 * (1 - factor);

          const r = radius + warp + mouseInfluence;
          const x = centerX + Math.cos(a) * r;
          const y = centerY + Math.sin(a) * (r * 0.55); // Perspective inclination

          if (a === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = i === numCircles ? "rgba(255, 69, 0, 0.8)" : `rgba(255, 255, 255, ${0.05 + factor * 0.25})`;
        ctx.lineWidth = i === numCircles ? 1.5 : 1;
        ctx.stroke();
      }

      // Radial Lines plunging into the Singularity
      for (let j = 0; j < numRadials; j++) {
        const angle = (j / numRadials) * Math.PI * 2;
        ctx.beginPath();

        for (let i = 1; i <= numCircles; i++) {
          const factor = i / numCircles;
          const radius = Math.pow(factor, 1.8) * maxRadius;

          // Spiral drag effect near horizon
          const spiralAngle = angle + (1 - factor) * 0.6;
          const x = centerX + Math.cos(spiralAngle) * radius;
          const y = centerY + Math.sin(spiralAngle) * (radius * 0.55);

          if (i === 1) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Central Black Hole Horizon Core
      ctx.beginPath();
      ctx.arc(centerX, centerY, 28, 0, Math.PI * 2);
      ctx.fillStyle = "#000";
      ctx.fill();
      ctx.strokeStyle = "#ff4500";
      ctx.lineWidth = 2;
      ctx.shadowBlur = 20;
      ctx.shadowColor = "#ff4500";
      ctx.stroke();
      ctx.shadowBlur = 0; // reset shadow

      requestAnimationFrame(drawGrid);
    }
    drawGrid();
  }

  // ==========================================
  // 3. COSMIC FREQUENCY RADIO SYNTHESIZER (Web Audio API)
  // ==========================================
  class CosmicRadioSynth {
    constructor() {
      this.ctx = null;
      this.isPlaying = false;
      this.osc1 = null;
      this.osc2 = null;
      this.noiseNode = null;
      this.filter = null;
      this.gainNode = null;
      this.analyser = null;
      this.currentMode = 'kerr';
      this.baseFreq = 45;
    }

    init() {
      if (!this.ctx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    togglePlay() {
      this.init();
      if (this.isPlaying) {
        this.stop();
        return false;
      } else {
        this.start();
        return true;
      }
    }

    start() {
      this.isPlaying = true;
      const now = this.ctx.currentTime;

      // Master Gain & Analyser
      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.setValueAtTime(0.01, now);
      this.gainNode.gain.exponentialRampToValueAtTime(0.15, now + 1);

      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 64;

      // Filter
      this.filter = this.ctx.createBiquadFilter();
      this.filter.type = 'lowpass';
      this.filter.frequency.setValueAtTime(this.baseFreq * 4, now);

      // Oscillators (Sine Kerr Drone)
      this.osc1 = this.ctx.createOscillator();
      this.osc2 = this.ctx.createOscillator();

      this.osc1.type = 'sine';
      this.osc2.type = 'sawtooth';

      this.osc1.frequency.setValueAtTime(this.baseFreq, now);
      this.osc2.frequency.setValueAtTime(this.baseFreq * 1.5, now);

      // Connect
      this.osc1.connect(this.filter);
      this.osc2.connect(this.filter);
      this.filter.connect(this.gainNode);
      this.gainNode.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);

      this.osc1.start();
      this.osc2.start();
    }

    setFrequency(freq) {
      if (!this.ctx || !this.isPlaying) return;
      const now = this.ctx.currentTime;
      if (this.osc1) this.osc1.frequency.exponentialRampToValueAtTime(freq, now + 0.1);
      if (this.filter) this.filter.frequency.exponentialRampToValueAtTime(freq * 3, now + 0.1);
    }

    setPreset(mode, freq) {
      this.currentMode = mode;
      this.baseFreq = freq;
      if (this.isPlaying) {
        this.setFrequency(freq);
      }
    }

    stop() {
      if (!this.isPlaying) return;
      const now = this.ctx.currentTime;
      this.gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
      setTimeout(() => {
        this.osc1?.stop();
        this.osc2?.stop();
        this.isPlaying = false;
      }, 500);
    }
  }

  const radio = new CosmicRadioSynth();
  const playBtn = document.getElementById("radio-play-btn");
  const playBtnText = document.getElementById("play-btn-text");
  const radioIndicator = document.getElementById("radio-indicator");
  const radioStatusText = document.getElementById("radio-status-text");
  const freqTuner = document.getElementById("frequency-tuner");
  const freqDisplay = document.getElementById("freq-display");
  const channelBtns = document.querySelectorAll(".channel-btn");

  playBtn?.addEventListener("click", () => {
    const active = radio.togglePlay();
    if (active) {
      playBtnText.innerText = "HALT FREQUENCY STREAM";
      radioIndicator?.classList.add("active");
      if (radioStatusText) radioStatusText.innerText = "SIGNAL: STREAMING LIVE";
    } else {
      playBtnText.innerText = "INITIALIZE AUDIO STREAM";
      radioIndicator?.classList.remove("active");
      if (radioStatusText) radioStatusText.innerText = "SIGNAL: STANDBY";
    }
  });

  freqTuner?.addEventListener("input", (e) => {
    const val = e.target.value;
    if (freqDisplay) freqDisplay.innerText = `${val} MHz`;
    radio.setFrequency(parseFloat(val) * 0.1);
  });

  channelBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      channelBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const freq = parseFloat(btn.dataset.freq);
      const mode = btn.dataset.type;
      radio.setPreset(mode, freq);
      if (freqTuner) freqTuner.value = freq * 10;
      if (freqDisplay) freqDisplay.innerText = `${freq * 10} MHz`;
    });
  });

  // Radio Audio Visualizer Canvas
  const visualizerCanvas = document.getElementById("radio-visualizer");
  if (visualizerCanvas) {
    const vCtx = visualizerCanvas.getContext("2d");

    function renderVisualizer() {
      visualizerCanvas.width = visualizerCanvas.parentElement.clientWidth;
      visualizerCanvas.height = visualizerCanvas.parentElement.clientHeight;
      const w = visualizerCanvas.width;
      const h = visualizerCanvas.height;

      vCtx.clearRect(0, 0, w, h);

      const bufferLength = radio.analyser ? radio.analyser.frequencyBinCount : 32;
      const dataArray = new Uint8Array(bufferLength);

      if (radio.analyser && radio.isPlaying) {
        radio.analyser.getByteFrequencyData(dataArray);
      }

      const barWidth = (w / bufferLength) * 1.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = radio.isPlaying ? (dataArray[i] / 255) * h : Math.sin(i + Date.now() * 0.003) * 6 + 8;

        vCtx.fillStyle = radio.isPlaying ? "#ff4500" : "rgba(255, 255, 255, 0.15)";
        vCtx.fillRect(x, h - barHeight, barWidth - 2, barHeight);

        x += barWidth;
      }

      requestAnimationFrame(renderVisualizer);
    }
    renderVisualizer();
  }

  // ==========================================
  // 4. INTERACTIVE DASHBOARD TABS
  // ==========================================
  const dashTabs = document.querySelectorAll(".dash-tab");
  const tabPanes = document.querySelectorAll(".tab-pane");

  dashTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const targetId = `pane-${tab.dataset.tab}`;

      dashTabs.forEach(t => t.classList.remove("active"));
      tabPanes.forEach(p => p.classList.remove("active"));

      tab.classList.add("active");
      document.getElementById(targetId)?.classList.add("active");
    });
  });

});


