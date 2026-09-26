# ERGOSPHERE

**Relativistic astrophysics & spacetime dynamics.**

ERGOSPHERE is an interactive web laboratory about black holes and relativity. Styled like the control panel of a deep-space research station, it lets you launch photons around singularities, bend spacetime with different masses, accelerate a probe toward light speed and observe cosmic objects across the electromagnetic spectrum.

🔗 **Live site:** https://0ph3li.github.io/ERGOSPHERE/

---

## ✦ Modules

| Page | Module | What you can do |
|------|--------|-----------------|
| `index.html` | **Station-01 / Home** | Cosmic frequency radio that synthesizes the "sound" of black holes, plus a dashboard on Kerr metrics, ergosphere limits and gravitational lensing |
| `singularities.html` | **Singularities Atlas** | Click and drag to launch photons or matter toward TON 618, M87\*, Sgr A\* and more, then explore the layers of a rotating black hole |
| `physics.html` | **Relativistic Physics** | Deform a 3D spacetime grid with different masses (from the Sun to a wormhole), and accelerate a probe to see length contraction, time dilation and Doppler shift |
| `observatory.html` | **Deep Space Observatory** | Point a telescope array at M87\*, Sgr A\*, the Crab Nebula or Cygnus X-1, switch between infrared, optical, X-ray and gamma-ray, and study spectral lines |

## ✦ Features

- **Real-time canvas simulations:** orbits, gravitational lensing, a rotatable 3D metric grid
- **Generated audio:** cosmic radio built with the Web Audio API, with presets (Kerr horizon hum, pulsar, Hawking static)
- **Live values** calculated from real physics formulas: Lorentz factor, time dilation, Schwarzschild radius, light deflection
- **Sci-fi control-room interface** with telemetry, status bars and animated readouts

## ✦ Built with

- HTML, CSS and vanilla JavaScript
- Canvas API for all simulations
- Web Audio API for the cosmic radio
- [GSAP](https://gsap.com/) for animations
- Google Fonts: Unbounded, Space Grotesk, JetBrains Mono
- Hosted on GitHub Pages

## ✦ Project structure
ERGOSPHERE/
├── index.html # home, with style.css + app.js (shared)
├── singularities.html # + singularities.js
├── physics.html # + physics.css, physics.js
├── observatory.html # + observatory.css, observatory.js
└── LOGO/ # logo


## ✦ Run it locally

No installation needed: download or clone the repository and open `index.html` in your browser.

## ✦ Credits

Design and development by **ghostlygrl - 0ph3li**.
Made as a personal project, 2026.

> ERGOSPHERE is a fictional observatory. Simulations are simplified and made for exploration, not scientific accuracy.
