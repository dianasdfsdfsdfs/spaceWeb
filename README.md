# Cosmos Explorer 🌌

An interactive 3D journey through the Solar System for space lovers. Planets sit
on a single shared orbit; swipe / drag / use the arrows to bring each world into
focus, watch it spin on its tilted axis, and open a panel of real facts, myths,
mysteries and the chance of life.

Built with **React + React Three Fiber** (Three.js), drei, postprocessing and
real NASA-style surface textures.

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
```

## Build for deployment (e.g. Vercel / Netlify)

```bash
npm run build    # outputs to /dist
npm run preview  # preview the production build
```

Deploy the `dist/` folder, or point Vercel/Netlify at the repo (framework: Vite).

## Controls

- **Drag / swipe** left-right, the **‹ ›** arrows, or the **← →** keys to travel between worlds.
- **Click a planet** (or "View details") to open its info panel. **Esc** closes it.
- The dots at the bottom jump straight to any body.

## Structure

```
src/
  data/planets.js        # all bodies + facts / myths / mysteries / life
  components/
    Carousel.jsx         # single-orbit carousel logic (rotation + scaling)
    Planet.jsx           # one textured, spinning, axis-tilted body
    Starfield.jsx        # milky-way backdrop + drifting stars
    InfoPanel.jsx        # slide-in info panel
    Navbar.jsx           # section tabs (only Solar System active for now)
    Loader.jsx           # loading screen
  App.jsx                # scene, camera, lights, bloom, HUD + navigation
public/textures/         # planet / sun / ring / milky-way textures
```

## Roadmap (phase 2)

Additional tabs of exotic objects, each as its own 3D scene with info:
**black holes** (rotating accretion disk), **nebulae**, **quasars**,
**pulsars**, **kilonovae** and other interstellar attractors.

Textures: © Solar System Scope (CC BY 4.0), free for this use.
