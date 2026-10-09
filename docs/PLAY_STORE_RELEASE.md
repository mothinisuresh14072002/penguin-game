# Google Play release checklist

Polar Dash currently builds as a web app and includes a Capacitor Android wrapper configuration. **An Android App Bundle has not yet been produced, signed, tested, uploaded, or approved.**

## Windows CMD

Install Node.js, Android Studio, Android SDK and required JDK.

```cmd
git clone https://github.com/mothinisuresh14072002/penguin-game.git
cd penguin-game
npm install
npm run build
npm run android:add
npm run android:sync
npm run android:open
```

If an `android` directory already exists, **do not** run `npm run android:add` again. Use `npm run android:sync`.

In Android Studio select a physical Android test device and Run. When ready, use **Build → Generate Signed Bundle / APK → Android App Bundle**. Keep signing credentials private and backed up securely.

## Before uploading to Play Console

1. Replace placeholder art with owned, original app icon, feature graphic, screenshots, and animation assets.
2. Test on low-, middle-, and high-end Android phones in portrait and landscape; confirm framerate and thermal/battery behavior.
3. Verify touch/swipe gestures, pause/resume, restart, screen rotations, loss of connectivity, app closing, and data persistence.
4. Check gameplay fairness: guaranteed avoidable hazard paths; safe pickups; no impossible jumps.
5. Complete accessibility, tutorial/onboarding, original sound, effects, content rating and localized descriptions.
6. Use the currently required Android target SDK and meet the applicable Play Console testing and verification requirements.
7. Publish a public privacy policy and complete Data safety disclosures based on the **final app**.
8. Configure signing, version codes, screenshots, production package ID, testing tracks and staged rollout.
9. Ensure age-directed design decisions and monetization meet Google Play policies before launching ads or purchases.

## License and assets

Three.js and other libraries are third-party dependencies with their respective licenses. Confirm usage rights to all artwork, music and 3D assets before release. Avoid copying Subway Surfers artwork, names, music, characters, maps or other protected creative elements.
