document.addEventListener("DOMContentLoaded", () => {

  // ==========================================
  // 1. GEODESIC SLINGSHOT CANVAS ENGINE
  // ==========================================
  const canvas = document.getElementById("slingshot-canvas");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    let width, height, centerX, centerY;

    function resizeCanvas() {
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
      centerX = width / 2;
      centerY = height / 2;
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Physical Parameters State
    let blackHoleMass = 66000000000; // TON 618 default
    let spinParameter = 0.99;
    let particleType = "photon";
    let scaleRs = 60; // Visual radius on screen
    let trajectories = [];
    let isDragging = false;
    let dragStart = { x: 0, y: 0 };
    let dragCurrent = { x: 0, y: 0 };

    // Update Presets
    const presetBtns = document.querySelectorAll(".preset-btn");
    presetBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        presetBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        blackHoleMass = parseFloat(btn.dataset.mass);
        spinParameter = parseFloat(btn.dataset.spin);
        const name = btn.dataset.name;

        // Update HUD Telemetry
        document.getElementById("tele-name").innerText = name;
        document.getElementById("tele-rs").innerText = blackHoleMass > 1000 
          ? `${(blackHoleMass * 2.95 / 1.496e8).toFixed(1)} AU` 
          : `${(blackHoleMass * 2.95).toFixed(1)} km`;
        
        document.getElementById("spin-range").value = spinParameter;
        document.getElementById("spin-val").innerText = spinParameter;
        trajectories = []; // Clear past trails
      });
    });

    document.getElementById("spin-range")?.addEventListener("input", (e) => {
      spinParameter = parseFloat(e.target.value);
      document.getElementById("spin-val").innerText = spinParameter;
    });

    document.getElementById("particle-type")?.addEventListener("change", (e) => {
      particleType = e.target.value;
    });

    document.getElementById("clear-trajectories")?.addEventListener("click", () => {
      trajectories = [];
      document.getElementById("tele-status").innerText = "CANVAS CLEARED";
      document.getElementById("tele-periapsis").innerText = "--";
    });

    // Aiming Mouse Drag Controls
    canvas.addEventListener("mousedown", (e) => {
      const rect = canvas.getBoundingClientRect();
      dragStart.x = e.clientX - rect.left;
      dragStart.y = e.clientY - rect.top;
      dragCurrent = { ...dragStart };
      isDragging = true;
    });

    canvas.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      const rect = canvas.getBoundingClientRect();
      dragCurrent.x = e.clientX - rect.left;
      dragCurrent.y = e.clientY - rect.top;
    });

    canvas.addEventListener("mouseup", () => {
      if (!isDragging) return;
      isDragging = false;

      // Launch Probe Particle
      const vx = (dragStart.x - dragCurrent.x) * 0.08;
      const vy = (dragStart.y - dragCurrent.y) * 0.08;

      trajectories.push({
        points: [{ x: dragStart.x, y: dragStart.y }],
        x: dragStart.x,
        y: dragStart.y,
        vx: vx,
        vy: vy,
        captured: false,
        escaped: false,
        closestDist: Infinity,
        type: particleType
      });

      document.getElementById("tele-status").innerText = "PROBE IN FLIGHT...";
    });

    // Auto-Beam Generator
    document.getElementById("fire-default-beam")?.addEventListener("click", () => {
      for (let i = -4; i <= 4; i++) {
        if (i === 0) continue;
        const startY = centerY + i * 25;
        trajectories.push({
          points: [{ x: 40, y: startY }],
          x: 40,
          y: startY,
          vx: 6.5,
          vy: 0,
          captured: false,
          escaped: false,
          closestDist: Infinity,
          type: particleType
        });
      }
      document.getElementById("tele-status").innerText = "MULTIPLE BEAMS FIRED";
    });

    // Physics Geodesic Integration Loop
    function updateTrajectories() {
      const G = 1.2; // Scaling constant for visualization

      trajectories.forEach(tr => {
        if (tr.captured || tr.escaped) return;

        // Step solver
        for (let step = 0; step < 4; step++) {
          const dx = centerX - tr.x;
          const dy = centerY - tr.y;
          const r = Math.hypot(dx, dy);

          if (r < tr.closestDist) tr.closestDist = r;

          // Event Horizon Capture Condition
          if (r < scaleRs * 0.6) {
            tr.captured = true;
            document.getElementById("tele-status").innerText = "HORIZON CAPTURED";
            document.getElementById("tele-periapsis").innerText = `${(tr.closestDist / scaleRs).toFixed(2)} r_s`;
            break;
          }

          // Escaped Viewport Condition
          if (r > Math.max(width, height) * 1.5) {
            tr.escaped = true;
            document.getElementById("tele-status").innerText = "DEFLECTED TO INFINITY";
            document.getElementById("tele-periapsis").innerText = `${(tr.closestDist / scaleRs).toFixed(2)} r_s`;
            break;
          }

          // Relativistic Effective Gravitational Deflection
          const force = (G * scaleRs * 25) / (r * r * r);
          
          // Frame Dragging Kerr Spin Assist
          const spinLocus = (spinParameter * 8) / (r + 1);
          const spinVx = -dy * spinLocus * 0.005;
          const spinVy = dx * spinLocus * 0.005;

          tr.vx += dx * force + spinVx;
          tr.vy += dy * force + spinVy;

          tr.x += tr.vx;
          tr.y += tr.vy;

          tr.points.push({ x: tr.x, y: tr.y });
        }
      });
    }

    // Main Draw Frame
    function render() {
      ctx.fillStyle = "#030305";
      ctx.fillRect(0, 0, width, height);

      // 1. Accretion Disk with Relativistic Doppler Beaming
      const diskRadiusX = scaleRs * 3.5;
      const diskRadiusY = scaleRs * 1.1;

      const grad = ctx.createRadialGradient(centerX, centerY, scaleRs * 0.8, centerX, centerY, diskRadiusX);
      grad.addColorStop(0, "rgba(255, 69, 0, 0.9)"); // Orange Horizon
      grad.addColorStop(0.4, "rgba(0, 210, 255, 0.4)"); // Blue-shifted Doppler side
      grad.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.beginPath();
      ctx.ellipse(centerX, centerY, diskRadiusX, diskRadiusY, 0, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // 2. Photon Sphere Ring Glow
      ctx.beginPath();
      ctx.arc(centerX, centerY, scaleRs * 1.5, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 3. Black Hole Shadow / Event Horizon
      ctx.beginPath();
      ctx.arc(centerX, centerY, scaleRs * 0.7, 0, Math.PI * 2);
      ctx.fillStyle = "#000000";
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 69, 0, 0.8)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // 4. Render Active Trajectories
      updateTrajectories();

      trajectories.forEach(tr => {
        if (tr.points.length < 2) return;

        ctx.beginPath();
        ctx.moveTo(tr.points[0].x, tr.points[0].y);
        for (let i = 1; i < tr.points.length; i++) {
          ctx.lineTo(tr.points[i].x, tr.points[i].y);
        }

        ctx.strokeStyle = tr.captured ? "rgba(255, 69, 0, 0.8)" : "rgba(0, 210, 255, 0.8)";
        ctx.lineWidth = tr.type === "photon" ? 1.5 : 2.5;
        ctx.stroke();
      });

      // 5. Render Aiming Sight Vector
      if (isDragging) {
        ctx.beginPath();
        ctx.moveTo(dragStart.x, dragStart.y);
        ctx.lineTo(dragCurrent.x, dragCurrent.y);
        ctx.strokeStyle = "#ff4500";
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.beginPath();
        ctx.arc(dragStart.x, dragStart.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = "#ff4500";
        ctx.fill();
      }

      requestAnimationFrame(render);
    }
    render();
  }

  // ==========================================
  // 2. INTERACTIVE ANATOMY EXPLORER
  // ==========================================
  const anatomyNodes = document.querySelectorAll(".anatomy-node");
  const layerTitle = document.getElementById("layer-title");
  const layerDesc = document.getElementById("layer-desc");
  const layerCode = document.getElementById("layer-code");
  const layerDim = document.getElementById("layer-dim");
  const layerDensity = document.getElementById("layer-density");
  const layerForce = document.getElementById("layer-force");

  const anatomyData = {
    singularity: {
      code: "LAYER: 01 // CORE",
      title: "RING SINGULARITY",
      desc: "In a Kerr rotating black hole, the central gravitational singularity collapses into a ring with zero thickness rather than a point. Matter inside the ring experiences extreme frame dragging and potential temporal loops.",
      dim: "1D Ring (r = a)",
      density: "Infinite (ρ → ∞)",
      force: "Extreme Spaghettification"
    },
    "inner-horizon": {
      code: "LAYER: 02 // CAUCHY",
      title: "INNER HORIZON (CAUCHY)",
      desc: "The inner horizon acts as a boundary of determinism. Beyond this surface, general relativity field equations cannot uniquely predict the future evolution of space and time.",
      dim: "Spherical Surface (r_−)",
      density: "Finite Metric Boundary",
      force: "Mass Inflation Instability"
    },
    "outer-horizon": {
      code: "LAYER: 03 // BOUNDARY",
      title: "EVENT HORIZON (r_H)",
      desc: "The point of no return. Escape velocity exceeds the speed of light (c). All causal light cones tilt inward toward the central singularity.",
      dim: "2D Surface Area (A = 4πr_H²)",
      density: "Surface Gravity (κ)",
      force: "Irreversible Capture"
    },
    ergosphere: {
      code: "LAYER: 04 // ROTATIONAL",
      title: "ERGOSPHERE BOUNDARY",
      desc: "An oblate region outside the outer horizon where the spin of the black hole drags the fabric of space itself. Nothing can stay still relative to infinity.",
      dim: "Spheroidal Zone",
      density: "Relativistic Drag Factor",
      force: "Penrose Energy Extraction"
    },
    "photon-sphere": {
      code: "LAYER: 05 // OPTICAL",
      title: "PHOTON SPHERE",
      desc: "A unstable spherical region where photons are forced to orbit in circular orbits around the black hole, creating light rings and lensing shadows.",
      dim: "1.5 r_s to 3.0 r_s",
      density: "Photon Trapping Orbit",
      force: "Extreme Gravitational Lensing"
    }
  };

  anatomyNodes.forEach(node => {
    node.addEventListener("click", () => {
      anatomyNodes.forEach(n => n.classList.remove("active"));
      node.classList.add("active");

      const layerKey = node.dataset.layer;
      const data = anatomyData[layerKey];

      if (data) {
        layerCode.innerText = data.code;
        layerTitle.innerText = data.title;
        layerDesc.innerText = data.desc;
        layerDim.innerText = data.dim;
        layerDensity.innerText = data.density;
        layerForce.innerText = data.force;
      }
    });
  });

  // ==========================================
  // 3. HAWKING EVAPORATION LAB & CALCULATOR
  // ==========================================
  const hawkingSlider = document.getElementById("hawking-mass-slider");
  const hawkingMassDisplay = document.getElementById("hawking-mass-display");
  const hTemp = document.getElementById("h-temp");
  const hLife = document.getElementById("h-life");
  const hPower = document.getElementById("h-power");
  const hArea = document.getElementById("h-area");

  if (hawkingSlider) {
    hawkingSlider.addEventListener("input", (e) => {
      const exp = parseFloat(e.target.value); // Log scale exponent (-15 to +11 M_solar)
      const massSolar = Math.pow(10, exp);
      const massKg = massSolar * 1.989e30;

      // Real Hawking Equations
      // T_H = (hbar * c^3) / (8 * pi * G * M * k_B)
      const tempK = 1.227e23 / massKg;
      
      // Lifetime t_evap = (5120 * pi * G^2 * M^3) / (hbar * c^4)
      const lifetimeYears = 8.41e-17 * Math.pow(massKg, 3) / (365 * 24 * 3600);

      // Power P = (hbar * c^6) / (15360 * pi * G^2 * M^2)
      const powerWatts = 3.56e32 / (massKg * massKg);

      // Horizon Area A = 16 * pi * G^2 * M^2 / c^4
      const areaKm2 = 1.1e-16 * Math.pow(massSolar, 2);

      // Display formatting
      hawkingMassDisplay.innerText = massSolar >= 1 
        ? `${massSolar.toExponential(2)} M☉ (Solar Mass)` 
        : `${(massKg).toExponential(2)} kg`;

      hTemp.innerText = `${tempK.toExponential(2)} K`;
      hLife.innerText = lifetimeYears > 1e100 ? "> 10¹⁰⁰ Years" : `${lifetimeYears.toExponential(2)} Years`;
      hPower.innerText = `${powerWatts.toExponential(2)} Watts`;
      hArea.innerText = `${areaKm2.toExponential(2)} km²`;
    });
  }

  // Quantum Particle Pairs Canvas
  const qCanvas = document.getElementById("quantum-canvas");
  if (qCanvas) {
    const qCtx = qCanvas.getContext("2d");
    let particles = [];

    function resizeQ() {
      qCanvas.width = qCanvas.parentElement.clientWidth;
      qCanvas.height = qCanvas.parentElement.clientHeight;
    }
    resizeQ();

    function renderQuantum() {
      qCtx.fillStyle = "rgba(0, 0, 0, 0.2)";
      qCtx.fillRect(0, 0, qCanvas.width, qCanvas.height);

      const horizonX = qCanvas.width * 0.4;

      // Event Horizon Line
      qCtx.beginPath();
      qCtx.moveTo(horizonX, 0);
      qCtx.lineTo(horizonX, qCanvas.height);
      qCtx.strokeStyle = "rgba(255, 69, 0, 0.8)";
      qCtx.lineWidth = 2;
      qCtx.stroke();

      // Spawn Virtual Pairs
      if (Math.random() < 0.2) {
        const spawnY = Math.random() * qCanvas.height;
        particles.push({
          x1: horizonX, x2: horizonX,
          y: spawnY,
          life: 0
        });
      }

      particles.forEach((p, index) => {
        p.x1 -= 1.5; // Captured particle inside horizon
        p.x2 += 1.5; // Escaped Hawking photon radiation
        p.life += 1;

        // Draw Negative Mass Particle Inside
        qCtx.beginPath();
        qCtx.arc(p.x1, p.y, 3, 0, Math.PI * 2);
        qCtx.fillStyle = "#ff4500";
        qCtx.fill();

        // Draw Escaping Hawking Radiation Particle Outside
        qCtx.beginPath();
        qCtx.arc(p.x2, p.y, 3, 0, Math.PI * 2);
        qCtx.fillStyle = "#00d2ff";
        qCtx.fill();

        if (p.life > 60) particles.splice(index, 1);
      });

      requestAnimationFrame(renderQuantum);
    }
    renderQuantum();
  }

  // ==========================================
  // 4. ATLAS CATALOG FILTERING
  // ==========================================
  const filterBtns = document.querySelectorAll(".cat-filter");
  const catalogCards = document.querySelectorAll(".cat-card");

  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const filter = btn.dataset.filter;

      catalogCards.forEach(card => {
        if (filter === "all" || card.dataset.category === filter) {
          card.style.display = "flex";
        } else {
          card.style.display = "none";
        }
      });
    });
  });

});