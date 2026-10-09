# Penguin Ice Adventure ❄️

A playable 3D platformer prototype inspired by the uploaded penguin photo. Built with **Three.js** and Vite using procedural 3D geometry (no downloaded 3D models or paid APIs).

## Windows setup (CMD)

1. Extract the ZIP.
2. Open CMD inside the extracted `penguin-ice-adventure` folder.
3. Run:

```cmd
npm install
npm run dev
```

4. Open the local URL printed by Vite, normally **http://localhost:5173**.

## Play

- **A / D** or **left / right arrows**: move.
- **Space** or **up arrow**: jump.
- **R**: restart.
- **Mobile**: on-screen left, right, jump buttons.

Jump over ice rocks, sharp ice crystals and gaps, avoid the patrolling lion, collect coins and reach the flag. Three lives, automatic progress checkpoints, win/game-over screen.

## Quality and performance

- Real-time shadows and tone mapping with cinematic lighting
- Ice and snowy cliffs, generated mountains, snowfall, trees and coins
- Procedural penguin character animated while walking and jumping
- Smooth-follow side-angle camera

**Important:** The promotional concept art is a visual design target, not an in-game screenshot. The playable world is currently a procedural, stylized prototype, not a photorealistic AAA model. Higher-end realistic feathers, mesh sculpting and detailed scenery would require more art and iteration.

## Production build

```cmd
npm run build
npm run preview
```

The deployable build is in `dist/`.
