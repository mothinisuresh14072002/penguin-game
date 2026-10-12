# 🧪 Pawverse Dash — game tester's acceptance plan

This document defines the criteria used to assess Pawverse Dash as a
**playable Three.js game**, not just as JavaScript that builds.

## Automated tests

GitHub Actions runs two independent jobs on each push to `main`:

1. **Web build and unit tests:** `node --test tests/*.test.js`,
   JavaScript syntax checks, Vite production build, and existence of both
   `dist/index.html` and `dist/race.html`.
2. **Real Chromium gameplay QA:** starts the Vite game in a real software-
   rendered Chromium browser and uses Playwright to click, type and swipe.
   It writes `qa-artifacts/results.json` and representative PNG screenshots,
   uploaded as the `pawverse-chromium-qa` workflow artifact.

### Acceptance checklist

| Area | Required behavior | Automation |
|---|---|---|
| Start screen | Pawverse Dash logo, interactive menu, rendered WebGL canvas | Browser |
| Character selection | All seven characters available; locked items request coins | Browser |
| World switching | Every animal switches to its correctly named biome | Browser |
| Shop purchase | Correct coin deduction, unlock and reload persistence | Browser |
| Solo runner | Distance advances, energy changes, jump and lane controls respond | Browser |
| Pause/resume | Pausing freezes distance; resuming continues | Browser |
| Race | Two independently moving runners, their own coin/energy/distance HUD | Browser |
| Keyboard | Player 1 and Player 2 can independently move and jump | Browser |
| Phone layout | Portrait canvas fits phone viewport; split-screen areas exist | Browser |
| Phone controls | Solo and both racers accept touch/pointer swipes | Browser |
| High-speed collision | Obstacles cannot be skipped between frames | Unit |
| Sideways collision | Crossing a lane checks the full movement path | Unit |
| Jump collision | Height is evaluated at the moment the obstacle is crossed | Unit |
| Slide / log | Raised log gates can be slid beneath; rock/spikes cannot | Unit |
| Race fairness | Randomised rows always leave a safe lane | Unit |
| World geometry | Each of seven biomes has proper 3D props/horizon/road scheme | Unit |
| Optional GLB | A missing/untextured model uses an attractive procedural fallback | Unit |
| Web bundle | Both pages build successfully | CI |

Screenshots are **actual Chromium renders** produced in CI, not AI-generated
concept images. The browser test uses `?qa=1` to expose read-only state
snapshots; these do not permit cheating, inject obstacles, or alter the game.

### How to run tests

Install dependencies and start Vite in one terminal:

```cmd
npm install
npm run dev
```

In a second terminal, install the Playwright browser tester and Chromium,
then run the same test suite as CI:

```cmd
npm install --no-save playwright@1.56.1
npx playwright install chromium
node tests/browserQA.mjs
```

The local test runner expects `http://127.0.0.1:5173` by default.
To run only fast unit tests use `node --test tests/*.test.js`.

## Still requiring manual acceptance

**Passing Chromium tests does not mean the game matches the cinematic
reference image exactly or is safe to publish.** These are separate
release gates:

- **Character visual quality:** compare all seven actual in-game animals
  against the user's reference in a real browser. Film-quality fur and
  rigged animations are not available with the current procedural models.
- **Hardware performance:** profile FPS, heat, battery and memory on
  entry-level Android phones, high refresh-rate phones and Windows PCs.
  Software-rendered CI frames are not a representative benchmark.
- **Touch ergonomics:** two humans should play portrait split-screen on
  actual phones; test accidental touches, finger occlusion and orientation.
- **Long-play reliability:** sustained 20-minute solo runs and repeated
  race rematches must be tested for memory leaks, dropped inputs and GPU
  context loss.
- **Accessibility:** keyboard focus order, high-contrast HUD, visual
  alternatives to sound, motion-sensitive options.
- **Android release:** signed release bundle, Play policy/privacy review,
  store artwork, app icon and real-device installation still pending.
- **Collision/game feel:** automated continuous collision math is covered,
  but manual judgment is needed for how close the avatar can visually
  approach obstacles and whether 3D character feet align with the road.
- **Purchased/unlocked progress:** localStorage persists on the same device;
  there is no cloud sync or cross-device account.

## Reporting a new bug

Include mode, selected character, device/browser, steps to reproduce,
expected outcome, actual result, and screenshot/video if possible.
Use [GitHub Issues](https://github.com/mothinisuresh14072002/penguin-game/issues).

**Launch decision:** only the completed automated checks should be called
"passed". Real-device, accessibility and release checks remain pending
until someone tests them and records evidence.
