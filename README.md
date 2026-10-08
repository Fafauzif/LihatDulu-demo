# LihatDulu

A photo-led furniture marketplace with an interactive Sora cabinet, room placement, guided camera capture and a checkout review screen. The interface is in Indonesian.

## Deploy on Vercel

1. Extract this ZIP. Use the `LihatDulu` folder as the project root.
2. Import the folder's contents into your Git repository and connect it to Vercel, or deploy that folder with the Vercel CLI.
3. Select Vite if framework detection asks. The included `vercel.json` sets `npm run build`, the `dist` output directory and direct-route rewrites.

No environment variables, accounts, API keys or server setup are required. The `dist` folder also contains the prebuilt static website.

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

After building, `npm run test:production` verifies the compiled static site, direct routes and refreshes.

## Included flows

- Six distinct furniture listings with search, categories, price filters, sorting and saved items.
- Product photos, dimensions, condition information, share links and a copyable photo request.
- Sora's live 3D inspection with separate door and drawer controls and linked condition photographs.
- Room dimensions, placement, rotation, separate body/door/drawer clearance checks and saved positions.
- A spatial photography guide and a seller flow using the device camera or original uploaded JPG, PNG and WebP photographs.
- Device-local photo drafts, condition notes, measurement confirmation, review, resuming and original-photo downloads.
- Pickup/delivery choices and an editable checkout review.

## Verification

```bash
npm test
```

This runs the unit checks and the integrated browser suite. Browser checks cover eight viewport sizes from 320 to 1920 pixels, filters, gallery navigation, saved items, 3D controls, room checks, camera capture, draft persistence and checkout review. Captures and results are written to `qa-output/`. Set `QA_OUTPUT` to change that destination.

On Linux, the browser helper uses the included Chromium development dependency. On macOS or Windows, install the test browser first with `npx playwright install chromium`. `CHROMIUM_PATH` can point to an existing compatible Chromium executable.

Physical phone cameras, mobile Safari and hardware graphics drivers still require testing on those devices. The browser camera tests use a controlled camera stream.

## Scope and data

This is a frontend presentation. Inventory, prices and locations are authored showcase content. There are no live seller accounts, payment processing, submitted orders or automatic photo-to-3D reconstruction. Customer-facing screens retain a finished product presentation.

Photographs and drafts stay in the current browser and origin. When device storage is unavailable or full, the interface explains that photographs have not been saved and offers recovery. Identical original photo bytes cannot count as different photography angles. Uploaded originals are preserved.

Only Sora has an authored interactive 3D asset. Other listings use their own photographs. A room fit result requires confirmed cabinet dimensions and valid room measurements. An unconfirmed saved position retains that uncertainty.

## Source and assets

- `src/`: application, camera workflow, storage, 3D and room logic.
- `public/`: local furniture imagery, cabinet GLB, font and favicon.
- `tests/` and `scripts/`: unit and integrated browser checks.
- `docs/catalogue-assets.md`: provenance of the five new catalogue photographs.
- `docs/asset-provenance.md`: provenance of the existing cabinet and condition imagery.

Three.js and Vite use MIT licences. Plus Jakarta Sans uses the SIL Open Font License. Notices are included in `THIRD_PARTY_LICENSES.txt` and `public/fonts/OFL.txt`.
