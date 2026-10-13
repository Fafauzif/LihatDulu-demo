# LihatDulu asset provenance

This prototype depicts one invented, realistic cabinet named Sora. The cabinet,
its cosmetic wear, and its evidence renders are authored demonstration material.
They do not represent a photogrammetric reconstruction of a customer item.
The embedded light-wood material uses an optimized texture supplied by the user as texture 2.

## New room-context imagery

| File | Format | Dimensions | Content |
| --- | --- | --- | --- |
| `public/images/room-cabinet-hero.webp` | WebP | 1600 × 1150 px | Original cabinet GLB, closed, in an authored warm room scene. |
| `public/images/room-cabinet-detail.webp` | WebP | 1000 × 1100 px | Same cabinet GLB, left door 22 degrees open and drawer 0.09 m extended. |
| `public/images/studio-capture-scene.webp` | WebP | 1600 × 1000 px | Actual runtime capture scene in preparation phase, including the authored phone and its simulated live cabinet preview. |

The new room images load the existing `public/assets/cabinet.glb` without modifying
its mesh geometry, scale, cosmetic-wear geometry, or cabinet materials. The room
uses original primitive geometry for plaster walls, a window-like recess, framed
abstract art, a woven rug, a floor vase, and a potted plant. Floor and rug textures
come from deterministic canvas drawing code in the regeneration script. No stock
furniture imagery, AI-generated furniture imagery, photographs of unrelated
furniture, Mobbin screenshots, or Envato artwork appear in these two exports.

The hero camera shows the cabinet closed. Its world-space bounds after loading
are approximately 0.90 m wide, 1.20 m high, and 0.475 m deep. The detail pose opens
existing articulation nodes and therefore expands the displayed depth. These are
authored geometry dimensions, not measured capture results.

The plant, rug, artwork, vase, lighting, and room are illustrative context. They
are not evidence of the cabinet's real surroundings and do not form part of room
fit calculations. No decorative prop covers a documented wear patch on the
cabinet.

### Reproduction

From the project root:

```sh
npm install
node scripts/render-scene-assets.js
```

The script imports the installed Three.js package, starts a local ephemeral HTTP
server, loads the unchanged cabinet GLB in Chromium, renders the two scene poses,
and saves WebP files directly from the WebGL canvas. It uses the existing
`scripts/test-browser.js` browser helper. Linux uses the packaged Chromium binary
and software WebGL renderer; other platforms use Playwright's configured browser.
The `CHROMIUM_PATH` environment variable may override the executable path.

This is a conventional authored raster render. It does not perform live capture,
segmentation, reconstruction, dimension estimation, AI grading, or damage
detection. The original cabinet capture scene is an authored photography guide. V5 uses six supplied example photos in a prepared capture walkthrough. Public
routes do not request camera access, open a file picker, or reconstruct a 3D model.
The former V4 device-photo workflow is historical source, outside the runtime import graph.

## Existing evidence imagery

The original cabinet evidence renders remain unchanged in `public/images/`:

- Overall views: `cabinet-closed.webp`, `cabinet-open.webp`, and the open-cabinet
  transparent images.
- Documentation: `capture-front.webp`, `capture-front-left.webp`,
  `capture-front-right.webp`, `capture-left.webp`, `capture-right.webp`,
  `capture-rear.webp`, `capture-top.webp`, `capture-underside.webp`,
  `capture-interior.webp`, and `capture-drawer.webp`.
- Authored condition close-ups: `wear-scratch.webp`, `wear-chip.webp`, and
  `wear-mark.webp`.

These images depict the authored cabinet model and authored example wear. A
prepared example photo is not a photo taken by the prototype visitor. Product copy
must keep this distinction visible.

## Uploaded reference assets

The supplied Turo flow and Envato furniture UI kit inform capture ordering,
coverage feedback, review hierarchy, and visual composition. The original Mobbin
and Envato ZIPs, design sources, and source screenshots should not ship in the
public website package. The supplied hand-holding-phone PSDs are static visual
references. The runtime phone prop uses independently authored geometry.

## Runtime capture-scene preview

`studio-capture-scene.webp` comes directly from the current `src/engine.js` and
`src/capture-scene.js` runtime, using `setCaptureScene({ phase: 'prepare', area:
'front', progress: 0 })`. It depicts the original cabinet GLB, an authored cutaway
room, six coverage checkpoints, and an independently authored phone. The phone is
0.115 m wide, 0.23 m high, and approximately 0.011 m thick before bevels. Its larger
illustrative size improves legibility in the spatial demo.

The phone screen displays a second Three.js render of the authored cabinet and
the authored capture interface. It never reads a physical camera stream and never
reconstructs a model. The prepared flow labels its material as example photos. The screen is an authored
visual guide, with no claim of live reconstruction or a recording from the visitor.
The generated image contains no supplied hand-holding-phone PSD pixels.

Reproduce it from the project root after installing dependencies:

```sh
node scripts/render-capture-preview.js
```

The script serves a dedicated temporary HTML page through Vite middleware rather
than modifying the application UI. It waits for the scene and phone preview to
settle, captures the WebGL canvas as WebP, and disposes the engine and browser.
The preview uses a solid warm background and hides DOM condition markers and
dimension labels so it reflects the intended capture scene.

## Export inventory at handoff

| File | Bytes |
| --- | ---: |
| `room-cabinet-hero.webp` | 101,442 |
| `room-cabinet-detail.webp` | 81,830 |
| `studio-capture-scene.webp` | 47,718 |

Image dimensions and file size can change if future developers adjust the room,
lighting, camera, phone, output settings, or compression quality. The rendering
scripts are the source of truth for new scene exports.

This document records provenance, not legal certification or an assertion that
the site received permission to redistribute source reference files.
