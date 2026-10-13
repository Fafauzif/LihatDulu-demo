# LihatDulu

A furniture marketplace concept built around one interactive Sora cabinet. It opens with a buyer or seller choice, then gives buyers a curated catalogue with Sora as the first fully interactive item. The interface is in Indonesian.

## Deploy on Vercel

1. Extract the ZIP and use its `LihatDulu` folder as the project root.
2. Import that folder's contents into your Git repository and connect the repository to Vercel, or deploy the folder with the Vercel CLI.
3. Select Vite if framework detection asks. Build with `npm run build` and use `dist` as the output directory. The included `vercel.json` contains these settings and the rewrite needed for direct entry and refresh on application routes.

No environment variables, API keys, backend services or application accounts are required. The ZIP includes source, locked dependencies, local assets and a prebuilt `dist` folder. Install dependencies from the source folder before rebuilding.

## Local development

Use Node.js 24 or later.

```bash
npm ci
npm run dev
```

```bash
npm run build
npm run preview
```

## Explore the product

- `/` opens the role chooser. Choose **Beli furnitur** for the buyer marketplace or **Jual furnitur** for the prepared seller walkthrough.
- `/beli` opens the buyer marketplace. Lemari Sora appears first with the live 3D badge. The other catalogue cards are honest placeholders using supplied example images, and each opens Sora because it is the only item with a complete interactive product experience in this release.
- `/barang/sora` opens Sora's live 3D view. Rotate it, select an angle, and open either door or the drawer independently.
- `/barang/sora?tab=condition` opens the same cabinet with its three condition notes. Each note links a model position to a matching close-up image.
- `/barang/sora?tab=room` offers three prepared room layouts. Separate checks show whether the cabinet body, doors and drawer have clearance. Custom dimensions and positions are optional.
- `/jual` explains the photography idea using six supplied Sora images. Choose a view, press the shutter, retake, review, restart or undo. It never opens a camera, requests media permission or asks for an upload.
- `/tersimpan` shows Sora after it is saved. Saved favourites and room positions remain local to the browser and origin.
- `/checkout/sora` offers pickup or delivery and a payment-method choice without requiring personal information. `/checkout/sora/tinjau` reviews those choices. It does not submit an order or take payment.

The prepared photography selection uses separate session state. Restarting it does not delete photographs or drafts left by an earlier version. `/buat` and `/barang-saya` open the same prepared walkthrough.

## Verification

```bash
npm test
npm run build
npm run test:production
```

The unit checks cover state validation, cabinet geometry, persistence, prepared photography state, room presets and checkout arithmetic. The integrated browser suite exercises actual 3D camera positions and moving cabinet parts, prepared capture, room results, saving, keyboard interactions, checkout and layouts from 320 to 1920 pixels. It blocks and counts media-permission and file-opening attempts while checking the served application code for the removed upload workflow.

Results and screenshots are written to `qa-output/prepared/` and `qa-output/prepared-production/`. `QA_OUTPUT` changes the output directory. The production suite runs against the compiled static application, including direct routes and refreshes. A command or test description is not itself a pass claim. The current release evidence is recorded in `docs/MASTER_AI_CONTEXT.md`.

On Linux, the test helper uses the included Chromium dependency with software WebGL. On macOS or Windows, install the test browser with `npx playwright install chromium`. `CHROMIUM_PATH` can select a compatible Chromium executable.

Responsive browser checks do not verify every physical device. Native Safari, physical phones and hardware graphics drivers remain separate verification limits.

## Scope and data

This is an interactive product concept with a commercial presentation. Sora, its price, location, wear details, supplied images and model are authored example content. There is one active product and five catalogue placeholders. There are no live sellers, authentication, inventory services, paid orders, payment processing, camera capture, uploads, automatic damage detection, measured reconstruction or Gaussian-splat generation.

The 3D asset is an articulated GLB rendered with Three.js. The supplied photographs and spatial photography scene show that same cabinet. Pressing the prepared shutter selects an existing example frame. It does not create a model or imply a real reconstruction has finished.

Room results use the authored cabinet dimensions and geometry. Imported or saved positions with unconfirmed dimensions remain uncertain and cannot become an unqualified positive fit result. Clearance is a geometric illustration rather than a guarantee for real furniture or rooms.

Pickup totals Rp2.450.000. The example delivery fee is Rp150.000, giving a total of Rp2.600.000. Payment options affect the review presentation only.

## Source and assets

- `src/main.js`: role chooser, buyer marketplace, single-product routes, saved items, navigation, gallery and checkout.
- `src/inspection.js` and `src/inspection.css`: the 3D inspection and room interface.
- `src/prepared-capture.js`, `src/prepared-state.js` and `src/prepared-capture.css`: the prepared photography walkthrough.
- `src/engine.js`, `src/geometry.js` and `src/room-presets.js`: rendering, cabinet movement and room geometry.
- `public/`: local cabinet images, GLB, self-hosted font and favicon.
- `tests/` and `scripts/`: unit and browser verification.
- `docs/MASTER_AI_CONTEXT.md`: current handoff and explicitly labelled historical context.

Older implementation files and documents may describe retired camera or catalogue flows. The current entry point and the current section of the master context document take precedence.

Three.js and Vite use MIT licences. Plus Jakarta Sans uses the SIL Open Font License. Notices are included in `THIRD_PARTY_LICENSES.txt` and `public/fonts/OFL.txt`.
