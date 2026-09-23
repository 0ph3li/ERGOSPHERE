document.addEventListener("DOMContentLoaded", () => {

  // ==========================================
  // 1. MULTI-SPECTRAL TELESCOPE VIEWPORT CANVAS
  // ==========================================
  const tCanvas = document.getElementById("telescope-canvas");
  if (tCanvas) {
    const ctx = tCanvas.getContext("2d");
    let width, height, centerX, centerY;

    function resizeTelescope() {
      width = tCanvas.width = tCanvas.parentElement.clientWidth;
      height = tCanvas.height = tCanvas.parentElement.clientHeight;
      centerX = width / 2;
      centerY = height / 2;
    }
    resizeTelescope();
    window.addEventListener("resize", resizeTelescope);

    // State Configuration
    let currentTarget = "m87";
    let currentBand = "infrared";
    let exposure = 1.2;
    let zoom = 1.0;

    // Target Telemetry Database
    const telemetryDB = {
      m87: { ra: "12h 30m 49.4s", dec: "+12° 23' 28\"", flux: "1.42 Jy", z: "0.00428" },
      sgra: { ra: "17h 45m 40.0s", dec: "-29° 00' 28\"", flux: "2.85 Jy", z: "0.00000" },
      crab: { ra: "05h 34m 31.9s", dec: "+22° 00' 52\"", flux: "980 Jy", z: "0.00015" },
      cygnus: { ra: "19h 58m 21.7s", dec: "+35° 12' 05\"", flux: "18.4 Jy", z: "0.00002" }
    };

    // Color Maps for Electromagnetic Spectrum Bands
    const bandPalette = {
      infrared: { core: "#ff4500", glow: "rgba(255, 140, 0, 0.4)", jet: "#00d2ff" },
      optical: { core: "#ffffff", glow: "rgba(0, 210, 255, 0.3)", jet: "#ff8c00" },
      xray: { core: "#00d2ff", glow: "rgba(138, 43, 226, 0.5)", jet: "#ffffff" },
      gamma: { core: "#ff007f", glow: "rgba(255, 0, 255, 0.6)", jet: "#00ffff" }
    };

    // Event Listeners for UI Controls
    document.querySelectorAll(".target-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".target-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentTarget = btn.dataset.target;
        updateTelemetryUI();
      });
    });

    document.querySelectorAll(".spec-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".spec-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentBand = btn.dataset.band;
      });
    });

    document.getElementById("exp-slider")?.addEventListener("input", (e) => {
      exposure = parseFloat(e.target.value);
      document.getElementById("exp-val").innerText = `${exposure.toFixed(1)}x`;
    });

    document.getElementById("zoom-slider")?.addEventListener("input", (e) => {
      zoom = parseInt(e.target.value) / 100;
      document.getElementById("zoom-val").innerText = `${e.target.value}%`;
    });

    function updateTelemetryUI() {
      const data = telemetryDB[currentTarget];
      if (data) {
        document.getElementById("tele-ra").innerText = data.ra;
        document.getElementById("tele-dec").innerText = data.dec;
        document.getElementById("tele-flux").innerText = data.flux;
        document.getElementById("tele-z").innerText = data.z;
      }
    }

    // Particle Swirl System for Accretion/Nebula Simulation
    const particles = Array.from({ length: 400 }, () => ({
      angle: Math.random() * Math.PI * 2,
      dist: 30 + Math.random() * 220,
      speed: 0.005 + Math.random() * 0.02,
      size: 1 + Math.random() * 2.5
    }));

    function renderTelescope() {
      ctx.fillStyle = "#020204";
      ctx.fillRect(0, 0, width, height);

      const pal = bandPalette[currentBand];

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.scale(zoom, zoom);

      // Background Star Noise
      for (let i = 0; i < 50; i++) {
        const sx = (Math.sin(i * 99) * width) / 2;
        const sy = (Math.cos(i * 33) * height) / 2;
        ctx.fillStyle = `rgba(255, 255, 255, ${0.1 * exposure})`;
        ctx.fillRect(sx, sy, 1.5, 1.5);
      }

      // Render Relativistic Jet (if target M87* or Cygnus)
      if (currentTarget === "m87" || currentTarget === "cygnus") {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(260 * exposure, -180 * exposure);
        ctx.strokeStyle = pal.jet;
        ctx.lineWidth = 4 * exposure;
        ctx.shadowBlur = 15;
        ctx.shadowColor = pal.jet;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Accretion Glow / Envelope
      const glowGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, 180 * exposure);
      glowGrad.addColorStop(0, pal.core);
      glowGrad.addColorStop(0.4, pal.glow);
      glowGrad.addColorStop(1, "transparent");

      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 180 * exposure, 0, Math.PI * 2);
      ctx.fill();

      // Swirling Particles
      particles.forEach(p => {
        p.angle += p.speed * (currentTarget === "crab" ? 2.5 : 1.0);
        const px = Math.cos(p.angle) * p.dist * exposure;
        const py = Math.sin(p.angle) * (p.dist * 0.4) * exposure; // Inclined disk

        ctx.fillStyle = pal.core;
        ctx.fillRect(px, py, p.size, p.size);
      });

      // Central Shadow Singularity / Core
      ctx.beginPath();
      ctx.arc(0, 0, currentTarget === "sgra" ? 24 : 32, 0, Math.PI * 2);
      ctx.fillStyle = "#000000";
      ctx.fill();
      ctx.strokeStyle = pal.core;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.restore();

      requestAnimationFrame(renderTelescope);
    }
    renderTelescope();
  }

  // ==========================================
  // 2. SPECTRAL LINE BROADENING CANVAS
  // ==========================================
  const specCanvas = document.getElementById("spectrum-canvas");
  if (specCanvas) {
    const sCtx = specCanvas.getContext("2d");
    let inclination = 45;
    let bhSpin = 0.95;

    document.getElementById("inc-slider")?.addEventListener("input", (e) => {
      inclination = parseInt(e.target.value);
      document.getElementById("inc-val").innerText = `${inclination}°`;
      updateSpecMetrics();
    });

    document.getElementById("spin-slider")?.addEventListener("input", (e) => {
      bhSpin = parseFloat(e.target.value);
      document.getElementById("spin-val").innerText = bhSpin.toFixed(2);
      updateSpecMetrics();
    });

    function updateSpecMetrics() {
      // ISCO = 6 - 5 * bhSpin approx
      const isco = (6 - 4.06 * bhSpin).toFixed(2);
      const doppler = (1 + Math.sin(inclination * Math.PI / 180) * 0.9).toFixed(2);
      const peak = (6.4 * (1 + 0.15 * Math.sin(inclination * Math.PI / 180))).toFixed(2);

      document.getElementById("spec-isco").innerText = `${isco} r_g`;
      document.getElementById("spec-doppler").innerText = `${doppler}x`;
      document.getElementById("spec-peak").innerText = `${peak} keV`;
    }

    function renderSpectrumGraph() {
      specCanvas.width = specCanvas.parentElement.clientWidth;
      specCanvas.height = specCanvas.parentElement.clientHeight - 30;

      const w = specCanvas.width;
      const h = specCanvas.height;

      sCtx.fillStyle = "#000";
      sCtx.fillRect(0, 0, w, h);

      // Draw Grid Lines
      sCtx.strokeStyle = "rgba(255, 255, 255, 0.05)";
      sCtx.lineWidth = 1;
      for (let x = 0; x < w; x += 40) {
        sCtx.beginPath(); sCtx.moveTo(x, 0); sCtx.lineTo(x, h); sCtx.stroke();
      }

      // Draw Asymmetric Relativistic Fe K-alpha Profile Curve
      sCtx.beginPath();
      sCtx.moveTo(0, h - 20);

      const incFactor = Math.sin(inclination * Math.PI / 180);

      for (let x = 0; x < w; x++) {
        const normX = x / w; // 0 to 1
        
        // Relativistic Skewed Double Peak Profile
        const redWing = Math.exp(-Math.pow(normX - 0.25, 2) / 0.08) * (0.4 + bhSpin * 0.3);
        const bluePeak = Math.exp(-Math.pow(normX - (0.65 + incFactor * 0.15), 2) / 0.015) * (0.8 + incFactor * 0.4);
        
        const flux = (redWing + bluePeak) * (h - 50);
        const y = h - 20 - flux;

        sCtx.lineTo(x, y);
      }

      sCtx.strokeStyle = "#ff4500";
      sCtx.lineWidth = 2.5;
      sCtx.stroke();

      // Fill Gradient under spectrum
      const fillGrad = sCtx.createLinearGradient(0, 0, 0, h);
      fillGrad.addColorStop(0, "rgba(255, 69, 0, 0.3)");
      fillGrad.addColorStop(1, "transparent");
      sCtx.fillStyle = fillGrad;
      sCtx.lineTo(w, h - 20);
      sCtx.lineTo(0, h - 20);
      sCtx.fill();

      requestAnimationFrame(renderSpectrumGraph);
    }
    renderSpectrumGraph();
    updateSpecMetrics();
  }

  // ==========================================
  // 3. GRAVITATIONAL WAVE CHIRP SIMULATOR
  // ==========================================
  const gwOrbitCanvas = document.getElementById("gw-orbit-canvas");
  const gwSignalCanvas = document.getElementById("gw-signal-canvas");

  if (gwOrbitCanvas && gwSignalCanvas) {
    const oCtx = gwOrbitCanvas.getContext("2d");
    const sCtx = gwSignalCanvas.getContext("2d");

    let chirpTime = 0;
    let isMergerTriggered = false;

    document.getElementById("trigger-chirp-btn")?.addEventListener("click", () => {
      chirpTime = 0;
      isMergerTriggered = true;
    });

    function renderGW() {
      // 1. Orbit Render
      gwOrbitCanvas.width = gwOrbitCanvas.parentElement.clientWidth;
      gwOrbitCanvas.height = gwOrbitCanvas.parentElement.clientHeight;
      const ow = gwOrbitCanvas.width;
      const oh = gwOrbitCanvas.height;

      oCtx.fillStyle = "#000";
      oCtx.fillRect(0, 0, ow, oh);

      chirpTime += 0.03;
      const orbitRadius = Math.max(8, 70 - chirpTime * 3);
      const orbitSpeed = 0.05 + 15 / orbitRadius;

      const x1 = ow / 2 + Math.cos(chirpTime * orbitSpeed) * orbitRadius;
      const y1 = oh / 2 + Math.sin(chirpTime * orbitSpeed) * orbitRadius;
      const x2 = ow / 2 - Math.cos(chirpTime * orbitSpeed) * orbitRadius;
      const y2 = oh / 2 - Math.sin(chirpTime * orbitSpeed) * orbitRadius;

      // Spacetime Ripple Rings
      oCtx.beginPath();
      oCtx.arc(ow/2, oh/2, (chirpTime * 18) % 140, 0, Math.PI * 2);
      oCtx.strokeStyle = "rgba(0, 210, 255, 0.25)";
      oCtx.stroke();

      // Binary Objects
      oCtx.beginPath(); oCtx.arc(x1, y1, 7, 0, Math.PI * 2); oCtx.fillStyle = "#00d2ff"; oCtx.fill();
      oCtx.beginPath(); oCtx.arc(x2, y2, 7, 0, Math.PI * 2); oCtx.fillStyle = "#ff4500"; oCtx.fill();

      // Reset chirp after merger
      if (orbitRadius <= 8) chirpTime = 0;

      // 2. Strain Signal h(t) Render
      gwSignalCanvas.width = gwSignalCanvas.parentElement.clientWidth;
      gwSignalCanvas.height = gwSignalCanvas.parentElement.clientHeight;
      const sw = gwSignalCanvas.width;
      const sh = gwSignalCanvas.height;

      sCtx.fillStyle = "#000";
      sCtx.fillRect(0, 0, sw, sh);

      sCtx.beginPath();
      for (let x = 0; x < sw; x++) {
        const progress = x / sw;
        const amp = Math.pow(progress, 2) * (sh / 2.5);
        const freq = 5 + progress * 35;
        const y = sh / 2 + Math.sin(progress * freq - chirpTime * 5) * amp;

        if (x === 0) sCtx.moveTo(x, y);
        else sCtx.lineTo(x, y);
      }
      sCtx.strokeStyle = "#00d2ff";
      sCtx.lineWidth = 2;
      sCtx.stroke();

      requestAnimationFrame(renderGW);
    }
    renderGW();
  }

});