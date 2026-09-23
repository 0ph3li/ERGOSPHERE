document.addEventListener("DOMContentLoaded", () => {

  // ==========================================
  // 1. 3D SPACETIME GRID & LENSING SIMULATOR
  // ==========================================
  const stCanvas = document.getElementById("spacetime-canvas");
  if (stCanvas) {
    const ctx = stCanvas.getContext("2d");
    let width, height, centerX, centerY;

    function resizeSt() {
      width = stCanvas.width = stCanvas.parentElement.clientWidth;
      height = stCanvas.height = stCanvas.parentElement.clientHeight;
      centerX = width / 2;
      centerY = height / 2;
    }
    resizeSt();
    window.addEventListener("resize", resizeSt);

    // Physics State
    let currentMass = 1;
    let currentRadius = 20;
    let currentType = "sun";
    let depthMultiplier = 1.0;
    let lightRayCount = 24;
    let gridRotationX = 0.55; // Isometric angle perspective

    // Mass Presets
    const sourceBtns = document.querySelectorAll(".source-btn");
    sourceBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        sourceBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        currentMass = parseFloat(btn.dataset.mass);
        currentRadius = parseFloat(btn.dataset.radius);
        currentType = btn.dataset.type;

        updateTelemetry();
      });
    });

    document.getElementById("depth-range")?.addEventListener("input", (e) => {
      depthMultiplier = parseFloat(e.target.value);
      document.getElementById("depth-val").innerText = `${depthMultiplier.toFixed(1)}x`;
      updateTelemetry();
    });

    document.getElementById("rays-range")?.addEventListener("input", (e) => {
      lightRayCount = parseInt(e.target.value);
      document.getElementById("rays-val").innerText = lightRayCount;
    });

    function updateTelemetry() {
      const theta = (1.75 * currentMass * depthMultiplier).toFixed(2);
      const gammaTime = (1 + (0.000002 * currentMass * depthMultiplier)).toFixed(6);
      const ring = (0.82 * Math.sqrt(currentMass)).toFixed(2);

      document.getElementById("tele-angle").innerText = `${theta} arcsec`;
      document.getElementById("tele-time-dilation").innerText = gammaTime;
      document.getElementById("tele-ring").innerText = `${ring} AU`;
    }

    // Interactive Drag Angle
    let isDragging = false;
    let lastY = 0;

    stCanvas.addEventListener("mousedown", (e) => {
      isDragging = true;
      lastY = e.clientY;
    });

    window.addEventListener("mouseup", () => isDragging = false);

    stCanvas.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      const deltaY = e.clientY - lastY;
      gridRotationX += deltaY * 0.003;
      gridRotationX = Math.max(0.2, Math.min(1.2, gridRotationX)); // Clamping
      lastY = e.clientY;
    });

    // Render 3D Wireframe Spacetime Grid
    function renderSpacetime() {
      ctx.fillStyle = "#030305";
      ctx.fillRect(0, 0, width, height);

      const cols = 32;
      const rows = 32;
      const spacing = 28;

      // Draw Grid Mesh
      for (let i = -cols/2; i <= cols/2; i++) {
        ctx.beginPath();
        for (let j = -rows/2; j <= rows/2; j++) {
          const x3d = i * spacing;
          const y3d = j * spacing;
          const dist = Math.hypot(x3d, y3d);

          // Gravitational Well Depth (Deformation Equation)
          const zDepth = -(currentMass * depthMultiplier * 1800) / (dist + currentRadius * 4);

          // Project 3D to 2D Screen
          const screenX = centerX + x3d;
          const screenY = centerY + (y3d * Math.sin(gridRotationX)) - (zDepth * Math.cos(gridRotationX));

          if (j === -rows/2) ctx.moveTo(screenX, screenY);
          else ctx.lineTo(screenX, screenY);
        }
        ctx.strokeStyle = "rgba(0, 210, 255, 0.25)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      for (let j = -rows/2; j <= rows/2; j++) {
        ctx.beginPath();
        for (let i = -cols/2; i <= cols/2; i++) {
          const x3d = i * spacing;
          const y3d = j * spacing;
          const dist = Math.hypot(x3d, y3d);

          const zDepth = -(currentMass * depthMultiplier * 1800) / (dist + currentRadius * 4);

          const screenX = centerX + x3d;
          const screenY = centerY + (y3d * Math.sin(gridRotationX)) - (zDepth * Math.cos(gridRotationX));

          if (i === -cols/2) ctx.moveTo(screenX, screenY);
          else ctx.lineTo(screenX, screenY);
        }
        ctx.strokeStyle = "rgba(0, 210, 255, 0.25)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Render Central Mass Source
      const coreDepth = -(currentMass * depthMultiplier * 1800) / (currentRadius * 4);
      const coreY = centerY - (coreDepth * Math.cos(gridRotationX));

      ctx.beginPath();
      ctx.arc(centerX, coreY, Math.max(6, currentRadius * 0.8), 0, Math.PI * 2);
      ctx.fillStyle = currentType === "black-hole" ? "#000" : (currentType === "sun" ? "#ff8c00" : "#00d2ff");
      ctx.fill();
      ctx.strokeStyle = "#ff4500";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Render Deflected Light Rays (Gravitational Lensing)
      for (let r = 0; r < lightRayCount; r++) {
        const angle = (r / lightRayCount) * Math.PI * 2;
        const startX = centerX + Math.cos(angle) * 350;
        const startY = centerY + Math.sin(angle) * 350 * Math.sin(gridRotationX);

        ctx.beginPath();
        ctx.moveTo(startX, startY);

        // Curve ray towards center
        const controlX = centerX + Math.cos(angle) * (100 / (currentMass * 0.2 + 1));
        const controlY = centerY + Math.sin(angle) * (100 / (currentMass * 0.2 + 1)) * Math.sin(gridRotationX);

        ctx.quadraticCurveTo(controlX, controlY, centerX, coreY);
        ctx.strokeStyle = "rgba(255, 69, 0, 0.4)";
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      requestAnimationFrame(renderSpacetime);
    }
    renderSpacetime();
  }

  // ==========================================
  // 2. LORENTZ ACCELERATOR SIMULATOR
  // ==========================================
  const lCanvas = document.getElementById("lorentz-canvas");
  if (lCanvas) {
    const lCtx = lCanvas.getContext("2d");
    let speed = 0.850; // beta = v/c

    const speedSlider = document.getElementById("speed-slider");
    speedSlider?.addEventListener("input", (e) => {
      speed = parseFloat(e.target.value);
      updateLorentzCalculations();
    });

    function updateLorentzCalculations() {
      const beta = speed;
      const gamma = 1 / Math.sqrt(1 - beta * beta);
      const lengthContraction = (100 / gamma).toFixed(1);
      const tickRate = (1 / gamma).toFixed(3);
      const doppler = Math.sqrt((1 + beta) / (1 - beta)).toFixed(2);

      document.getElementById("speed-display").innerText = `${beta.toFixed(3)} c`;
      document.getElementById("beta-val").innerText = `${beta.toFixed(3)} c`;
      document.getElementById("lorentz-gamma").innerText = gamma > 20 ? "> 22.3" : gamma.toFixed(3);
      document.getElementById("lorentz-length").innerText = `${lengthContraction} %`;
      document.getElementById("lorentz-clock").innerText = `${tickRate}s / sec`;
      document.getElementById("lorentz-doppler").innerText = `${doppler}x (Blue)`;
    }

    let probeX = 0;

    function renderLorentz() {
      lCanvas.width = lCanvas.parentElement.clientWidth;
      lCanvas.height = lCanvas.parentElement.clientHeight;

      lCtx.fillStyle = "#000";
      lCtx.fillRect(0, 0, lCanvas.width, lCanvas.height);

      const gamma = 1 / Math.sqrt(1 - speed * speed);
      const probeRestWidth = 140;
      const contractedWidth = Math.max(10, probeRestWidth / gamma);
      const probeHeight = 40;

      // Advance Probe
      probeX += (2 + speed * 12);
      if (probeX > lCanvas.width + 100) probeX = -100;

      const pY = lCanvas.height / 2 - probeHeight / 2;

      // Draw Light Wave Fronts (Doppler Shifted)
      const waveColor = `hsl(${220 - speed * 180}, 100%, 50%)`; // Blue shift gradient
      for (let w = 0; w < 5; w++) {
        lCtx.beginPath();
        const waveX = probeX + contractedWidth + w * (25 * (1 - speed * 0.8));
        lCtx.arc(waveX, lCanvas.height / 2, 20 + w * 12, -Math.PI/2, Math.PI/2);
        lCtx.strokeStyle = waveColor;
        lCtx.lineWidth = 1.5;
        lCtx.stroke();
      }

      // Draw Relativistic Probe Box
      lCtx.fillStyle = "rgba(255, 69, 0, 0.2)";
      lCtx.strokeStyle = "#ff4500";
      lCtx.lineWidth = 2;
      lCtx.fillRect(probeX, pY, contractedWidth, probeHeight);
      lCtx.strokeRect(probeX, pY, contractedWidth, probeHeight);

      // Probe Cockpit Light
      lCtx.beginPath();
      lCtx.arc(probeX + contractedWidth, lCanvas.height/2, 4, 0, Math.PI * 2);
      lCtx.fillStyle = waveColor;
      lCtx.fill();

      requestAnimationFrame(renderLorentz);
    }
    renderLorentz();
    updateLorentzCalculations();
  }

  // ==========================================
  // 3. GRAVITATIONAL REDSHIFT WAVE CANVAS
  // ==========================================
  const waveCanvas = document.getElementById("wave-canvas");
  if (waveCanvas) {
    const wCtx = waveCanvas.getContext("2d");
    let radiusRatio = 1.50;

    const redSlider = document.getElementById("redshift-radius-slider");
    redSlider?.addEventListener("input", (e) => {
      radiusRatio = parseFloat(e.target.value);
      updateRedshiftMetrics();
    });

    function updateRedshiftMetrics() {
      // z = (1 - 2GM/rc^2)^(-1/2) - 1  => for r in r_s terms: sqrt(1 - 1/r)^(-1) - 1
      const zFactor = (1 / Math.sqrt(1 - (1 / radiusRatio))) - 1;
      const freqLoss = (100 * (1 - 1 / (1 + zFactor))).toFixed(1);
      const timeRatio = (1 + zFactor).toFixed(3);
      const escapeV = Math.sqrt(1 / radiusRatio).toFixed(3);

      document.getElementById("radius-display").innerText = `${radiusRatio.toFixed(2)} r_s`;
      document.getElementById("r-z-factor").innerText = zFactor > 10 ? "> 10.0" : zFactor.toFixed(3);
      document.getElementById("r-freq-loss").innerText = `-${freqLoss} %`;
      document.getElementById("r-time-ratio").innerText = `${timeRatio}x`;
      document.getElementById("r-escape-v").innerText = `${escapeV} c`;
    }

    let wavePhase = 0;

    function renderRedshiftWave() {
      waveCanvas.width = waveCanvas.parentElement.clientWidth;
      waveCanvas.height = waveCanvas.parentElement.clientHeight;

      wCtx.fillStyle = "#000";
      wCtx.fillRect(0, 0, waveCanvas.width, waveCanvas.height);

      wavePhase += 0.05;
      const cy = waveCanvas.height / 2;

      wCtx.beginPath();
      for (let x = 0; x < waveCanvas.width; x++) {
        // Frequency decreases along x (Blue at left surface -> Red at right distance)
        const distanceProgress = x / waveCanvas.width;
        const zShift = (1 / Math.sqrt(1 - (1 / (radiusRatio + distanceProgress * 4)))) - 1;
        const wavelength = 15 + distanceProgress * 30 * (1 + zShift);

        const y = cy + Math.sin((x / wavelength) - wavePhase) * 35;

        if (x === 0) wCtx.moveTo(x, y);
        else wCtx.lineTo(x, y);
      }

      // Dynamic Color Shift along the path
      const grad = wCtx.createLinearGradient(0, 0, waveCanvas.width, 0);
      grad.addColorStop(0, "#00d2ff"); // High energy cyan/blue
      grad.addColorStop(0.5, "#ff8c00"); // Intermediate amber
      grad.addColorStop(1, "#ff0044"); // Low energy redshifted red

      wCtx.strokeStyle = grad;
      wCtx.lineWidth = 3;
      wCtx.stroke();

      requestAnimationFrame(renderRedshiftWave);
    }
    renderRedshiftWave();
    updateRedshiftMetrics();
  }

  // ==========================================
  // 4. EINSTEIN TENSOR MATRIX INTERACTIVITY
  // ==========================================
  const tensorBlocks = document.querySelectorAll(".tensor-block");
  const tensorCode = document.getElementById("tensor-code");
  const tensorTitle = document.getElementById("tensor-title");
  const tensorDesc = document.getElementById("tensor-desc");
  const tensorDim = document.getElementById("tensor-dim");
  const tensorPhys = document.getElementById("tensor-phys");

  const tensorData = {
    "ricci-tensor": {
      code: "COMPONENT: 01 // CURVATURE TENSOR",
      title: "RICCI CURVATURE TENSOR (R_μν)",
      desc: "Represents the degree to which the geometry of Riemannian spacetime deviates from flat Euclidean space. It captures the tidal forces exerted by gravity on volume elements.",
      dim: "4x4 Symmetric Matrix (10 Independent Components)",
      phys: "Volume Change of Geodesic Spheres"
    },
    "ricci-scalar": {
      code: "COMPONENT: 02 // SCALAR CURVATURE",
      title: "RICCI SCALAR (R g_μν)",
      desc: "The simplest scalar invariant of spacetime curvature, formed by contracting the Ricci tensor with the metric tensor g_μν.",
      dim: "Single Scalar Value per Point",
      phys: "Intrinsic Trace of Spacetime Distortion"
    },
    lambda: {
      code: "COMPONENT: 03 // COSMOLOGICAL",
      title: "COSMOLOGICAL CONSTANT (Λ g_μν)",
      desc: "Represents the intrinsic energy density of vacuum spacetime (Dark Energy), driving the accelerated expansion of the universe.",
      dim: "Constant Energy Density Tensor",
      phys: "Negative Vacuum Pressure"
    },
    coupling: {
      code: "COMPONENT: 04 // EINSTEIN COUPLING",
      title: "EINSTEIN COUPLING CONSTANT (κ)",
      desc: "Proportionality factor (8πG / c⁴) linking matter-energy distribution directly to the geometric deformation of spacetime.",
      dim: "2.076 × 10⁻⁴³ s² / (kg·m)",
      phys: "Spacetime Stiffness Factor"
    },
    "stress-energy": {
      code: "COMPONENT: 05 // MATTER DISTRIBUTION",
      title: "STRESS-ENERGY TENSOR (T_μν)",
      desc: "Encapsulates the density and flux of energy, momentum, shear stress, and pressure throughout the physical system.",
      dim: "4x4 Symmetric Matrix (10 Components)",
      phys: "Energy Density, Momentum Flux, Pressure"
    }
  };

  tensorBlocks.forEach(block => {
    block.addEventListener("click", () => {
      tensorBlocks.forEach(b => b.classList.remove("active"));
      block.classList.add("active");

      const key = block.dataset.tensor;
      const data = tensorData[key];

      if (data) {
        tensorCode.innerText = data.code;
        tensorTitle.innerText = data.title;
        tensorDesc.innerText = data.desc;
        tensorDim.innerText = data.dim;
        tensorPhys.innerText = data.phys;
      }
    });
  });

});