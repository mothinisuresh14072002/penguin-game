<div align="center">

<img src="assets/readme-banner.svg" alt="Pawverse Dash — illustrative animated Arctic banner" width="100%" />

# 🐾 PAWVERSE DASH

### Seven cute heroes. Seven magical worlds. One endless adventure.

**Colourful Three.js 3D endless runner · Solo adventure · Two-player split-screen race**

[![Build](https://github.com/mothinisuresh14072002/penguin-game/actions/workflows/build.yml/badge.svg)](https://github.com/mothinisuresh14072002/penguin-game/actions/workflows/build.yml)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL-222222?logo=threedotjs&logoColor=white)](https://threejs.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646cff?logo=vite&logoColor=white)](https://vite.dev/)
[![Platform](https://img.shields.io/badge/Platform-Web%20%7C%20Android%20prototype-74c69d)](#-android-prototype)

[Play locally](#-quick-start) · [Animal worlds](#-meet-the-seven-heroes) · [Controls](#-controls) · [Two-player race](#-two-player-duo-race) · [Contribute](#-contributing)

</div>

---

## ✨ About the game

**Pawverse Dash** (formerly Polar Dash) is a cheerful 3D runner where each animal explores a world of its own. Run down a three-lane path, avoid obstacles, jump, slide, grab coins and energy, and unlock more friends. The active character controls the **entire world**: the sky, colour palette, painted roadway, scenery, landmarks and obstacle selection.

The game runs in the browser with **Three.js + Vite**. It uses lightweight procedural 3D art, runtime-generated road textures and sky shaders. The same codebase includes a **local two-player race** with independently themed views.

> **Visual fidelity:** The concept illustration is a design target, **not** an actual in-game screenshot. Current models and props are stylized procedural meshes; achieving film-quality fur, perfectly sculpted animals and detailed environments requires additional textured/rigged assets. The header SVG is illustrative artwork, not a live render.

## 🌎 Meet the seven heroes

| Hero | World | Road and main landmarks | Solo unlock |
|:---|:---|:---|---:|
| 🐰 **Bella Bunny** | Bunny Meadow 🌼 | Soft dirt, daisies, fences, leafy trees and a burrow | Free |
| 🦄 **Ula Unicorn** | Unicorn Skyland 🌈 | Glowing pastel bridge, rainbow arch, floating islands and crystals | 150 coins |
| 🐴 **Hugo Horse** | Horse Prairie 🌾 | Golden earth, windmills, hay and rustic fences | 250 coins |
| 🐱 **Coco Cat** | Cat Town 🏘️ | Warm cobblestones, pastel houses and a clock tower | 350 coins |
| 🐶 **Dodo Dog** | Puppy Park 🌳 | Stepping-stone path, pond, flowers and gazebo | 450 coins |
| 🐧 **Pip Penguin** | Penguin Glacier ❄️ | Blue ice road, snow trees, crystals and glacial arch | Free |
| 🐮 **Mimi Cow** | Mimi Farm 🚜 | Countryside trail, crops, red barn, silo and fences | 700 coins |

**Change the character → change the world.** World transitions happen when choosing a hero in the Character Shop. The two-player mode creates each runner's biome separately.

## 🌸 Phase 1: Bella Bunny visual upgrade

Bella Bunny and Bunny Meadow are the first world receiving additional
hand-crafted procedural visual detail based on the supplied seven-world
reference image:

- Bella now has **cream-coloured PBR sheen fur**, visible pink inner-ear
  surfaces from behind, softer cheek tufts, rounded haunches, a full flower
  skirt and a decorative daisy on her dress.
- Bunny Meadow includes **680 tiny flower clusters**, thousands of petals and
  leaves, tufts of grass, and a light pebble path border. The details use
  instanced Three.js meshes in five repeating scenery strips rather than
  separate draw calls for every flower.
- Flowering trees, pastel hedges and a **rabbit-ear burrow** provide a more
  recognizable spring meadow setting.
- The new meadow scenery is attached **only** to Bella's world, moves with
  the runner, and is disposed when the player changes character or restarts
  a two-player race.
- Automated tests cover the instancing budget, bunny detail meshes, scene
  cleanup, real-browser switching between worlds, and solo/duo gameplay.

**Current limitation:** These are polished procedural mesh additions, not a
licensed animated film-quality model. The supplied concept image is still a
target for future textured/rigged assets and art review. Real GPU/FPS
measurements and manual visual approval are also pending.

## 🌈 Phase 2: Ula Unicorn and Rainbow Skyland

The second reference-inspired visual pass gives **Ula Unicorn** a pearlescent
coat, a layered five-colour mane, a gold horn, a fuller rainbow tail, sculpted
feather-like wings, plus **subtle mane sway and wing flutter while running**.

**Rainbow Skyland** has four looping scenery strips containing pastel faceted
crystals, bright stardust, floating cloud-capped islands, and colour-matched
crystal bridge surroundings. These are real Three.js geometry, not background
screenshots. Crystal and stardust meshes are instanced to keep draw calls
bounded on mobile devices.

When the player selects Unicorn, Skyland is created. Changing to any other
character releases the Skyland resources and loads that animal's own biome.
The two-player race allocates Skyland separately to Unicorn's viewport so the
other player continues seeing their chosen world. Unit and real Chromium
tests verify the selected worlds, dynamic scenery, and character animation.

**Art quality:** This remains procedural stylized 3D. Matching the reference
image at film-quality detail needs professionally textured/rigged meshes,
art-directed lighting, and manual visual approval on real devices.

## 🌾 Phase 3: Hugo Horse and Horse Prairie

Hugo Horse now has a softer **chestnut PBR coat**, a cream-coloured rump,
expressive muzzle, darker flowing pony mane, soft hooves, and a tiny
pastel saddlecloth. The mane sways while the animal runs.

**Horse Prairie** now features:

- Five reusable countryside strips with **550 individual wheat stalks**,
  leafy grass, golden seed heads, and cylindrical hay rolls.
- Three **spinning windmills** with real moving 3D blade groups.
- A cottage, rustic fences, green trees and golden grassland colours.
- A looping pathside wheatfield that leaves all gameplay lanes clear.
- Real-time character-specific creation/disposal in solo and multiplayer,
  so only the Horse player gets this extra scenery.

The wheatfield uses **instanced meshes** to limit draw calls. Unit tests
cover animation, strip recycling, windmill rotation, cleanup and the
number of instanced objects. Browser tests verify Horse-vs-Dog race
scenery stays independent. As in phases 1 and 2, this remains
hand-crafted procedural 3D rather than a cinematic textured animal
model; physical-device performance and visual review are still needed.

## 🏘️ Phase 4: Coco Cat and Cat Town

**Coco Cat** now has a soft orange-tabby PBR coat, big green irises,
rounded cheeks, a lavender scarf, stronger stripes on the back, and an
upright striped tail that sways while running. These details are designed
for the small rear-view runner silhouette as well as shop previews.

**Cat Town** features:

- Four looping street sections with **32 colourful pastel building façades**
  in total, pitched roofs, individual doors, windows and white trim.
- Flower-filled window boxes and warm lantern streetlamps, all made from
  actual Three.js geometry.
- A central village clock tower with gently moving clock hands.
- Existing cobblestone track and the seven-world sky/background system.
- GPU instancing to keep town detail bounded at approximately
  **40 instanced draw calls**, instead of hundreds of separate meshes.

Selecting Coco Cat creates the moving town; switching to another
character disposes of the town meshes. Split-screen mode maintains each
player's own environment. Unit tests cover cat details, animated tail,
street recycling, clock rotation, and cleanup. The real browser suite
also tests Cat Town against Bunny Meadow in a local two-player race.

**Not yet a cinematic 3D asset pack:** The project's reference picture
remains the visual goal. This phase improves the procedural art but does
not add textured, fully rigged, film-quality cat models. Gameplay tests
cannot establish an exact visual match or real-device FPS.

## 🌳 Phase 5: Dodo Dog and Puppy Park

**Dodo Dog** now has a softer honey-coloured PBR coat, cream chest
and haunch fluff, a red collar with a golden tag, and expressive
**hinged floppy ears and wagging tail**. The flopping ears, swinging tail
and tiny heart patch remain visible when running away from the camera.

**Puppy Park** now contains:

- Four looping garden strips with **416 flower clusters**, colourful
  petals, grass foliage, rounded hedges and light stepping-stone borders.
- A layered blue pond with lily pads, flowers and shoreline pebbles.
- Wooden benches, blossom trees, warm park colours and a shaded gazebo.
- A gazebo safely **beside** the running track, rather than in the
  centre lane where it could visually obscure obstacles.
- Lightweight GPU-instanced plant geometry and appropriate cleanup
  whenever the animal changes or a multiplayer race ends.

The automated suite checks the running animation, garden recycling,
model materials, gazebo placement, and Dog-versus-Cat split-screen
world independence. The reference illustration is still an art-direction
target; this does not yet replace Dodo with a professionally textured,
skeletally rigged cinematic dog asset.

## 🎮 Gameplay and features

| Feature | How it works |
|:---|:---|
| **Solo endless run** | Accelerate from 18 up to 58 world units/second, with increasingly challenging obstacle rows |
| **Movement** | Three lanes, jumping, sliding and smooth lane transitions |
| **Obstacles** | World-specific rocks, spikes, raised log gates, and an Arctic lion |
| **Collision reliability** | Swept collision detection checks the full travelled distance, side movement and jump height **between frames**, preventing common high-speed tunnelling |
| **Log gates** | Slide underneath the raised wooden beam; jumping and dodging remain options according to clearance |
| **Energy and rewards** | Collect coins; energy pickups replenish stamina |
| **Solo power-ups** | Shield blocks a hit; magnet helps collect coins |
| **Shop** | Spend earned coins to unlock heroes; selected hero and world are remembered |
| **Visuals** | Animated animal limbs, custom third-person cameras, parallax nature, bright sky shaders, clouds, seven textured track styles and distinct 3D landmarks |
| **Progress** | Best distance, coin balance and unlocks saved in browser local storage |
| **Sound** | Optional synthesized effects with an on/off toggle |

### 🛡️ Collision fix

Obstacles are no longer checked solely at the character's end-of-frame position. Both modes now use `src/collisionMath.js` to find overlapping **time intervals** along the runner's forward path, lane transition and jump.

- Fast animals cannot skip a rock or spike between two frames.
- Moving across lanes checks the path taken, not just the lane where the animal ends the frame.
- High jumps can clear obstacles only when the character is above the obstacle at the time of crossing.
- Sliding can clear overhead wooden log gates, not rocks and spikes.
- After a shielded hit or during brief post-impact immunity, a contacted obstacle disappears rather than visibly passing through the animal.

Automated tests cover these cases in `tests/collisionMath.test.js`. Runtime appearance and game feel still need manual desktop/mobile playtesting.

## 🏁 Two-player Duo Race

Two friends race on **one screen**. Desktop uses side-by-side views; portrait mobile stacks the views. Each player chooses from all seven animals and has their own camera, themed scenery, distance, energy, coins, and obstacle-contact feedback. The obstacle-lane pattern is deterministic for fairness.

**Objective:** Be the first to reach **1,000 metres**. Obstacles slow and drain energy; energy pickups help recovery. The mode is local multiplayer, **not** online networking.

| Action | Player 1 | Player 2 |
|:---|:---|:---|
| Left / right | `A` / `D` | `J` / `L` |
| Jump | `W` or Space | `I` |
| Slide | `S` | `K` |
| Mobile | Swipe inside first viewport | Swipe inside second viewport |
| Pause | `P`, Escape or on-screen button | Shared pause |

Race entry point: **http://localhost:5173/race.html** when the dev server is running.

## 🚀 Quick start

**Requirements:** Node.js, npm, a modern browser with WebGL. Use **Windows CMD**, VS Code terminal or Antigravity terminal.

### First installation

~~~cmd
git clone https://github.com/mothinisuresh14072002/penguin-game.git
cd penguin-game
npm install
npm run dev
~~~

Open **http://localhost:5173/** or the Vite address displayed in your terminal.

### Already cloned? Update your game

Run inside your local `penguin-game` folder:

~~~cmd
git pull origin main
npm install
npm run dev
~~~

### 🕹️ Controls

| Action | Keyboard | Mobile |
|:---|:---|:---|
| Move lanes | `A` / `D` or `←` / `→` | Swipe left/right |
| Jump | `W`, `↑` or Space | Swipe up/tap |
| Slide | `S` or `↓` | Swipe down |
| Pause | `P` or pause button | Pause button |
| Sound | Sound button | Sound button |

### Build and test

~~~cmd
npm run build
npm run preview
~~~

Run the complete unit test suite:

~~~cmd
node --test tests/*.test.js
~~~

`dist/` contains both solo and race HTML entry points. GitHub Actions runs syntax checks, unit tests and a Vite production build after pushes to `main` and on pull requests.

## 🗂️ Project structure

~~~text
penguin-game/
├── index.html                    Solo runner entry point
├── race.html                     Two-player race
├── src/
│   ├── main.js                   Solo gameplay, world selection, rendering
│   ├── race.js                   Split-screen multiplayer logic
│   ├── collisionMath.js          Swept hazard contact detection
│   ├── raceMath.js               Race physics and fair obstacle generation
│   ├── animalArt.js              Seven procedural animated chibi animals
│   ├── meadowArt.js              Instanced flowers and gravel for Bella Bunny
│   ├── skylandArt.js             Floating islands and instanced Unicorn crystals
│   ├── prairieArt.js             Instanced golden wheat, hay and countryside
│   ├── townArt.js                Instanced pastel Cat Town buildings and lanterns
│   ├── parkArt.js                Instanced Puppy Park flowers, bushes and stone path
│   ├── modelAssets.js            Optional GLB character loading and fallback
│   ├── characterPreviews.js      3D portraits in the character shop
│   ├── roadArt.js                Seven repeated illustrated road textures
│   ├── landmarkArt.js            Biome-specific 3D landmark collections
│   ├── worldArt.js               Reusable roadside scenery geometry
│   ├── visual3d.js               Sky dome and distant horizon
│   ├── style.css                 Solo game interface
│   └── race.css                  Split-screen interface
├── tests/                        Collision, race, worlds and art tests
├── public/models/               Optional downloaded GLB assets
├── assets/readme-banner.svg      Illustrative animated README header
├── capacitor.config.json         Android wrapper configuration
├── docs/PLAY_STORE_RELEASE.md    Android release checklist
├── PRIVACY.md                    Prototype privacy notes
└── .github/workflows/build.yml   CI workflow
~~~

## 🐰 Bringing in a custom bunny GLB

The optional `public/models/bunny.glb` file can override Bella Bunny **only if it has usable painted materials or texture information**. Unpainted white Meshy exports are deliberately skipped: the colourful procedural bunny remains visible instead.

To add your own properly textured model, put `bunny.glb` in `public/models/`, then run:

~~~cmd
git add public/models/bunny.glb
git commit -m "Add textured Bella Bunny model"
git push origin main
~~~

The imported GLB is fitted to the game height and uses included animation clips when present; unrigged models only receive a basic bob animation. **This model binary is not currently committed to the repository.** See [GLB installation notes](public/models/README.md).

## 📱 Android prototype

The project includes **Capacitor** support for packaging the web game in Android Studio.

~~~cmd
npm install
npm run build
npm run android:add
npm run android:sync
npm run android:open
~~~

Run `npm run android:add` only if no Android project already exists. For subsequent changes, just use `npm run android:sync`.

**Release status:** The game has **not** been signed, confirmed on physical Android devices, submitted or published to Google Play. See [release checklist](docs/PLAY_STORE_RELEASE.md) and [privacy policy](PRIVACY.md).

## 🛣️ Roadmap

- [x] Bella Bunny Phase 1: plush rear-view details and flowing flower meadow
- [x] Ula Unicorn Phase 2: animated mane, pearlescent coat and sparkling Rainbow Skyland
- [x] Hugo Horse Phase 3: chestnut baby pony, golden wheatfields and animated windmills
- [x] Coco Cat Phase 4: green-eyed tabby, moving tail, pastel village and clock tower
- [x] Dodo Dog Phase 5: floppy-ear puppy, garden scenery, lily pond and off-road gazebo
- [x] Seven selectable characters with matching 3D environments
- [x] Distinct road textures, landscape colours, props and landmarks
- [x] Solo gameplay with coins, energy, shields and magnets
- [x] Local, fair, same-screen two-player race
- [x] Reliable high-speed swept collision logic and automated regression tests
- [x] Custom sky shader, animated weather and world scenery
- [x] CI checks for JavaScript, world art, race physics and builds
- [ ] Browser-based gameplay automation and physical-device collision testing
- [ ] Fully textured and rigged cinematic-quality character assets
- [ ] Mobile FPS tuning, accessibility review and quality presets
- [ ] Original real gameplay screenshots, trailer and complete onboarding
- [ ] Signed and tested Android release

## 🤝 Contributing and feedback

Bug reports and contributions are welcome through [GitHub Issues](https://github.com/mothinisuresh14072002/penguin-game/issues). Please include the affected character/world, mode (solo/race), browser or device, and reproduction steps.

**Created and maintained by [Mothini S.](https://github.com/mothinisuresh14072002).**

<div align="center">

**🐾 PAWVERSE DASH — every animal has a world.**

Built with Three.js · Vite · JavaScript · Capacitor

</div>
