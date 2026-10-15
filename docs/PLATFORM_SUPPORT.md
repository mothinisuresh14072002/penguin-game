# Pawverse Dash — Android, Windows and Linux

Pawverse Dash is a WebGL / Three.js game. The same Vite web build runs in current Chromium-based browsers on **Windows**, **Linux**, and **Android**. Android can also be packaged as a native app using the existing Capacitor 7 configuration. No Windows or Linux native executable is produced; desktop users play in the browser.

## Windows (CMD)

Install Node.js 22 or newer, then in the repository folder:

```cmd
npm install
npm run dev
```

Open the URL printed by Vite (typically http://localhost:5173). Arrow keys / WASD control the solo runner. To create production files run `npm run build`, then `npm run preview`.

## Linux (terminal)

Install Node.js 22 or newer, then:

```bash
npm install
npm run dev
```

Open the printed URL in Chrome / Chromium / Firefox with WebGL support. For production web hosting: `npm run build`; serve the generated `dist/` directory over HTTPS.

## Android (browser)

Host the production `dist/` folder on an HTTPS website; open the URL in a current Android Chrome browser. Use touch/swipe controls. The site includes a web app manifest for Add to Home screen where supported. A local Windows `localhost` URL does **not** work directly on a different Android phone; the phone needs a reachable server address / deployed HTTPS URL.

## Android APK / Android Studio (Windows or Linux development PC)

Install Node.js 22+, Android Studio with Android SDK and Java 17 (required by the Android tooling), then in the repository folder:

```bash
npm install
npm run build
npm run android:add
npm run android:sync
npm run android:open
```

Only run `npm run android:add` once: subsequent builds need just `npm run android:sync`. In Android Studio, choose a configured emulator or a USB-connected device to run; use Generate Signed Bundle / APK for a distribution build. Packaging requires Android Studio/SDK and is **not** validated by the web-only CI job.

## Controls

- Solo desktop: left/right arrows or A/D to change lanes, up arrow/W/space to jump, down arrow/S to slide.
- Solo mobile: swipe left/right to change lanes, swipe up to jump, swipe down to slide, tap to jump.
- Local two-player desktop: Player 1 uses WASD; Player 2 uses IJKL or arrows.
- Two-player mobile: touch or swipe in each player's half of the screen.

## Compatibility and limitations

A device must provide a working GPU/WebGL implementation. Frame rate and visual quality vary greatly between phones, desktops, drivers and browsers. The game lowers its rendering resolution under load, but performance is not guaranteed on every device. Browser storage holds local progress and can be cleared by the user/browser. Backgrounding the app pauses play. Real-device Android QA, various Linux GPU drivers and Windows hardware still require manual checks before claiming universal support.

## Automated checks

The GitHub Actions workflow runs on Linux and checks JS syntax, unit tests, Vite production build and Chromium solo/duo gameplay. That checks web functionality, not Android APK builds or every physical GPU/OS combination.
