# Imported 3D animal models

Place **bunny.glb** in this folder to enable the detailed Bella Bunny model.

The game checks `/models/bunny.glb` at runtime. If it is not present, the
existing procedural bunny is shown, so the game remains playable.

## Install the model

1. Download the **bunny.glb** attached in the ChatGPT conversation. It is
   the user's original `white_mesh.glb` renamed; about 5.7 MB.
2. Copy it into this folder as `public/models/bunny.glb`.
3. Commit and push that binary file, or upload it using GitHub's **Add file →
   Upload files** while browsing `public/models/`.

```cmd
git add public/models/bunny.glb
git commit -m "Add Bella Bunny imported 3D model"
git push origin main
npm run dev
```

When present, the GLB is loaded asynchronously in both **Solo** and
**Two-Friend Race**, normalized to the runner height, displayed in the
character shop, and given temporary bounce motion if it has no built-in
animations.

**Important:** The uploaded `white_mesh.glb` has one mesh and no skins,
animation clips, or embedded material textures. It will not yet have the
cinematic fur/eyes or skeletal running animations seen in reference artwork.
Those need additional texturing and rigging.

The game code does not require downloading models from third-party sites at
runtime; this folder is the only asset location.
