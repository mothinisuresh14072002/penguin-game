<div align="center">

<img src="assets/readme-banner.svg" alt="Pawverse Dash — illustrative animated Arctic banner" width="100%" />

# 🐾 PAWVERSE DASH

### Seven cute heroes. Seven magical worlds. One endless adventure.

**Colourful Three.js 3D endless runner · Solo adventure · Two-player split-screen race**

[![Build](https://github.com/mothinisuresh14072002/penguin-game/actions/workflows/build.yml/badge.svg)](https://github.com/mothinisuresh14072002/penguin-game/actions/workflows/build.yml)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL-222222?logo=threedotjs&logoColor=white)](https://threejs.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646cff?logo=vite&logoColor=white)](https://vite.dev/)
[![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20Windows%20%7C%20Linux-74c69d)](#️-play-on-windows-linux-and-android)

[Cross-platform setup](docs/PLATFORM_SUPPORT.md) · [Play locally](#-quick-start) · [Animal worlds](#-meet-the-seven-heroes) · [Controls](#-controls) · [Two-player race](#-two-player-duo-race) · [Contribute](#-contributing)

</div>

---

## ✨ About the game

**Pawverse Dash** (formerly Polar Dash) is a cheerful 3D runner where each animal explores a world of its own. Run down a three-lane path, avoid obstacles, jump, slide, grab coins and energy, and unlock more friends. The active character controls the **entire world**: the sky, colour palette, painted roadway, scenery, landmarks and obstacle selection.

The game runs in the browser with **Three.js + Vite**. It uses lightweight procedural 3D art, runtime-generated road textures and sky shaders. The same codebase includes a **local two-player race** with independently themed views.

> **Visual fidelity:** The concept illustration is a design target, **not** an actual in-game screenshot. Current models and props are stylized procedural meshes; achieving film-quality fur, perfectly sculpted animals and detailed environments requires additional textured/rigged assets. The header SVG is illustrative artwork, not a live render.

## 🖥️📱 Play on Windows, Linux and Android

Pawverse Dash uses **one Three.js/Vite web codebase** for all three platforms. Windows and Linux players use a WebGL-capable desktop browser; Android players use a mobile browser (touch/swipe controls) or a **Capacitor Android build**. The web app includes a home-screen manifest and icon. **There is no Windows .exe or Linux native binary yet**, and Android APK compatibility still requires Android Studio and real-device verification.

### Quick start — Windows CMD

Install Node.js **22+**. Open **CMD** in the cloned repository:

```cmd
git clone https://github.com/mothinisuresh14072002/penguin-game.git
cd penguin-game
npm install
npm run dev
```

Open the local URL displayed by Vite (typically `http://localhost:5173`).

### Quick start — Linux terminal

Install Node.js **22+**, then:

```bash
git clone https://github.com/mothinisuresh14072002/penguin-game.git
cd penguin-game
npm install
npm run dev
```

To prepare production web files on either OS:

```bash
npm run build
npm run preview
```

Deploy the contents of `dist/` to an **HTTPS web host** for access on Android phones and desktop browsers. The development computer's `localhost` address is not reachable from a separate phone.

### Android app (Capacitor)

On a Windows or Linux development PC, install Node.js 22+, Android Studio, Android SDK and the JDK required by your installed Android toolchain (the current setup targets Java 17). Run in the project directory:

```bash
npm install
npm run android:add
npm run android:sync
npm run android:open
```

Run `android:add` **only once** when there is no `android/` project; subsequent updates need `npm run android:sync`. Android Studio handles emulator/device runs and signed APK/AAB output. **CI does not currently compile or sign an APK.**

Full instructions and compatibility limitations: **[Platform support guide](docs/PLATFORM_SUPPORT.md)** · [Play Store release checklist](docs/PLAY_STORE_RELEASE.md).

### 🎮 Controls on all devices

| Mode | Keyboard (Windows / Linux) | Android / touch |
|---|---|---|
| Solo | ←/→ or A/D: lanes; ↑/W/Space: jump; ↓/S: slide | Swipe left/right: lanes; up: jump; down: slide; tap: jump |
| Two-player race | Player 1: WASD; Player 2: IJKL or arrow keys | Swipe within your own half of the screen |
| Pause | P or Escape, or pause button | Tap pause button |

In solo mode, the **🧪 Character Test** panel temporarily switches between all seven animals while evaluating artwork, even when characters are locked. It does **not** purchase or permanently unlock them.

### 🐣 Baby-animal artwork

All seven playable characters are designed as children: **Bella the baby bunny, Ula the baby unicorn, Hugo the foal, Coco the kitten, Dodo the puppy, Pip the penguin chick, and Mimi the calf**. Their latest procedural 3D models use enlarged round heads, shorter limbs and species-specific silhouettes. Coco wears a **red scarf** and Mimi wears a **red head bow**. Pip's rounded silhouette has **no scarf or crown tuft**. The 3D art is still stylized and must be visually reviewed against the reference pictures in actual gameplay.

### ✅ Tests and release status

GitHub Actions checks JavaScript syntax, unit tests, Vite production assets and solo/two-player **Chromium** browser gameplay on Linux. Track the [latest CI results](https://github.com/mothinisuresh14072002/penguin-game/actions/workflows/build.yml). Passing CI does not prove real Android devices, every Windows/Linux GPU, or signed APK packaging work. Physical-device testing, visual approval and Android release signing remain outstanding.

---

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

## ❄️ Phase 6: Pip Penguin and Penguin Glacier

**Pip Penguin** now has a softer charcoal PBR coat, a rounded white
face mask, rosy cheeks, orange feet, little animated flippers, a
light-blue winter scarf and a stitched snowflake badge. The scarf and
back markings were placed for the actual small rear-view runner camera.

**Penguin Glacier** now includes:

- Four looping icy scenic strips containing **168 tall faceted crystal
  spires**, blue ice pebbles, smaller shards and powdery snowbanks.
- **210 falling snowflakes** in their own particle system, including
  the independently rendered Penguin viewport in two-player races.
- A crystalline portal above the running path, snow-covered ice pines,
  soft snowdrifts and an igloo placed *off* the playable track.
- Blue shimmering ice road, glacier mountains, and the existing
  snowy sky colours matched to the selected Penguin biome.
- Instanced Three.js ice meshes for reasonable GPU draw calls, without
  loading external assets, textures or models.

Snowfall and crystal strips are created only for Penguin, and disposed
when selecting another animal. The game uses its older atmospheric
particle field exclusively for Unicorn Skyland to avoid doubling snow
in Penguin Glacier. Unit tests check ice-strip recycling, snowfall
movement, animated flippers, scene cleanup and the over-road portal.
Real Chromium tests verify Penguin-versus-Dog world separation.

**Quality note:** The new details are real but procedural Three.js art.
A pixel-exact recreation of the cinematic reference still requires
professional textured, rigged 3D assets and device-specific visual testing.

## 🚜 Phase 7: Mimi Cow and Mimi Farm

**Mimi Cow** completes the first reference-inspired visual pass across all
seven heroes. Her soft white PBR coat has asymmetric charcoal patches,
rounded baby-calf haunches, pink inner ears, little ivory horns and a
pastel-pink bow visible from the rear gameplay camera. Her tail swishes
and her ears respond subtly to running; the front-facing character-shop
model has a broader, blushing muzzle.

**Mimi Farm** now features:

- Four endlessly scrolling countryside scenery strips with **232 corn
  stalks** and **120 sunflower plants**, including 960 yellow petals and 464 corn-leaf details,
  instanced into 36 scenery draw calls.
- Two-sided rustic fences, stacked hay rolls, corn cobs and golden flowers
  kept safely outside the three running lanes.
- A brighter red barn with white timber details, a silo, a small rotating
  farm windmill, leafy trees and roadside flower beds.
- Independent farm scenery in the local two-player race, so Cow can run
  beside a different animal without sharing or changing their world.

Automated unit tests verify Mimi's visible patches, bow and tail animation,
crop-field draw-call budget, looping scenery, and windmill rotation.
Real Chromium gameplay tests exercise all seven world switches plus a
**Cow versus Penguin** split-screen race.

**Visual status — 7/7 upgraded:** Every animal now has dedicated rear-view
details and custom biome scenery. These remain procedural Three.js models,
not professionally authored textured and rigged models. The game is still
not visually identical to the cinematic concept art; real-phone FPS tests
and manual art-direction acceptance remain outstanding.

## 🥕 Animal Food, Market and Daily Adventures

Pawverse Dash now has a **collect → store → sell → earn** loop for the
solo adventure. During the run, grab your animal's favourite 3D treats,
avoid obstacles and keep the food you find even if the run ends.

| Runner | Treat | Sell value |
|---|---|---:|
| Bella Bunny | 🥕 Carrot | 3 coins |
| Ula Unicorn | 🌈 Rainbow Fruit | 5 coins |
| Hugo Horse | 🍎 Apple | 4 coins |
| Coco Cat | 🐟 Fish | 4 coins |
| Dodo Dog | 🦴 Bone | 3 coins |
| Pip Penguin | 🐟 Silver Fish | 4 coins |
| Mimi Cow | 🌽 Corn | 3 coins |

In the **Characters & Shop** screen, switch between **Characters**,
**Sell Food**, **Mystery Boxes** and **Targets**:

- **Sell Food:** View your stored food and sell one or all units for the
  listed virtual coin price. The item count and coin balance are saved.
- **Mystery Boxes:** Claim **one free box each UTC day**, or use **55
  in-game coins** for an additional box. Gifts contain bounded amounts of
  virtual coins or treats. Rare boxes also appear along the solo running
  trail; these do not use up your free daily claim. No real-money purchases,
  advertisements, paid random rewards or cash withdrawals are involved.
- **Daily targets:** Collect 8 treats (45 coins), jump 6 times (30 coins),
  complete 1 solo run of at least 20 m (50 coins).
- **Weekly targets:** Collect 60 treats (220 coins), sell 30 items
  (170 coins), or complete 10 qualifying solo runs (250 coins).
  Rewards need to be **claimed**, and each mission is claimable once per
  period. Daily goals reset at **00:00 UTC**, and weekly goals reset
  **Monday 00:00 UTC**.
- **Player progress:** Food, daily/weekly progress, claimed rewards,
  the free-box cooldown, coins, characters and best run are stored in the
  **same browser localStorage save**, with older saves migrated
  automatically.

### 🌍 Travelling through the world

The runner remains near the camera, but the environment has **depth
layers**, equivalent to the animal moving through a stationary world:

- Road and near scenery stream at the runner's forward speed.
- Butterflies and middle-distance scenery move more slowly.
- Distant clouds have subtle movement, while the 3D mountain horizon
  and sky do not scroll with the track.
- Ground and flower/crystal/town/park/glacier/farm scenery reuse seamless
  chunks so the road doesn't pop out of existence when the run progresses.
- Four lightweight, character-specific **3D landmark sections** approach and
  pass at the same physical distance rate as the path: orchards, village buildings, ice formations,
  flower gardens or fantasy crystals depending on the biome. These recycle
  ahead of the animal without moving the distant sky or mountains.
- Each biome has three themed **journey chapter labels** that rotate
  as the player passes 240-metre landmarks (for example, Daisy Fields,
  Carrot Grove and Blossom Hills).

This is **camera-relative forward streaming**, not a finite open-world map.
It gives the sense of reaching new scenery without requiring the player
to physically leave the fixed 3-lane camera frame. The chapter names are
lightweight milestones, not seven new downloadable maps.

**Scope:** Virtual-food progression currently belongs to solo running;
local two-player races still prioritize fair competition and independent
world scenery. The shop remains available from the main game menu.

## 🎨 HD visual foundation (October 2026)

- New `src/graphicsQuality.js`: adaptive desktop HD / mobile balanced
  raster resolution and soft-shadow settings. Forced `?quality=hd`
  is available for visual comparisons.
- New `src/hdSurface.js`: repeatable procedural bump maps shared across
  painted foliage and wood/earth materials.
- Sharper 1024×1024 canvas-painted biome road textures with subtle relief,
  while preserving the original seven track styles.
- Cumulus layering in the stationary sky shader, without making the
  sky scroll at the road speed.
- All seven names are enabled in `src/modelAssets.js` and the shop
  preview renderer; binary 3D model authoring is still pending.
- Automated tests cover graphics tier selection, material classification,
  sky setup and asset mapping; real phone performance and visual art review
  are still required.

## 🧸 Unified soft-chibi character pass (October 2026)

The seven **playable Three.js animals** now use a consistent soft, simple
face design rather than dozens of raised eye and muzzle balls:

- **Painted 512px face textures** in `src/cuteFace.js` place the same
  oval eyes, shiny catchlights, soft blush and small smile directly on
  the 3D head. Each animal keeps appropriate coat colouring, and the cat
  retains mint-green irises.
- **Painted 512px coat textures** in `src/cuteCoat.js` blend Bunny's
  creamy fur, Cow's charcoal spots, Cat's tabby stripes, Horse's cream
  rump, Dog's cream patches and Penguin's feather shading into the
  body itself. Black spots and stripes no longer stick out as ellipsoids.
- Rounded, sculpted ears, a distinguishable curved cat tail, clear feet,
  a small bunny cotton tail, and smaller collars/bows remain 3D where
  their silhouettes matter.
- Bunny, Unicorn, Horse, Cat, Dog, Penguin and Cow still share working
  animated body groups and their own recognizable run/hop/waddle styles.

The body and head are still separate lightweight procedural meshes, so
this reduces visible seams rather than guaranteeing a seamless
professionally sculpted animal. Replacing them with textured, rigged
GLBs remains the path to the exact cinematic-reference level. Browser
QA checks that all seven animal faces and coats are actually painted
in WebGL rather than only having data or mock artwork.

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
│   ├── gameEconomy.js            Food, inventory, selling, missions and boxes
│   ├── foodArt.js                Animal-themed 3D collectible objects
│   ├── worldMotion.js            Seamless ground streams and parallax layers
│   ├── journeyArt.js             Recycling biome-themed mid-distance landmarks
│   ├── race.js                   Split-screen multiplayer logic
│   ├── collisionMath.js          Swept hazard contact detection
│   ├── raceMath.js               Race physics and fair obstacle generation
│   ├── animalArt.js              Seven procedural animated chibi animals
│   ├── meadowArt.js              Instanced flowers and gravel for Bella Bunny
│   ├── skylandArt.js             Floating islands and instanced Unicorn crystals
│   ├── prairieArt.js             Instanced golden wheat, hay and countryside
│   ├── townArt.js                Instanced pastel Cat Town buildings and lanterns
│   ├── parkArt.js                Instanced Puppy Park flowers, bushes and stone path
│   ├── glacierArt.js             Instanced ice spires, snow drifts and particles
│   ├── farmArt.js                Instanced sunflower rows, corn stalks and fences
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

## ✨ HD rendering and all seven 3D animal models

The game now offers a higher-resolution **desktop HD rendering mode** with
up to 2× device pixel ratio, 2048px soft shadows, more detailed 1024px
road textures, subtle material bump relief on foliage/wood, and soft
procedural cumulus in the 3D sky. Mobile and two-player mode automatically
use lighter render settings to protect frame rate. On the game URL, use
`?quality=hd` to request HD or `?quality=balanced` for a lighter mode.

**These renderer changes do not magically turn simple procedural meshes
into the professionally textured animals in the user's reference art.**

Every hero can now be replaced with an *authored, painted* `.glb` file
by putting the correctly named model in `public/models/`:
`bunny.glb`, `unicorn.glb`, `horse.glb`, `cat.glb`,
`dog.glb`, `penguin.glb`, and `cow.glb`. The game loads these
optional files in solo play and the two-player race and previews them
in the character shop. Missing, invalid, or plain uncoloured meshes
retain the current playable procedural fallback.

**Recommended production asset workflow:** Sculpt and rig each chibi animal
in Blender (or acquire legitimately licensed models), author 1K–2K PBR
colour/normal/roughness textures, check the rear-view running silhouette,
export as GLB with embedded animation, place the file in `public/models/`,
and commit/push it. Use the same asset approach for more intricate biome
props in future. See the [seven-model installation guide](public/models/README.md)
for filenames and requirements.

**Current status:** No seven finished, professionally textured and rigged
animal GLB binaries were added by this graphics pass, and pixel-level
fidelity to the promotional reference has not yet been demonstrated.

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
- [x] Pip Penguin Phase 6: rounded penguin chick, short flippers, falling snow and crystalline glacier portal
- [x] Mimi Cow Phase 7: red head bow, calf proportions, animated tail and living sunflower farm
- [x] Seven selectable characters with matching 3D environments
- [x] Distinct road textures, landscape colours, props and landmarks
- [x] Solo gameplay with coins, energy, shields and magnets
- [x] Animal-specific food pickups, inventory and food-to-coin selling
- [x] Daily/weekly missions and claimable surprise gift boxes
- [x] Runner-speed ground chunks and separate near/far environmental motion
- [x] Local, fair, same-screen two-player race
- [x] Reliable high-speed swept collision logic and automated regression tests
- [x] Custom sky shader, animated weather and world scenery
- [x] CI checks for JavaScript, world art, race physics and builds
- [x] Browser-based solo and two-player gameplay automation on Linux Chromium
- [ ] Physical-device collision, input and performance testing on Android, Windows and Linux
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
