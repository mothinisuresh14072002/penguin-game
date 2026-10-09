# Polar Dash ❄️ — 3D Arctic Endless Runner

**Polar Dash** is an original, mobile-oriented Three.js endless runner. Run along three lanes across a snowy arctic world, dodge rocks, ice spikes, wooden barriers and lions, collect gold, refill energy, activate power-ups and unlock playable animal characters. Inspired by the endless-runner genre; it is not affiliated with Subway Surfers.

## Current features

- Original endless runner with progressively increasing speed and procedural obstacle rows
- Five playable unlockable characters: Pip the Penguin, Frost the Fox, Splash the Seal, Boris the Bear, Royal Penguin
- Three-lane switching, jump and slide; touch swipes and keyboard controls
- Energy meter that drains with play and recharges from green pickups
- Collectible coins and a persistent offline character shop
- Shield pickup (absorbs one crash) and temporary coin magnet
- Best distance and wallet saved via browser localStorage
- Procedural 3D geometry, icy track, snow, mountains and lighting
- Responsive interface and mobile-friendly presentation
- Capacitor configuration for packaging the web game as an Android app

## Windows CMD: run locally

```cmd
git clone https://github.com/mothinisuresh14072002/penguin-game.git
cd penguin-game
npm install
npm run dev
```

Open **http://localhost:5173/**.

## Controls

| Action | Windows | Mobile |
| --- | --- | --- |
| Switch lane | A / D or Left / Right | Swipe left / right |
| Jump | W / Space / Up | Swipe up or tap |
| Slide | S / Down | Swipe down |
| Pause | P | Pause button |

## Build the website

```cmd
npm run build
npm run preview
```

## Android prototype with Capacitor

Install Android Studio, Android SDK and a compatible JDK first.

```cmd
npm install
npm run build
npm run android:add
npm run android:sync
npm run android:open
```

The last command opens the native Android project in Android Studio. Run on an Android device, then use **Build > Generate Signed Bundle / APK** to produce a signed Android App Bundle (.aab) for Play Console.

On later web-game updates, run `npm run android:sync` to update the Android project.

**Do not commit your private signing keys.**

## What remains before Google Play publication

This is a **prototype, not yet a Play Store-approved product**. Before release:

1. Test on several real Android devices and profile performance, memory, frame pacing and touch input.
2. Generate a unique production application ID, 512×512 icon, feature graphics, screenshots and accessible store description.
3. Add suitable audio, settings, privacy policy, content rating and Play Console Data safety disclosures based on actual data processing.
4. Add Android app lifecycle handling (pause/resume, audio focus), robust save migrations, accessibility, and appropriate analytics only if desired.
5. Review age/child-directed content rules and advertising/monetization policies before integrating ads or purchases.
6. Use the currently required Android target SDK, sign an .aab and complete Play Console internal/closed testing and any account-specific testing requirements.
7. Run a full QA pass and publish only after there are no blocking gameplay or compliance issues.

## Honest quality note

This is a stylized procedural MVP with primitive-based 3D animal models, **not** the same fidelity as a commercial AAA endless runner. For store-level production polish, create original high-quality models, optimized textures, skeletal character animation, sound, VFX, biome art and onboarding.

## Architecture

- `src/main.js`: procedural world, characters, game physics, spawning, shop, energy and power-ups
- `src/style.css`: HUD, overlays, responsive shop and styling
- `index.html`: game UI
- `capacitor.config.json`: Android wrapper metadata
