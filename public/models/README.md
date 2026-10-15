# High-detail character models (optional)

Pawverse Dash can use **one textured and animated GLB model per animal**.
Drop your legitimately owned or openly licensed models in this folder:

| Animal | Required filename | Biome | Status |
| --- | --- | --- | --- |
| Bella Bunny | `bunny.glb` | Bunny Meadow | ✅ Included (`public/models/bunny.glb`) |
| Ula Unicorn | `unicorn.glb` | Unicorn Skyland | Procedural fallback (GLB optional) |
| Hugo Horse | `horse.glb` | Horse Prairie | Procedural fallback (GLB optional) |
| Coco Cat | `cat.glb` | Cat Town | Procedural fallback (GLB optional) |
| Dodo Dog | `dog.glb` | Puppy Park | Procedural fallback (GLB optional) |
| Pip Penguin | `penguin.glb` | Penguin Glacier | Procedural fallback (GLB optional) |
| Mimi Cow | `cow.glb` | Mimi Farm | Procedural fallback (GLB optional) |

The same model override is used in solo play, split-screen multiplayer
and the character shop. If a file is absent or invalid, the game uses
the existing animated procedural animal rather than showing a broken
asset. `src/modelAssets.js` controls the allowlisted local paths.

## What makes a GLB look like the reference?

- A true 3D sculpt, not a 2D concept image, with a **readable back view**.
- Embedded PBR colour/normal/roughness textures (ideally 1K–2K), not a
  single solid-white material.
- Correct distinct ears, body shape, hind legs/hooves/paws and tail.
- A skeleton and named idle/run/jump animations are preferred; at minimum
  a run animation clip should be included. Current importer starts the
  first available embedded clip.
- Feet placed at ground height, proportions suited to about 2.55 world
  units tall, and orientation facing the runner direction after import.
- A license permitting your desired game redistribution and commercial
  distribution if applicable. Preserve attributions when required.

## Install from Windows CMD

From the root `penguin-game` folder, after adding the seven GLBs:

```cmd
git add public/models/*.glb
git commit -m "Add textured and animated Pawverse animal models"
git push origin main
npm install
npm run dev
```

Try `http://localhost:5173/?quality=hd` for higher desktop render
resolution. Use `?quality=balanced` to compare performance.

**Important:** A previously supplied file called `white_mesh.glb` had a
single untextured mesh, with no painted colours, skin or animation clips.
It is **not** enough to create the detailed HD reference appearance.
The importer intentionally rejects unpainted white meshes.

Bella Bunny (`public/models/bunny.glb`) is now included in this repository as the first official imported 3D character asset. The remaining six animal models currently use procedural fallbacks and can be replaced whenever additional GLBs are added.
