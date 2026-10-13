# LihatDulu: Master AI Context Pack

## V5.1 role gateway and marketplace revision

This section is the current authoritative continuation record for the 8 October 2026 role-flow revision. It supersedes any older V5 statement below that says the root route opens directly to Sora. The historical V5 material remains preserved for provenance, but implementation decisions must follow this section and the actual source.

| Field | Current value |
| --- | --- |
| Project | LihatDulu |
| Product | A curated furniture marketplace concept with one fully interactive Sora cabinet |
| Audience | Competition judges and potential investors |
| Interface language | Indonesian |
| Revision | V5.1 role gateway and buyer marketplace |
| Root entrance | Role chooser at `/` with Beli furnitur and Jual furnitur cards |
| Buyer route | `/beli` with Lemari Sora first and five honest catalogue placeholders |
| Seller route | `/jual` opens the prepared Sora photography walkthrough |
| Interactive product route | `/barang/sora` remains the canonical Sora inspection page |
| Placeholder behavior | Existing supplied catalogue images are labelled Segera hadir and route to Sora |
| Camera and uploads | Still removed from the public application journey |
| Required export | Updated Vercel-ready source ZIP with rebuilt static output |
| Documentation status | This section, the actual source, and fresh verification evidence are authoritative |

### V5.1 approved decisions

- The root page is a role chooser inspired by the supplied GOPANG reference, while keeping LihatDulu's own warm off-white, forest-green, and terracotta-dot identity.
- The buyer card leads to `/beli`, which presents a commercial-looking product grid with Sora first. Sora is the only active listing and the only card with a real interactive 3D product experience.
- The remaining five cards use the existing local catalogue images as clearly labelled placeholders. They do not invent prices, sellers, stock, reviews, or availability. Selecting any placeholder opens `/barang/sora` so the judge reaches the available inspection experience.
- The seller card leads directly to the existing prepared `/jual` walkthrough. It does not restore camera permissions, upload controls, or a new seller form.
- Existing Sora, room, condition, saved-items, checkout, prepared aliases, and legacy inspection routes remain available. Direct product links continue to open Sora without requiring the role chooser.
- Header, footer, mobile menu, empty states, and seller handoff links use `/beli` or `/barang/sora` according to their meaning. The brand mark remains a route back to the role chooser.

### V5.1 design and QA contract

Use the installed Taste Skill for audit-first, anti-template frontend decisions. Use the bundled marketplace and photography DESIGN.md references as inspiration only, preserving LihatDulu's existing tokens instead of copying another brand. Review changed UI against the Web Interface Guidelines and exercise the new routes with Playwright at phone, tablet, and desktop widths. Verify keyboard focus, real link semantics, image alt text and dimensions, honest placeholder labels, responsive overflow, reduced motion, direct route refreshes, and preservation of the existing 3D fallback, seller walkthrough, room, saved, and checkout journeys.

The updated master pack must record actual verification results. A command description alone is not evidence of a passing check.

### V5.1 verification evidence

Completed 8 October 2026 with Node.js 24, Vite 8.3.2 and Playwright Chromium using software WebGL on Linux. These results are for the final source and rebuilt `dist/` included in this export:

| Check | Result | Evidence |
| --- | --- | --- |
| Unit suite | 57 / 57 passed | State, room, checkout, saved-item and prepared-capture tests |
| Vite production build | Passed, 25 transformed modules | `dist/` rebuilt immediately before compiled QA |
| Browser redesign suite | 113 / 113 passed | Eight viewport sizes from 320 × 568 through 1920 × 1080, role chooser, marketplace, Sora model, seller walkthrough, room, checkout, keyboard, touch, reduced motion, fallback and source/network guards |
| Compiled production suite | 22 / 22 passed | Direct route and refresh checks, chooser → marketplace → seller flow, canonical WebGL model, persistence, screenshots and media/upload guards |

The browser checks observed zero camera or file-opening attempts, zero unexpected external requests, no missing assets, no console or page errors, no horizontal overflow, and no source changes during the final evidence run. Screenshots and JSON reports remain under `qa-output/prepared/` and `qa-output/prepared-production/` in the working source when rerunning locally. Native Safari, physical mobile devices and hardware-specific GPU behavior remain outside this verification scope.

## V5 document status

This historical V5 front section is retained below the V5.1 revision for provenance. The entire previous master pack is retained verbatim after the historical boundary. Statements inside that archive that call V4 or V3 “current”, describe pending user decisions, prohibit implementation, require real camera capture, or describe six live catalogue items are historical and superseded.

| Field | Current value |
| --- | --- |
| Project | LihatDulu |
| Product | A furniture buying experience centred on one cabinet, immediate interactive 3D, visible condition and room clearance |
| Audience | Competition judges and potential investors |
| Interface language | Indonesian |
| Document date | 8 October 2026 |
| Current approved revision | V5.1 role gateway and buyer marketplace, source package version 5.1.0 |
| Latest user authorization | Proceed with the revision, preserve the visual quality, make exploration seamless, and apply the rigorous QA loop |
| Entrance | Role chooser at `/`, with buyer marketplace at `/beli` and seller walkthrough at `/jual` |
| Real camera and uploads | Removed from the public application journey |
| Technology proof requirement | An interactive product concept is sufficient |
| Source checkout | `/workspace/sites/lihatdulu` |
| Source baseline before V5 edits | `ff128c93eaac46cd7905383d4e2e6d0d3bf01030` |
| Preview release target | [LihatDulu preview](https://lihatdulu.sadsong53.chatgpt.site) |
| Original public reference | [Original Vercel reference](https://lihatdulu-proto.vercel.app/) |
| Required export | A new Vercel-ready source ZIP with prebuilt static output |
| Current documentation authority | This V5 front section, actual source, and fresh applicable verification evidence |

The original public Vercel reference is a reference site. It must not be described as updated unless an actual Vercel deployment occurs. The existing ChatGPT preview URL can remain the same while its version changes. URL continuity alone does not prove that new code is live.

### V5 navigation

- [V5 requirements and approved decisions](#v5-requirements-and-approved-decisions)
- [V5 first screen and buying journey](#v5-first-screen-and-buying-journey)
- [V5 prepared photography journey](#v5-prepared-photography-journey)
- [V5 room and confidence contract](#v5-room-and-confidence-contract)
- [V5 commercial completion and saved items](#v5-commercial-completion-and-saved-items)
- [V5 visual and interaction direction](#v5-visual-and-interaction-direction)
- [V5 routes and compatibility](#v5-routes-and-compatibility)
- [V5 source architecture](#v5-source-architecture)
- [V5 state and privacy contract](#v5-state-and-privacy-contract)
- [V5 cabinet and evidence contract](#v5-cabinet-and-evidence-contract)
- [V5 claims and technology boundaries](#v5-claims-and-technology-boundaries)
- [V5 verification record](#v5-verification-record)
- [V5 operation and Vercel handoff](#v5-operation-and-vercel-handoff)
- [V5 context authority and continuation](#v5-context-authority-and-continuation)
- [Preserved history boundary](#preserved-history-boundary)

## V5 requirements and approved decisions

The user likes the V4 appearance. Their latest objection is friction and emphasis. They want the website to look like a complete product while a judge can explore its value without owning furniture, photographing it, filling a listing, measuring a room, entering personal details or signing up.

The main idea is richer inspection before buying. The cabinet should be immediately visible as a live object on its product page. Other listings with no 3D asset dilute that idea. One carefully prepared item is sufficient.

The user also wants the seller photography idea represented. They explicitly disliked actual camera activation and approved removal of the real camera/upload branch. That decision is material and persists across future turns until the user changes it. A future agent must not restore `getUserMedia`, upload inputs or permission prompts as a helpful improvement.

The prior final questions are now resolved:

| Decision | Approved answer | Consequence |
| --- | --- | --- |
| Initial entrance | Straight to Sora | The root page is the cabinet experience rather than a broad marketplace grid or explanation page |
| Genuine camera/upload branch | Remove it | Seller exploration uses supplied example frames and separate prepared state |
| Required technical proof | Interactive product concept | An authored model can sell the inspection idea without claiming Gaussian-splat reconstruction |

The user authorized implementation with “Ok proceed” and asked for a rigorous review-and-revision loop. The planning-only boundary inside the archived pack no longer applies to this work.

### Persisting content and presentation constraints

- Preserve the warm, restrained V4 visual identity that the user liked.
- Keep the customer-facing interface in natural Indonesian.
- Present the product itself rather than embedding a pitch deck or implementation explanation.
- Keep primary paths usable without uploads, media permission, personal data, room measurement or account setup.
- Use matching views of the same Sora cabinet throughout inspection, condition images, photography and checkout.
- Do not put “Prototype”, “Prototipe”, “Demo” or “Simulasi” banners in normal product screens.
- Do not use em dashes, generic key-takeaway boxes, fake testimonials, fake verified-seller badges, fabricated sales, processing theatre, or claims of completed reconstruction.
- Remove the prominent additional-photo request and the broad six-item shopping detour.
- Keep customer actions clear, reachable and distinct on desktop, tablet and phone.
- Honour reduced motion, keyboard navigation, loading and model-failure fallback.
- Deliver a Vercel-ready ZIP after implementation. A preview link alone is insufficient.
- Use existing access. Do not require the user to configure API keys, pay for new services or do creative production work.
- Keep critique exchanges and numerical review scores out of the website, export and ordinary handoff copy.
- Briefly disclose material unresolved verification limits instead of promising perfection or universal hardware compatibility.

### Success definition

A judge opens the site and sees Sora as the primary object. A matching poster remains visible while the real GLB loads. Once ready, the judge can select angles, rotate, open either door and the drawer, inspect three wear details, switch between prepared rooms, save the item or a room position, and explore the supplied photography sequence. No setup is required.

The presentation should feel curated and commercial, with the interaction doing the explaining. A judge can understand the core idea without following a guided sequence, and the prepared seller sequence remains useful if explored later.

The desired craft references remain Figma, Claude and OpenAI product demos. These are aesthetic aspirations. Do not claim measured equivalence with those products.

## V5 first screen and buying journey

`/` and `/barang/sora` render the same Sora product experience. The selected media tab is `Jelajahi 3D` by default. The other outer tabs are `Coba di ruang` and `Foto`. The legacy `condition` query selects the 3D tab and opens the condition notes.

The product heading identifies “Lemari Sora”, its furniture category and used condition. Its supporting sentence explains inspection in customer language. Save and share sit beside the heading. The 3D stage is the main media area. The commercial sidebar contains the authored price, Jakarta Selatan location, dimensions, pickup/delivery context, material and condition. Room exploration is a prominent next action, and choosing the item leads to checkout review.

The public product entry no longer starts with a static photo gallery, a six-item results grid, an empty seller draft, a form or a promotional hero. Photographs remain available as useful supporting evidence.

### Ready state and failure state

The 3D stage contains a matching cabinet poster, an honest loading status and progress while the asset is fetched. Controls requiring an engine are disabled until the model is ready. The poster is hidden after an actual engine has loaded, rather than after an arbitrary timer.

A failed model load retains the poster and exposes a retry action. Supporting photos and condition notes can remain available. A failure must not leave a blank stage or show successful movement or fit results for an unavailable model.

### Immediate inspection controls

The model view exposes five camera presets: front, left, rear, top and interior. Continuous orbiting supplies other angles. The three primary storage controls open or close the left door, right door and drawer independently.

Precise opening adjustment is available inside the `Atur bukaan` disclosure. Door sliders range from 0 to 100 degrees. The drawer slider ranges from 0 to 30 centimetres. Open-all and close-all actions remain available there. Zoom, dimension labels and reset are secondary controls inside `Zoom & ukuran`.

Opening a part must change the real model pivot or translation. A changed button state alone is insufficient. Camera presets must change the actual camera relative to its target. The verification harness inspects those engine values.

### Condition inspection

The three condition records are a scratch on the left door, a small chip at the upper-right corner and a ring mark on the top. The normal model page keeps their detailed panel collapsed until it is useful. Choosing a note or a model marker focuses the corresponding model area, opens the evidence detail and shows the matching close-up.

The detail includes its customer-facing description and size. The scratch is 11 centimetres long, the chip is 8 × 5 millimetres, and the ring diameter is 5.5 centimetres. These are authored model facts, not automated diagnoses of an uploaded item.

Photo-detail navigation and returning to the stage should preserve the user's current exploration. The interface must not force a page reload simply to inspect a note.

### Product photos

The supporting gallery uses four existing Sora images: closed overall view, open storage view, rear view and scratch detail. Previous/next buttons and thumbnails select a frame. The chosen photo is remembered while switching media tabs in the current browsing session.

There is no prominent “Minta foto tambahan” action. It was explicitly removed from the experience because the core proposition is richer inspection.

## V5 prepared photography journey

`/jual` now opens an already prepared Sora example. It is not the V4 seller form. `/buat`, `/barang-saya` and the legacy Sora `guide` query reach the same prepared walkthrough.

The page explains the photography idea with ordinary labels such as “Contoh: Lemari Sora” and “Foto contoh”. Those labels are intentionally truthful, short and relevant to the action. They avoid a prototype banner or a technical explanation that interrupts the experience.

A spatial scene shows the same cabinet and an authored photography viewpoint. The scene uses the existing engine and capture-scene component. It does not connect to any physical camera. The supplied image changes to match the chosen area. On phones, the shutter and next/review actions sit directly after the spatial stage. Area choices follow, with a compact supplied-frame preview below, so the primary action does not require scrolling past a second large image.

### Supplied photography areas

| State ID | Customer label | Supplied frame | Scene phase |
| --- | --- | --- | --- |
| `front` | Depan | `/images/capture-front.webp` | exterior |
| `right` | Samping | `/images/capture-right.webp` | exterior |
| `rear` | Belakang | `/images/capture-rear.webp` | exterior |
| `interior` | Dalam | `/images/capture-interior.webp` | interior |
| `drawer` | Laci | `/images/capture-drawer.webp` | interior |
| `scratch` | Kondisi | `/images/wear-scratch.webp` | interior |

Each area has its own heading and concise photography guidance. The initial counter is 0 / 6 selected areas. Pressing `Ambil foto` adds the current supplied frame to the selection and displays a brief shutter response. The selected area shows `Foto ditambahkan` and a check mark. `Ambil ulang` replaces that area's example selection without increasing the count. Advancing wraps from the final area back to the front.

The count represents selection coverage in this example. It is not reconstruction progress, upload progress, model-processing time, AI confidence or real captured-image count.

The spatial capture camera frames the actual current GLB world bounds, including open articulated parts. It projects all eight bounds corners through the current camera field of view and stage aspect, keeps each corner inside ±0.92 on both normalized clip axes, and moves back as needed while preserving the selected angle and target. That leaves four percent of the full viewport dimension as edge clearance on each side. Selection, stage resize and camera reset use this framing so intermediate tablet widths do not crop the cabinet. The desktop stage and supplied frame also use viewport-aware height limits. Phone stages retain compact heights of 210, 220 or 250 pixels according to their responsive rules.

### Review and restart

`Tinjau foto` opens a prepared review containing the six supplied images, Sora's name, material, dimensions and the three condition facts. It can be reached without selecting every frame. This lets a judge inspect the complete concept without repetitive busywork.

The review links back to actual product inspection and room exploration. Its six image tiles use responsive square sizing with an explicit `height: auto`, avoiding tall blank image areas caused by intrinsic HTML height attributes. It does not show a fake reconstruction completion, processing spinner, generated geometry, automatic condition score or successful marketplace publication.

`Mulai lagi` resets only the prepared example and exposes `Urungkan`. Undo restores the previous prepared state. It must not call a global data reset, clear storage wholesale, remove old personal media, or delete drafts created in a previous version.

Leaving the scene or entering the review disposes the engine that is no longer needed. Returning to the scene must load a usable engine without duplicate canvases or leaked callbacks. Rapid review/back and route switching are relevant race cases for QA.

### State schema

`src/prepared-state.js` validates an exact schema:

```json
{
  "schema": 1,
  "area": "front",
  "captured": [],
  "review": false
}
```

Only the six known area IDs are permitted. The selected list has no duplicates and at most six entries. Extra keys, an unknown area, a malformed list or a non-boolean review flag are rejected. Validation returns a copy rather than mutating the input. Selection and capture helpers pass through that validation.

The session storage key is `lihatdulu:prepared-sora:v1`. No image bytes, personal metadata, file handles or device permission state are persisted by the prepared walkthrough. If session storage fails, the in-page example still operates, but persistence across reload is not guaranteed.

## V5 room and confidence contract

The room view provides ready-made layouts before optional numeric fields. Every preset starts from a 3.2 × 3 metre room, cabinet position x = 0 and z = -0.4 metres, and rotation 0 degrees. The differences are the authored obstacle configuration.

| Preset ID | Customer name | Configuration | Intended demonstration |
| --- | --- | --- | --- |
| `clear` | Area terbuka | Clear floor area | Cabinet body and storage can be inspected in an open layout |
| `door` | Bukaan pintu | Obstacle in front of the cabinet door path | The cabinet can fit while a door is obstructed |
| `drawer` | Bukaan laci | Obstacle in front of the drawer path | The cabinet can fit while drawer extension is obstructed |

`roomForPreset(id)` returns a fresh copy, so editing a room does not mutate a preset. `matchRoomPreset(room)` identifies an exact preset match or returns no match. The `wall` fixture remains available in the optional custom control.

The room produces separate outcomes for cabinet body, door clearance and drawer clearance. A body-fit result is not automatically a guarantee that every opening works. The door and drawer tests use the articulated geometry and authored obstacle bounds.

The optional `Sesuaikan ukuran & posisi` disclosure contains room width and length, cabinet x/z position, rotation, rotate-left/right and fixture controls. Valid room ranges are width 1.2 to 10 metres, depth 1 to 10 metres, x/z positions -10 to 10 metres, and rotation -180 to 180 degrees. Numeric adjustments are not required for the prepared path.

### Saving and uncertainty

Saving stores the report, room state, time and, when available, an actual placement preview. A confirmed geometric result can be stored as fit data. The selected saved position can be restored from the `Posisi tersimpan` disclosure. Reset restores the open prepared room and closes storage. Undo restores the prior room and its dimension-confidence state.

The default Sora report uses the known authored cabinet dimensions and sets them confirmed for the example. An imported report or saved placement with unconfirmed dimensions must continue to show `Ukuran belum dikonfirmasi`. It cannot acquire an unqualified green fit result merely by being restored, saved, opened in a new tab or reloaded.

The persisted active-room confidence is associated with the source report. A saved room from an unrelated report must not silently change the current report's confidence. Both confidence hydration and saved-position restoration are bounded by the current source report's confirmation. An unconfirmed source cannot become confirmed by selecting a confirmed saved record from a different report.

Room clearance is a conservative geometric illustration using the authored model. It does not certify real-world furniture tolerances, wall measurement accuracy, hinge play, floor flatness, transport access or a user's actual room. The known algorithm samples door motion at one-degree intervals and drawer motion at five-millimetre intervals. Its guarantees are bounded by that authored geometry and sampling.

## V5 commercial completion and saved items

Sora is the only public listing. It is priced at Rp2.450.000 and located in Jakarta Selatan. Material is panel wood with a light grain finish. Closed dimensions are 90 × 47.5 × 120 centimetres, including the handle depth.

The saved-items page displays one Sora card after the item is favourited. Its empty state explains the heart action and links directly to Sora. It must not invent unavailable stock, reviews or past purchases.

Favourite IDs are normalized against the current one-item listing set. Old favourites for removed catalogue items do not restore those products. When there is no explicit favourites preference, an existing saved report can seed a Sora favourite for compatibility. This is local continuity, not proof of a real seller account or commerce service.

Sharing copies the canonical Sora product URL and retains a validated report hash where present. The share button has the explicit accessible name `Bagikan barang`, including phone layouts where its visible text is hidden. A clipboard failure presents a copyable read-only link rather than pretending the copy succeeded. No sharing action sends an email or message to a seller.

### Checkout

`/checkout/sora` provides pickup or delivery and a payment-method choice. Pickup is the default. Choosing delivery uses a supplied Jakarta Selatan example location. Neither path requires name, phone, address, city, account details or payment credentials.

| Selection | Item price | Example fee | Total |
| --- | --- | --- | --- |
| Pickup | Rp2.450.000 | Rp0 | Rp2.450.000 |
| Delivery | Rp2.450.000 | Rp150.000 | Rp2.600.000 |

`checkoutTotals` validates a finite non-negative price, rounds the subtotal and adds the fixed example delivery fee only for the delivery choice. Payment is either pay when received or bank transfer. These options affect the review presentation only.

Submitting the form navigates to `/checkout/sora/tinjau`. This is an editable review, with return-to-product and change-selection actions. It does not send an order, reserve inventory, charge money, call a bank, or show a fabricated success confirmation.

Checkout selection is held in memory in this implementation. A full page reload uses the default pickup/payment selection rather than claiming an account-backed persistent checkout. This distinction matters when evaluating direct route entry.

## V5 visual and interaction direction

The preserved visual system uses a self-hosted Plus Jakarta Sans variable font, warm off-white surfaces, forest green actions, charcoal text, muted green-grey secondary text and a restrained terracotta brand dot.

| Token | Value |
| --- | --- |
| Canvas | `#fafaf8` |
| Main text | `#242923` |
| Secondary text | `#687068` |
| Primary green | `#173f32` |
| Primary hover | `#24533f` |
| Dividers | `#dee3dc` |
| Soft surface | `#eef4ee` |
| Media surface | `#f0f1ed` |
| Error | `#973f31` |
| Typical radius | 12 px |
| Font | Plus Jakarta Sans, locally served WOFF2, weight range 200 to 800 |

Typography retains clear hierarchy and readable body text. Major screens use whitespace, product media and a small set of well-labelled actions. Every tool should have a useful customer meaning. Developer controls, task lists, review ratings and architecture commentary do not belong in the product.

Model and capture stages receive the visual emphasis. Detailed notes, precise opening sliders and custom room dimensions are disclosures. This reduces competing controls while preserving inspectability.

Desktop has the media area and compact commercial sidebar. Phone layouts stack useful actions close to the stage and retain ordinary page scrolling. A touch stage must not trap the reader's only vertical scroll gesture. Preset angle buttons and separate opening buttons provide alternatives to precise drag gestures.

Interactive targets should remain at least 44 pixels where practical. Focus is visible, tab state is exposed, dialogs have names and can be closed, meaningful images have alt text, and dynamic feedback uses appropriate live status. Empty states are honest. Loading and error states are inspectable. Reduced motion must affect real camera and part transitions, as well as CSS animation. In reduced-motion mode, part changes apply synchronously to the actual model rather than queueing a nominally zero-duration animation for a later frame. Camera changes use the corresponding immediate path.

These are the approved direction and source contracts. Final rendered quality and device coverage must be established by the actual V5 verification record, not inferred from CSS alone.

## V5 routes and compatibility

| Route | Current treatment |
| --- | --- |
| `/` | Direct Sora live 3D product page |
| `/barang/sora` | Canonical Sora product page |
| `/barang/sora?tab=model` | Model view |
| `/barang/sora?tab=condition` | Model view with condition notes exposed |
| `/barang/sora?tab=room` | Prepared room view |
| `/barang/sora?tab=photos` | Supporting Sora gallery |
| `/barang/sora?tab=guide` | Prepared photography walkthrough |
| `/jual` | Prepared photography walkthrough |
| `/buat` | Prepared photography compatibility alias |
| `/barang-saya` | Prepared photography compatibility alias |
| `/tersimpan` | Sora saved item or honest empty state |
| `/checkout/sora` | Pickup/delivery and payment-method selection |
| `/checkout/sora/tinjau` | Editable checkout review |
| `/tentang` | Short product-oriented explanation |
| `/platform`, `/laporan`, `/studio` | Compatibility entrances to the current Sora experience |
| `/ruang` | Compatibility entrance to room exploration |
| Unknown or retired listing routes | Honest unavailable-item screen with a direct Sora link |

Hash report links are accepted only through the existing strict report validator. A malformed hash is not interpreted as executable content or arbitrary asset data. Query mode values are normalized to the permitted views. The SPA needs a host rewrite to `index.html` so these routes survive direct entry and refresh.

Legacy aliases are compatibility paths. They are not additional public products or old seller-flow entrances. A future cleanup can redirect them without restoring their old functionality.

## V5 source architecture

| File | Active responsibility |
| --- | --- |
| `src/main.js` | Single-product routing, commercial shell, gallery, favourites, share UI, modal/menu, checkout and mount disposal |
| `src/catalogue.js` | One authored Sora listing and catalogue helper exports |
| `src/style.css` | Preserved visual system and commercial responsive layout |
| `src/inspection.js` | Model, condition and prepared room UI, session restoration, confidence, placement saving and engine lifecycle |
| `src/inspection.css` | Stage, tool, condition and room layouts |
| `src/room-presets.js` | Immutable prepared room definitions and copied-state helpers |
| `src/prepared-capture.js` | Prepared scene, supplied frames, shutter selection, review, reset/undo and lifecycle |
| `src/prepared-state.js` | Exact prepared-state validation and immutable selection helpers |
| `src/prepared-capture.css` | Prepared photography and review layouts |
| `src/engine.js` | Three.js renderer, GLB, camera, articulation, condition anchors, dimensions, room and capture-scene control |
| `src/geometry.js` | Body, door and drawer geometry checks |
| `src/capture-scene.js` | Authored spatial photography guide and rendered example phone view |
| `src/state.js` | Strict report/room/placement validation, safe encoding, storage and saved reports |
| `src/viewer-state.js` | Strict viewer session validation and persistence |
| `src/shop-state.js` | Checkout arithmetic, delivery normalization and saved-ID normalization |
| `tests/prepared-state.test.js` | Prepared state validation, capture idempotency and mutation protection |
| `tests/room-presets.test.js` | Prepared geometry outcomes and copied preset state |
| `scripts/verify-prepared.mjs` | Integrated browser/viewport, actual-engine and no-permission verification |
| `scripts/verify-prepared-production.mjs` | Compiled application direct-route, refresh and no-permission verification |
| `vercel.json` | Vite build/output, SPA rewrites and response headers |

The current public entry point imports prepared photography rather than the historical seller camera or media-store workflow. Those historical modules can remain in the source archive for continuity, but must not be included in the served application import graph. Their presence on disk is not proof that a camera branch is available.

`mountInspection` returns its cleanup synchronously so a route switch can dispose an in-progress mount. The host exposes its engine for bounded verification. The prepared mount follows the same disposal principle. Engine teardown cancels animation, detaches listeners, disposes controls and graphics resources, releases its context and removes the canvas.

The `window.lihatDulu` diagnostic helper used by verification exposes the current engine, prepared state and Sora information. It is installed by the application and is not a customer workflow or a server API.

The working checkout's implementation plan is `docs/superpowers/plans/2026-10-08-prepared-sora.md`. The compact Vercel export may include only this master context and provenance documentation, so a historical path listed here is not a promise that every old document is present in the ZIP. This front section captures the effective V5 requirements and implementation contracts. Earlier design, camera and release documents remain useful history, but their version-specific “current” claims do not override this revision.

## V5 state and privacy contract

| Storage or state | Key or location | Current use |
| --- | --- | --- |
| Prepared photography | sessionStorage `lihatdulu:prepared-sora:v1` | Selected example area, selected frame IDs and review state |
| Favourites | localStorage `lihatdulu:favourites:v2` | Normalized Sora ID list |
| Viewer sessions | localStorage `lihatdulu:viewer:v1` via viewer-state helpers | Model and room camera/tool restoration |
| Saved room positions | localStorage `lihatdulu:placements:v1` | Validated report, room, timestamp, optional preview and confirmed fit |
| Active room report confidence | localStorage `lihatdulu:inspection:room-report:v1` | Validated source-bound confidence persistence |
| Historical saved reports | localStorage `lihatdulu:saved:v1` | Compatibility reading for prior saved report state |
| Photo tab choice | In-memory map | Selected gallery frame during current browsing session |
| Checkout choice | In-memory object | Pickup/delivery and payment choice for the current browsing session |

Prepared restart changes only prepared example state. It never clears localStorage or IndexedDB wholesale. Existing photographs and drafts from V4 are not used by the prepared example and must remain untouched by its reset action.

Malformed persisted data should fall back to a usable initial state. The strict validators reject unknown IDs, extra fields, invalid values, duplicate areas and arbitrary markup-bearing structures. Customer text is escaped before insertion. Hash links do not grant an ability to fetch arbitrary models or remote images.

Most state is local to a browser origin. Sharing a link does not transfer local favourites, personal media, room-position history or checkout state. A preview origin and a Vercel origin have separate storage. The site has no account synchronization service.

The no-camera constraint is stronger than an ordinary denied-permission fallback. The public experience must avoid calling media APIs at all. Browser QA blocks and counts `getUserMedia`, `getDisplayMedia`, legacy capture methods, permission requests/queries and file-opening attempts. The served code graph is separately inspected for retired upload/media paths.

## V5 cabinet and evidence contract

The physical example is the same authored Sora cabinet used throughout the project. Do not swap in a visually different cabinet, stretch its dimensions or combine unrelated furniture photos with the model.

| Property | Contract |
| --- | --- |
| Asset | `public/assets/cabinet.glb` |
| Model identity | `cabinet-01-v1` |
| Baseline GLB size | 4,702,852 bytes |
| Baseline GLB SHA-256 | `18cf94f5d342f9949d5b100bde3968dfc14b1746c3cb47570cf930ab55c9d742` |
| Coordinate convention | Metres, X width, Y up, +Z front |
| Closed width | 0.90 m |
| Closed depth | 0.475 m including handle |
| Closed height | 1.20 m |
| Mesh count | 31 |
| Triangle count in model specification | 27,503 |
| Left door | Up to 100° around its own Y pivot |
| Right door | Up to 100° around its own opposite-direction Y pivot |
| Drawer | Up to 0.30 m translation along +Z |
| Wear features | Door scratch, upper-right chip, top ring mark |

The runtime renderer can draw a different total triangle count because it also includes the stage, room, guide and repeated shadow passes. The asset specification count and runtime renderer count serve different purposes. Neither should be casually substituted for the other.

The existing closed/open images, rear view, capture-area frames and wear close-ups are authored evidence renders. Room-context images use the original GLB in an authored scene. Decorative room props are illustrative and do not prove a real item's surroundings.

The five generated non-Sora product images from V4 are historical assets. They are not current public catalogue entries and do not acquire 3D assets through this revision. Their original provenance is preserved in the archived documentation.

The asset specification and prior geometry reports remain recoverable in the history below. The quoted baseline hash is an identity contract from the recovered project record. A future change to the GLB must be explicitly recorded and verified rather than silently treated as the same asset.

## V5 claims and technology boundaries

LihatDulu's current deliverable is an interactive frontend product concept with a finished commercial presentation. It demonstrates how a buyer could inspect an item, identify disclosed wear, evaluate a prepared room and understand a seller's photography process.

What the current implementation actually provides:

- A real rendered articulated cabinet model with actual camera movement and independent doors/drawer.
- Linked example condition images and fixed authored wear locations.
- Prepared spatial photography and supplied example image selection.
- Geometric placement, separate opening clearances and saved positions.
- One-product saving, gallery, link sharing and commercial review screens.

What it does not provide:

- A real capture/upload service or physical camera activation.
- Photogrammetry, Gaussian-splat generation, scene segmentation or automatic model reconstruction.
- Camera-based measurement, AI damage grading, automatic condition inference or a new model made from the selected frames.
- Live inventory, seller verification, authentication, real messaging, shipping quotes, banking, payments, confirmed orders or sales.
- A guarantee that a real cabinet fits a real room.

Do not invent processing animations or fake success states to bridge these missing systems. A crafted interactive concept is the explicitly approved fallback. The public interface can focus on customer utility while this internal handoff remains candid about implementation scope.

### Future video context that persists

The original broader project remains a product demo video of about two minutes for a competition/investor pitch. The preferred pacing is fast but smooth, with polished motion and audio inspired by Figma, Claude and OpenAI launches. Most screen time should show 3D inspection. Marketplace context should be brief. The user also asked to show the camera/capture idea at the beginning.

The latest website decision removes physical camera interaction from the judge experience. A future film should therefore show the prepared photography concept and the same cabinet without pretending a working reconstruction pipeline exists. This website revision is not itself a new finished video render.

All reference video URLs, earlier TTS/audio exploration, historical production work, uploaded reference inventory and the original context are retained in the archived pack below. No fresh YouTube playback, TTS provider access or new audio render is claimed by this documentation update.

## V5 verification record

<!-- LIHATDULU_V5_VERIFICATION_START -->

Verification used Node.js 24, Vite production builds and Playwright Chromium with software WebGL on Linux. The record below preserves each executed cohort separately. Its rows overlap in coverage and must not be summed into a fictional clean end-to-end run. Earlier failed assertions remain part of the evidence, while later bounded checks establish the corrected behaviour they exercise.

| Evidence cohort | Observed result | Scope and applicable limit |
| --- | --- | --- |
| Current unit suite | 57 / 57 passed | Strict report/view/placement state, checkout arithmetic, prepared photography state and room presets. Historical storage/capture helpers also remain in the unit suite. |
| Release production build | Passed, 25 transformed modules | Final share-label and review-image CSS changes were included. The rendering engine chunk remained unchanged by those last two UI changes. |
| Baseline route and behaviour suite | 95 / 99 passed | All 72 route-layout cases across eight viewport sizes passed. Four other assertions failed. This baseline preceded later framing, confidence and reduced-motion changes and is not the final release pass count. Evidence: `qa-output/prepared-baseline/results.json`. |
| Affected application suite | 51 / 54 passed | All 24 refreshed prepared-route layout cases and the 12 actual-cabinet framing measurements passed. Actual angle movement, independent storage articulation, condition selection, room presets, touch interaction, reduced motion, model retry and no-input checkout were exercised. Remaining failures involved a saved-confidence case, prepared alias navigation and a page-error guard. Evidence: `qa-output/prepared-final/results.json`. |
| Bounded persistence/navigation recheck | 11 / 12 passed | Unknown saved confidence, stale promoted metadata, prepared selection/reset/undo, aliases and seven code/runtime guards passed. One cross-report scenario timed out awaiting canvas readiness. Its root cause was not established. Evidence: `qa-output/prepared-final-recheck/results.json`. |
| Isolated cross-report diagnostic | 8 / 8 passed | Imported unconfirmed report A remained unconfirmed when selecting confirmed placement B and after reload, using the actual loaded model. Code/source/network guards observed zero media attempts, page/console errors, missing assets or unexpected requests. This passing diagnostic does not explain away the earlier readiness timeout. Evidence: `qa-output/prepared-confidence-diagnostic/results.json`. |
| Compiled production suite before last label/CSS changes | 20 / 20 passed | Compiled direct loads and refreshes, actual rear camera, saved dimension confidence, prepared aliases, no-input delivery totals, saved Sora and code/runtime guards. Evidence: `qa-output/prepared-production/results.json`. |
| Final compiled UI proof after label/CSS changes | 8 / 8 passed | Eighteen decoded review-image elements across 320, 768 and 1440 px had square boxes with zero width/height difference and no horizontal overflow. The supplied 1200 × 1000 px frames retain their intrinsic aspect through contain fitting. Share controls at 320 and 1440 px had an accessible name, usable copy fallback and Escape focus restoration. Final compiled room, photography and checkout routes loaded. Zero observed page errors and camera calls. Evidence: `v5-accessibility-proof.json`. |
| First durable UI and guard run | 8 / 9 passed | Its failed assertion required an unrequested cover-fit mode. Decoded square dimensions and visible layout were independently checked in the compiled proof. The original result is retained at `qa-output/prepared-final-ui/results.json`. |
| Corrected UI attempt before the final bounded run | Interrupted, no completed check | A 320 px subviewport completed before the run was stopped during an unbounded wait. The 768 and 1440 px subviewports, share case and final source-freeze check were not completed. The wait cause was not established, so this is neither a pass nor a confirmed application-fault finding. Evidence: `qa-output/prepared-final-ui-recheck/interrupted.json`. |
| Durable corrected UI and guard checks | 9 / 9 passed | Completed 8 October 2026, 07:59:52 UTC. Decoded square review-image elements at 320, 768 and 1440 px, accessible share/fallback focus, and seven code/runtime guards passed. Source stayed frozen, with zero media attempts, page/console errors, missing assets or unexpected external requests. Evidence: `qa-output/prepared-final-ui-verified/results.json`. |
| Extracted source export candidate | Passed for that candidate | A fresh extracted folder installed with `npm ci --offline` and built successfully. All 35 generated dist files matched the working compiled output byte for byte, all source files and package/lock contents matched, and the 121-entry candidate passed CRC integrity. Final repack verification is separate from this candidate result. |
| Final source export recheck | Passed | A fresh extraction of the final application source built successfully with the unchanged, previously offline-installed lockfile dependencies. All 35 generated production files matched the working dist byte for byte. All 121 ZIP payloads matched the current source, local assets and configuration; CRC, unique safe paths and excluded private/transient directories were checked. Only documentation changed after that build, followed by final repack and payload integrity checks. Evidence: `v5-final-export-build-proof.json` and `v5-release-package-proof.json`. |
| Cabinet asset identity | Matched | Current GLB is 4,702,852 bytes and SHA-256 `18cf94f5d342f9949d5b100bde3968dfc14b1746c3cb47570cf930ab55c9d742`. |
| Documentation preservation | Matched | Source and standalone context copies are byte-identical. The prior 236,424-byte pack retains its exact recorded SHA-256 between the history markers. |

The eight viewport sizes were 320 × 568, 375 × 667, 390 × 844, 412 × 915, 768 × 1024, 1024 × 768, 1440 × 900 and 1920 × 1080. The 24 affected layout cases covered three prepared entrances at each size. The framing checks projected the actual current GLB bounds instead of relying only on screenshot appearance or button state.

An independent reviewer inspected the rendered product and prepared views after the relevant layout corrections. The root agent also inspected the final review screenshots at 320, 768 and 1440 px. Numerical critic ratings and review exchanges are not included in this deliverable.

### Verification limits

This is a combined baseline and targeted regression record. It is not a claim that one uninterrupted full suite passed against the final source. One earlier canvas-readiness timeout remains unexplained despite a successful isolated actual-model recheck. No assertion identifies that observation as either a confirmed application defect or a confirmed harness defect.

Native Safari, physical mobile devices and hardware graphics drivers were not tested. Chromium viewport and injected-touch checks establish the exercised layouts and interactions, not every physical device. The walkthrough does not require camera hardware.

Test report and scratch-proof paths identify retained implementation evidence. The compact source ZIP excludes transient QA output, so these paths are not promises that the reports themselves are bundled. The source test scripts remain available for rerunning applicable checks.

Source/build evidence and the preview release target are separate from publication receipts. This section does not invent a deployment outcome or an export checksum.

<!-- LIHATDULU_V5_VERIFICATION_END -->

## V5 operation and Vercel handoff

The source is a static Vite application using JavaScript modules and Three.js. Its assets and font are served locally. There is no required application backend, API key, environment variable or external media service.

### Commands

Use Node.js 24 or later. The source lockfile determines dependency installation.

```bash
npm ci
npm run dev
```

```bash
npm test
npm run build
npm run test:production
```

`npm run preview` serves the local compiled output for manual inspection. The development and production QA scripts produce machine-readable results and screenshots under `qa-output/prepared/` and `qa-output/prepared-production/`. A test invocation must be interpreted through its actual exit status and generated report.

The browser helper uses Chromium with software WebGL on Linux. `CHROMIUM_PATH` can select a compatible executable. On another operating system, Playwright Chromium may need installation. Those testing prerequisites are separate from normal website operation.

### Export contract

The user expects a ZIP they can use for Vercel. A finished handoff should include a `LihatDulu` source folder, `package.json`, `package-lock.json`, `index.html`, `src/`, required `public/` assets, `vercel.json`, README, licence notices, useful source documentation and prebuilt `dist/`.

Do not export credentials, dependency folders, version-control internals, temporary browser profiles, screenshots of unrelated private data, raw licensed reference packs, transient QA output or stale generated exports. Tests and their scripts may be included as source. A context document is useful, but private critic scores and process transcripts do not belong in it.

Extracting the ZIP must produce a coherent project. Rebuilding the extracted source with its lockfile should recreate the included compiled files unless a documented deterministic-build exception exists. Verify archive CRC/integrity and compare required file contents. Do not call it Vercel-ready merely because `dist` exists.

`vercel.json` uses Vite, `npm run build`, `dist`, and an all-route rewrite to `/index.html`. It also defines `nosniff`, strict-origin referrer policy and frame denial headers. That rewrite is essential for product, room, prepared photography and checkout links entered directly.

To deploy source, extract the `LihatDulu` folder, put its contents in the connected repository or use the Vercel CLI from that folder, and retain the included framework/build/output settings. This description is a handoff instruction. It is not a claim that the original Vercel URL has already been deployed.

### Existing hosted project

The revision should update the existing LihatDulu preview rather than create a duplicate project. Keep the preview's existing audience unless the user explicitly requests a different one. No new public deployment, new account, new paid service or new login is implied by the source ZIP request.

The preview target, source/build verification and original Vercel hosting are separate records. Actual deployment outcomes belong in the release receipt. This pack contains no future deployment claim, write credential or temporary token.

## V5 context authority and continuation

Use this precedence when facts conflict:

1. Latest explicit user instruction and approved decisions.
2. Actual current source and assets.
3. Fresh applicable verification for that source version.
4. This V5 front section.
5. The preserved V4 planning pack and the full V3 history within it.

The following older instructions are superseded:

| Historical instruction or fact | Current rule |
| --- | --- |
| Do not implement until final answers arrive | The user supplied the answers and authorized V5 implementation |
| Default to a six-listing photo-led catalogue | Open straight to Sora and emphasize live inspection |
| Default product media is photos | Default is real model view, with photos secondary |
| Seller starts with an empty listing and physical camera/upload | Seller opens a prepared example without device access |
| Optionally retain a genuine capture branch | The user chose removal from this experience |
| Ask for more photos prominently | Remove that action from the main buyer journey |
| Delivery requires personal form inputs | Use prepared location and an editable review without typing |
| Prove real Gaussian-splat generation | Interactive product concept is sufficient |
| Earlier prototype/simulation labels are mandatory | Normal public flows retain a finished-product presentation with truthful supplied-image labels |
| Old QA counts prove the current release | Only fresh V5 evidence can support current pass claims |

### Continuation checklist

- Preserve the single-cabinet proposition and immediate live model entrance.
- Preserve the current visual identity unless the user asks for a different direction.
- Do not reintroduce camera permission, required uploads, signup or personal-data forms.
- Keep supplied frame selection and authored-model rendering truthful.
- Keep the same cabinet, dimensions and wear features across all views.
- Preserve uncertainty on imported unconfirmed dimensions, including across saving and reload.
- Read current source before relying on older diagrams or module names.
- Inspect actual rendered output and meaningful engine behaviour after a change.
- Keep the Vercel ZIP requirement in scope.
- Update the current section of this pack after implementation or release facts change.
- Preserve the historical appendix as history, without treating its instructions as active authority.

### Material uncertainty

Missing uploads, disappeared scratch paths, unavailable native browsers, unplayed videos, unexecuted tests and unpublished source changes must be stated as unverified rather than reconstructed from imagination. The archived screenshot observations and historical QA records are evidence for their dated versions only.

“Everything” means relevant recoverable project context. It excludes inaccessible messages, unrelated personal information, secret credentials, hidden instructions, fabricated research and invented production history.

## Preserved history boundary

The following archive is the complete prior standalone master context pack, preserved verbatim. It contains the V4 implementation record, the then-proposed V5 revision and its unanswered questions, and the full detailed V3 context appendix. Its descriptions of “current” status are relative to its original drafting date. Use the V5 front section above for active scope, authorization, implementation and fresh verification.

| Preserved archive field | Value |
| --- | --- |
| Original filename | `LihatDulu_MASTER_AI_CONTEXT_2026-10-08.md` |
| Original UTF-8 bytes | 236424 |
| Original SHA-256 | `eb94b7dfa55222f148df59b3bd3fa1b986ccf431f955298ff5eb56cdcb87568a` |
| Preservation method | Exact text between the history start and end markers |
| Active authority | Superseded by this V5 front section where facts or instructions differ |

---

<!-- LIHATDULU_V5_PRESERVED_HISTORY_START -->
# LihatDulu: Master AI Context Pack

## Navigation

Current sections are authoritative. The final link opens the preserved historical appendix.

- [0. Read this first](#0-read-this-first)
- [1. What the user wants](#1-what-the-user-wants)
- [2. Latest feedback and screenshot evidence](#2-latest-feedback-and-screenshot-evidence)
- [3. Current implemented V4 experience](#3-current-implemented-v4-experience)
- [4. Proposed revision: recommended product structure](#4-proposed-revision-recommended-product-structure)
- [5. Proposed first screen and live product media](#5-proposed-first-screen-and-live-product-media)
- [6. Proposed condition inspection](#6-proposed-condition-inspection)
- [7. Proposed prepared camera/capture journey](#7-proposed-prepared-cameracapture-journey)
- [8. Proposed immediate room examples](#8-proposed-immediate-room-examples)
- [9. Proposed commercial finishing flow](#9-proposed-commercial-finishing-flow)
- [10. Suggested judge exploration order](#10-suggested-judge-exploration-order)
- [11. Final open decisions](#11-final-open-decisions)
- [12. Gaussian splatting and truthful technology language](#12-gaussian-splatting-and-truthful-technology-language)
- [13. Current visual system](#13-current-visual-system)
- [14. Current routes and proposed route treatment](#14-current-routes-and-proposed-route-treatment)
- [15. Current source architecture](#15-current-source-architecture)
- [16. Current dependency and operation contracts](#16-current-dependency-and-operation-contracts)
- [17. State, persistence and input safety](#17-state-persistence-and-input-safety)
- [18. Cabinet and evidence contract](#18-cabinet-and-evidence-contract)
- [19. Current asset inventory and provenance](#19-current-asset-inventory-and-provenance)
- [20. Prior V4 review and verified release record](#20-prior-v4-review-and-verified-release-record)
- [21. Proposed next QA and revision loop](#21-proposed-next-qa-and-revision-loop)
- [22. Vercel ZIP and publishing requirements](#22-vercel-zip-and-publishing-requirements)
- [23. File recovery and documentation authority](#23-file-recovery-and-documentation-authority)
- [24. Video project context that remains relevant](#24-video-project-context-that-remains-relevant)
- [25. Business and research boundaries](#25-business-and-research-boundaries)
- [26. Recent conversation chronology](#26-recent-conversation-chronology)
- [27. Material uncertainty and pending work](#27-material-uncertainty-and-pending-work)
- [28. Prompt for the next AI collaborator](#28-prompt-for-the-next-ai-collaborator)
- [29. Historical V3 appendix: explicit warning](#29-historical-v3-appendix-explicit-warning)

## 0. Read this first

| Field | Current value |
| --- | --- |
| Project | LihatDulu |
| Product concept | A furniture buying experience centred on inspecting one item in 3D, its documented condition, and its placement and opening clearance |
| Primary audience | Competition judges and potential investors |
| Interface language | Indonesian |
| Document date | 8 October 2026, Asia/Jakarta |
| Implemented website | V4, package version 4.0.0 |
| Latest requested work | An extensively refined revision plan and this master context document |
| Website change authorization in this turn | None. The user explicitly requested a plan and final clarifying questions before the next revision |
| Proposed next experience | One Sora cabinet; immediate interactive 3D; a prepared capture walkthrough; prepared room examples; no mandatory uploads, permissions or personal details |
| Visual direction | Preserve the V4 appearance that the user likes |
| Latest delivered ZIP | LihatDulu_Vercel_v4.zip |
| Existing private preview | https://lihatdulu.sadsong53.chatgpt.site |
| Original public reference | https://lihatdulu-proto.vercel.app/ |
| Source working directory observed this turn | /workspace/sites/lihatdulu |
| Observed source commit | ff128c93eaac46cd7905383d4e2e6d0d3bf01030 |
| This document | Planning and continuation artifact, not evidence that the proposed revision has been implemented |

This pack consolidates the recoverable project history, current implementation, latest feedback, proposed revision, technical boundaries, source and asset contracts, delivery requirements, QA records, and future video intentions. It preserves the complete earlier V3 context pack in a clearly historical appendix.

“Everything” means all relevant recoverable project context. It does not mean inaccessible messages, missing uploads, unverified video renders, credentials, unrelated user information, hidden instructions, or invented history. A missing artifact is recorded as missing.

### Authority and precedence

Use this order when facts disagree:

1. The latest explicit user request and subsequent answers.
2. Observed current source and assets.
3. Fresh, applicable verification evidence for that version.
4. The current sections of this document.
5. Earlier plans and the historical V3 appendix.

The proposed revision below is a recommendation awaiting the user's answers. It must not be mistaken for an implemented or fully approved V5.

The historical appendix contains obsolete statements about no actual camera capture, no checkout, required two entrances, and prototype/simulation labels. Those were accurate or intended in earlier versions. Current V4 source and the latest user requirements supersede them. Do not copy its old continuation prompt into a new agent without the current instructions above.

### Fast continuation checklist

- Confirm whether the next user message authorizes implementation or only adjusts this plan.
- Preserve the current visual identity.
- Read the current main, inspection, seller, media-store and geometry modules.
- Keep the same cabinet across every view and journey.
- Distinguish an authored GLB from a Gaussian-splat reconstruction.
- Make judge exploration work without uploading, typing, camera permission, signup or measuring a room.
- Ask only about material open decisions.
- Validate the actual rendered experience, not just source or build success.
- Deliver a clean Vercel-ready ZIP after any authorized website revision.
- Update this pack after an authorized implementation; do not quietly leave proposed behavior marked as implemented.

## 1. What the user wants

The user likes the redesigned V4 visuals and considers them significantly better than the original. Their objection concerns interaction friction and emphasis.

They want a website that looks like a finished commercial product while remaining effortless to explore as a competition entry. Judges should not need to own furniture, photograph something, supply personal information or prepare data before understanding the idea.

The key selling point is 3D inspection. A one-cabinet showcase is sufficient. Other furniture listings currently have no 3D model and dilute that proposition.

The product page should show the live object immediately. Judges should be able to inspect several angles directly on that page.

The user questions the prominent request for more photographs. The proposed value is richer visual inspection, so asking for extra photos should not dominate the buying journey.

The user also wants the camera/capture idea represented. In the competition experience, that should be a prepared walkthrough using Sora, rather than an obligation to supply real photographs.

Their desired standard is a polished product experience comparable in craft to Figma, Claude and OpenAI product demonstrations. This is an aspirational reference, not a claim of independently measured equivalence.

### Explicit requirements that persist

- Finished commercial presentation.
- Indonesian customer-facing language.
- Strong, restrained motion design.
- Clear product utility rather than a pitch deck embedded in the interface.
- Responsive desktop, tablet and phone layouts.
- No overlapping controls or inaccessible actions.
- No customer-facing “Prototype”, “Prototipe”, “Demo” or “Simulasi” banners.
- No machine-facing implementation explanations in ordinary product flows.
- No em dashes in customer-facing copy.
- No generic key-takeaway boxes or AI-style explanatory clutter.
- No fabricated reviews, verified-seller badges, real inventory, successful orders or payment confirmations.
- Existing access only. No new account setup or API keys required from the user.
- User should not have to build, debug or supply creative production work.
- A Vercel-ready ZIP remains a required website handoff.
- Rigorous review and revision, including an independent critic when available.
- Ratings and critique exchanges stay outside the finished website and ordinary deliverable copy.
- Disclose material unresolved verification limits briefly.
- Latest scope is planning and context creation. Do not change or deploy the website yet.

### Current success definition for the proposed revision

A first-time judge opens the link and immediately sees the cabinet stage and understands that 3D inspection is the primary experience. A matching poster and honest loading feedback remain until the real model is ready. Within a short exploration, they can rotate it, open storage, inspect wear, try a prepared room and see how a seller would document it, without preparation.

This should feel like a deliberately curated product, not a marketplace with missing stock or an empty account. The single cabinet is the complete example of the service's value.

The experience should stand on its own if someone skips the capture story or does not follow a guided sequence.

## 2. Latest feedback and screenshot evidence

Two uploaded screenshots were successfully inspected during this planning turn:

| Upload | Observed content |
| --- | --- |
| image(20261008-062330).png | Large static cabinet gallery, an open-door/open-drawer image, four photo thumbnails, price Rp2.450.000, Jakarta Selatan, dimensions, a green “Pilih barang” CTA, and a prominent “Minta foto tambahan” CTA |
| image(20261008-062430).png | Catalogue card with cabinet photo, heart control, “Lihat dalam 3D” badge, Sora title, price, location, condition, and “6 barang” context |

The first screenshot confirms that the initial product media is a photo gallery. The “3D” promise is not the immediate product experience.

The second confirms that only one listing visibly advertises 3D while the surrounding catalogue suggests six products. A judge can therefore spend time browsing items that do not demonstrate the central idea.

Earlier attachment failure notices in the conversation do not describe the current access result. The two PNG files were present and read successfully this turn.

The screenshot paths observed this turn are:

- /workspace/scratch/8e3729c50eb3/upload/image(20261008-062330).png
- /workspace/scratch/8e3729c50eb3/upload/image(20261008-062430).png

Temporary workspace paths can later disappear. Do not treat their absence as intentional deletion by the user.

## 3. Current implemented V4 experience

### Buyer and marketplace

V4 is a photo-led furniture marketplace. Its initial catalogue contains six authored listings. Search, category selection, price filters, sorting, saved items and product pages work in the frontend.

Sora is the only item with an authored interactive 3D asset. The other five listings have their own generated product images and authored descriptions, dimensions, locations and prices.

On Sora's product page, the default tab is photos. Condition, room and guide tabs mount the live inspection engine.

The product sidebar contains price, city, dimensions, material, condition, pickup/delivery copy, a purchase CTA and an additional-photo request CTA.

The additional-photo action prepares a copyable request. It does not send a message to a seller.

The gallery remembers the selected image while switching tabs in the same browsing session.

### 3D inspection

The engine loads the authored cabinet GLB with Three.js. It supports orbiting, camera presets, independent door movement, drawer extension, condition anchors, dimensions, room placement and an authored capture scene.

The current condition UI has linked example close-up images for a scratch, chip and ring mark.

Motion sliders currently expose left door, right door and drawer values. “Buka semua” and “Tutup semua” are available.

The model has stable part and pivot IDs. Cosmetic condition points move with the correct moving part.

### Room

Room controls accept dimensions and object placement. Rotation, fixtures, separate body/door/drawer outcomes, save, reload, reset and undo are implemented.

Room outcomes are based on geometry and explicit dimension confidence. Unconfirmed imported dimensions must remain uncertain; they cannot produce an unqualified positive fit result.

Authored Sora dimensions are confirmed for the default showcase report. Imported or saved reports can carry different confidence.

### Seller

The current selling path creates an empty draft.

Its five stages are:

1. Barang: name, category, price, location and description.
2. Foto: device camera or file uploads for five photo areas.
3. Kondisi: manual condition notes.
4. Ukuran: dimensions and explicit confirmation.
5. Tinjau: review and save.

The current default is functional but puts preparation work on judges. This is the principal friction addressed by the proposed revision.

Original JPEG, PNG and WebP bytes are preserved. Photographs and drafts remain local to the browser and origin. There is no server upload or reconstruction.

Exact duplicate original bytes cannot be assigned to different areas. Retaking the same area is allowed.

Camera permission is only relevant to the real camera branch. Browser QA used a controlled test camera, not a physical phone camera.

### Checkout

The current checkout provides pickup or delivery and payment-method selection. Pickup is the default and does not require delivery details.

Choosing delivery reveals required name, phone, address and city fields. This optional delivery branch adds friction for a judge.

The next screen is an editable order review. It does not place an order or process a payment. Returning to the product remains possible.

### Publication and handoff

The website was delivered as LihatDulu_Vercel_v4.zip and published as an owner-private preview at https://lihatdulu.sadsong53.chatgpt.site.

The original public Vercel reference was not overwritten.

There are no required environment variables, production accounts, API keys or server services for the static package.

## 4. Proposed revision: recommended product structure

### Recommendation

Use one polished Sora product page as the default entrance. Make live 3D its main media. Retain a light commercial shell, practical purchase facts, saving, sharing and checkout review.

Offer a prepared capture walkthrough as a secondary destination. Judges can enter and finish it without files, permissions or typing.

Use prepared room examples for immediate room experimentation, with custom measurements available as an optional advanced branch.

This concentrates effort on the actual differentiator and removes preparation friction.

### Alternatives considered

| Approach | Advantage | Cost | Recommendation |
| --- | --- | --- | --- |
| Direct Sora product entry | Immediate 3D value and fastest judge exploration | Less breadth of marketplace discovery | Recommended |
| Compact one-item storefront first | Preserves a familiar marketplace entrance | Adds a click before the main value | Acceptable if the user prefers it |
| Guided presentation as the default entrance | Can control narrative order | Delays free use and can feel like a presentation | Keep as optional, not default |

The user has not yet selected the final entrance. The direct product recommendation should be confirmed by the final questions.

### What to keep

- Plus Jakarta Sans.
- Off-white background, forest green actions, warm cabinet materials.
- Existing product name, price, city and physical dimensions.
- Existing authored GLB, moving hierarchy and condition images.
- Calm visual density, clear spacing and practical commerce facts.
- Saving, sharing, room checks and checkout review where they support the main experience.
- Current strict validation and original-photo handling in the optional real branch.
- Legacy report URL compatibility.

### What to remove from the main competition experience

- Five non-3D furniture listings.
- Related-products sections that point to those listings.
- Multi-category browsing, sorting and price filtering when only one item remains.
- Broad search implying a larger active catalogue.
- “6 barang” and other stale item counts.
- Additional-photo request as a prominent buyer action.
- Empty seller-form entrance.
- Required uploads, real camera permission, personal details or room dimensions in the default journey.
- Long explanatory panels, repeated advice, dead ends and controls with no meaningful purpose.

Removing a public listing does not require deleting its original source image or provenance record. Archive or retain those assets privately where useful. Do not relabel a photo-only product as a 3D item.

## 5. Proposed first screen and live product media

### Desktop composition

Retain a clean commercial header. Use the product name and compact save/share actions above a generous media-and-facts composition.

The left/main column contains the live Sora cabinet. The right column contains price, location, dimensions, concise material/condition information, room action and purchase action.

Avoid a marketing hero before the product. A visitor should encounter the cabinet itself immediately.

The stage begins with an attractive three-quarter view. It is genuinely interactive once loaded. A matching poster fills the same region while assets load.

The stage, angle buttons, opening actions and condition toggle form one coherent product media area. They should not feel like a separate laboratory embedded below a photo gallery.

### Phone composition

Use a shorter header, product identity, the cabinet stage and nearby angle/opening actions. Keep the stage and first useful interaction in the first viewport at the primary phone sizes.

At 320 × 568, prioritize readable controls and a useful cabinet view. The entire purchase card does not have to fit simultaneously. Product facts can follow in normal vertical scrolling.

Do not shrink text, disable zoom or hide important controls to satisfy a screenshot. Do not let a fixed purchase footer cover the viewer, controls, focused input or dialog.

Avoid nested scrolling as the default browsing experience. If a bounded tool sheet is necessary, keep its boundaries and close action obvious.

### Immediate controls

Proposed labels:

- Depan
- Samping
- Belakang
- Atas
- Dalam
- Pintu kiri
- Pintu kanan
- Laci
- Detail kondisi
- Atur ulang tampilan

A “Samping” action may expose left/right choices if that is clearer than placing six angle buttons at once.

Each angle action must change the actual camera. It must not merely substitute a static render.

“Dalam” may open doors to reveal the interior. That state change should be clear and predictable. Ordinary angle changes should preserve the user's door/drawer state unless a specifically labelled interior preset intentionally changes it.

Simple opening toggles should be the default. Detailed degree/centimetre sliders can remain under an expanded control.

The visitor can orbit and zoom freely. Tap/click and keyboard controls provide alternatives to gestures.

### Motion

Use short, purposeful camera easing for angle changes and condition focus. Initial guidance can use one brief reveal or a very small camera movement, then stop.

Continuous auto-rotation is not recommended. It competes with inspection and can make a judge feel they are watching instead of using the product.

Manual input must immediately interrupt automatic camera movement. Reduced-motion settings disable ornamental movement and shorten or remove camera travel.

Preserve the same engine instance when switching inspection tools where practical. Do not reload the 4.7 MB model every time a condition or angle changes.

No autoplay audio in the website.

## 6. Proposed condition inspection

Replace the additional-photo request emphasis with inspection of the existing evidence.

Condition hotspots on the live object reveal:

1. Goresan pintu kiri.
2. Sudut terkelupas.
3. Bekas pada permukaan atas.

Selecting a hotspot or matching condition item moves the camera to the relevant location and exposes a close-up image and concise note.

The model and evidence should remain spatially connected. On desktop a compact detail panel can sit beside the stage. On phones a well-bounded sheet or panel should keep a clear return to the model.

Do not force a separate tab jump followed by manual scrolling to rediscover the object.

The close-up images remain useful. A reconstructed visual view and focused condition evidence serve different purposes. Removing “ask for photos” does not require removing existing evidence.

Prepared evidence describes authored example wear. It is not an AI diagnosis or a verified seller inspection.

Condition labels should be factual and specific. Avoid quality grades, confidence percentages or “AI verified” claims without an implemented and evaluated system.

## 7. Proposed prepared camera/capture journey

### Purpose

Show how a seller documents the cabinet and how that documentation becomes inspectable to a buyer. Judges experience the journey without supplying an item.

### Entrance

Keep a clear commercial label such as “Cara foto barang” or “Siapkan tampilan barang”.

Open directly on a prepared Sora example. A small “Contoh: Lemari Sora” label communicates the supplied example at the point it matters, without covering the whole website in prototype terminology.

“Contoh” here identifies the prepared content. It does not create a broad “demo mode” banner or imply that judges must configure a new mode.

### Sequence

A recommended short path:

1. Sora is already placed in the capture scene.
2. The visitor chooses or advances through outside angles and can use a shutter-style control on the prepared example.
3. Each prepared shutter action reveals the supplied matching frame, a concise frame counter or checkmark, and reversible retake feedback. This is clearly an example-frame interaction, not a claim that a physical camera took the image.
4. Open doors and drawer to see interior documentation.
5. Inspect the prepared close-up condition frames.
6. Review the cabinet's prepared dimensions and notes.
7. Open the same finished product in the live buyer view.

The whole path should be optional. Include direct area navigation and “Lihat barang” so a judge can move freely.

Use manual advancement or an interruptible brief playback. Do not force a long countdown or unskippable processing animation.

Target approximately 30 to 60 seconds for the prepared capture story, with immediate jumps available. This is a design target, not measured performance.

### Prepared data

The name, price, location, description, angles, dimensions and condition notes are supplied.

No required text input, measurement checkbox or upload can block the prepared path.

Prepared photos must depict the same Sora cabinet and its actual pose. Reuse existing authored angle renders and generate any missing example render from the approved cabinet if implementation requires it.

Do not secretly inject prepared photographs into genuine uploaded drafts.

### Truthful outcome

Opening the prepared result loads the existing authored model and evidence.

Do not announce “Your photos have been reconstructed”, “AI scan complete” or a fake reconstruction percentage. No such pipeline currently exists.

Appropriate copy can say “Buka hasil contoh” or “Lihat barang” at the transition.

A short visual transition may reveal how documentation connects to the inspectable product. It must not claim that a processing task actually ran.

### Optional genuine branch

Recommendation: retain real camera/upload as a discreet optional action such as “Gunakan barang sendiri”, outside the main prepared path.

A judge who stays on the main path should never see a permission prompt.

If the real branch is entered, it preserves the existing honest scope: photos and notes can be captured and saved locally; they do not become a reconstructed 3D item.

If that branch creates confusing expectations, it can be removed from the competition navigation while the source remains preserved. This is a final clarifying decision.

### Restart and persistence

Prepared-example state must be separate from personal drafts.

Provide “Mulai lagi” or a contextual reset for the prepared path. It restores only the supplied example.

It must never delete real photos, user drafts, favourites or room saves without a specifically authorized separate action.

A fresh first visit should not land halfway through the story. A return visit should have an obvious way to resume or restart.

## 8. Proposed immediate room examples

A judge should not have to measure their room before discovering this feature.

Offer two or three prepared room scenarios with visible dimensions:

- A spacious placement where the cabinet body fits and storage can open.
- A constrained placement where the body fits but an opening is obstructed.
- A contrasting layout or position that shows the practical effect of rotation or movement.

Use product-facing room names such as “Ruang keluarga”, “Sudut kerja” and “Ruang sempit” only where the visual arrangement supports them.

The exact preset parameters must be computed and verified against the existing geometry functions during implementation. Do not choose arbitrary room numbers and hardcode success messages.

Each preset updates the actual model, room and independently calculated outcomes:

- Badan furnitur.
- Bukaan pintu.
- Bukaan laci.

The visitor can move or rotate Sora to resolve a collision. Feedback should match the displayed geometry.

Keep custom room dimensions as an optional “Ubah ukuran ruang” action. Preserve measurement confidence and units.

Provide reset and undo near the active controls.

These are authored room examples, not AR placement, a real room scan, structural approval or a guarantee of real-world fit.

## 9. Proposed commercial finishing flow

Retain price, location, dimensions, condition and pickup/delivery choices. These establish the marketplace context around the 3D proposition.

The main page can prioritize “Coba di ruang” near the media and retain “Pilih barang” in the commerce region. Final emphasis should be resolved through rendered layout review.

For checkout:

- Default to pickup, which already avoids personal-detail entry.
- If a delivery example is shown, supply a clearly example address or permit a no-entry prepared review path.
- Never require a real phone number or address for the competition experience.
- Keep shipping arithmetic correct.
- End at an editable review screen.
- Do not display a payment-success or submitted-order state.
- Avoid a dead “Pay” action if payment is out of scope.

Current authored price is Rp2.450.000. Current delivery fee is Rp150.000. Delivery total is Rp2.600.000; pickup total is Rp2.450.000.

A prepared address must not represent a real person's contact details. Prefer a non-identifying example where needed.

The website remains a frontend showcase; no backend expansion is required for this revision.

## 10. Suggested judge exploration order

This is a planning target for attention and discoverability. It is not a required guided sequence.

| Approximate time | Experience | Intended understanding |
| --- | --- | --- |
| First 5 seconds | Cabinet and interactive controls visible immediately | This is a 3D buying experience |
| 5 to 20 seconds | Rotate to several angles; open a door or drawer | Object exploration is genuine frontend interaction |
| 20 to 40 seconds | Select one condition point and linked close-up | Condition information has spatial context |
| 40 to 70 seconds | Try clear and obstructed room examples; adjust position | Fit includes usable opening space |
| 70 to 110 seconds | Optional prepared capture walkthrough | Seller documentation connects to buyer inspection |
| Final optional exploration | Pickup/delivery and review | The idea fits a commercial buying flow |

A judge can also start with capture or jump directly to room. The site should not rely on this exact order to be understandable.

## 11. Final open decisions

The following are material questions for the user. Routine typography, button spacing, animation duration and engineering choices can be resolved independently.

### Question 1: Default entrance

Should the link open straight on Sora's live 3D product page, or on a compact single-item storefront?

Recommendation: direct Sora page. This gives the central value immediately.

### Question 2: Real camera/upload branch

Should real capture/upload remain available as a discreet optional branch, or be removed from the competition navigation entirely?

Recommendation: preserve it outside the prepared main journey. Judge use stays frictionless while existing functional work remains accessible.

### Question 3: Technology proof requirement

Does the competition require an actual Gaussian-splat asset or functioning photo-to-3D reconstruction, or is a polished interactive concept sufficient?

Recommendation for this revision: use the proven current interactive model and present its scope accurately. A literal reconstruction requirement changes the asset, renderer, capture, evidence and performance work substantially.

Do not silently assume that an authored mesh satisfies a requirement for an actual reconstructed splat. Conversely, do not expand this revision into a new reconstruction backend if the competition only needs the product concept.

## 12. Gaussian splatting and truthful technology language

The current Sora runtime is an authored polygonal GLB rendered through Three.js GLTFLoader. It is not a Gaussian-splat asset or renderer.

The original 3D Gaussian Splatting research constructs a radiance-field representation from calibrated multi-view data and renders novel views. Its purpose supports rich visual exploration of captured scenes. It is not, by itself, a system for verifying hidden defects, mechanically articulating furniture parts or producing guaranteed physical measurements.

A surface not adequately captured cannot be treated as inspected merely because a viewer can rotate the object. This is the practical reason to retain prepared close-up condition evidence and honest coverage information.

For this project:

- “Tampilan 3D interaktif” is accurate.
- “Periksa bentuk dan detail kondisi” is accurate for the supplied model/evidence.
- “Rekonstruksi Gaussian splatting yang sudah berjalan” is not accurate.
- “AI mendeteksi semua kerusakan” is not accurate.
- “Ukuran otomatis dari scan” is not accurate.
- Door and drawer movement demonstrates an authored mechanical model, not proof that splatting recovered motion.

If a real splat is later required, the plan should separately verify capture provenance, reconstruction method, asset licence, renderer compatibility, mobile performance, condition resolution, and how articulated interiors relate to the static capture.

Do not substitute a mesh-to-point visual effect and call it a real photographic reconstruction.

Primary technical reference checked during this planning turn:

https://repo-sam.inria.fr/fungraph/3d-gaussian-splatting/

Paper: Bernhard Kerbl, Georgios Kopanas, Thomas Leimkühler and George Drettakis, “3D Gaussian Splatting for Real-Time Radiance Field Rendering”, ACM Transactions on Graphics, 2023.

The primary page describes multi-view capture, camera calibration, Gaussian optimization and novel-view rendering. Its reported benchmark frame rates are not performance claims for this website.

## 13. Current visual system

The user likes V4. Do not restart visual design.

| Token or element | Current value |
| --- | --- |
| Font | Self-hosted variable Plus Jakarta Sans |
| Font weight range | 200 to 800 |
| Canvas | #fafaf8 |
| Main ink | #242923 |
| Muted text | #687068 |
| Forest action | #173f32 |
| Forest hover | #24533f |
| Divider | #dee3dc |
| Soft panel | #eef4ee |
| Media background | #f0f1ed |
| Danger | #973f31 |
| Base radius | 12 px |
| Body | 16 px, line height 1.5 |
| Base H1 | 36 px, line height 1.22, weight 600 |
| Base H2 | 22 px, line height 1.36, weight 600 |
| Base buttons | 48 px minimum height |
| Main desktop page | 1440 px maximum width, 40 px gutters |
| Wide desktop adjustment | Larger max width above the wide-screen breakpoint |

These values were checked against current CSS. Historical design-system documents can describe older tokens.

### Proposed typography treatment

Keep the same font and restrained hierarchy. Use the item name as the primary heading, price as a clear commercial anchor and concise labels for controls.

Do not introduce oversized pitch copy, gradient text, decorative quote blocks, icon-filled benefit cards, fake endorsements or excessive uppercase microcopy.

Use Indonesian conventions for currency and dimensions. Keep degrees, centimetres and metres explicit where controls need them.

Use short natural customer instructions. Prefer an actual action such as “Putar barang” or “Buka laci” to an explanation of how the software works.

Preserve ordinary breathing room, subtle boundaries and warm media lighting.

### Design resources already installed and used

- Taste: https://github.com/Leonxlnx/taste-skill
- Vercel web-design-guidelines: https://github.com/vercel-labs/agent-skills/tree/main/skills/web-design-guidelines
- Awesome Design MD: https://github.com/voltagent/awesome-design-md
- Playwright CLI: https://github.com/microsoft/playwright-cli

The combined installed resource router is design-taste-frontend. It includes the upstream Taste guidance, Vercel guidance, selected Awesome Design MD references and official Playwright CLI instructions.

Taste's marketing rules do not automatically apply to dense product controls or forms. Use its restraint and composition where relevant.

Vercel's current web-interface checklist was fetched during this planning turn:

https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md

No complete fresh implementation audit against every checklist rule is claimed for this planning-only turn.

## 14. Current routes and proposed route treatment

| Current route | Implemented V4 behavior | Proposed treatment |
| --- | --- | --- |
| / | Six-item marketplace | Direct Sora product entry, subject to answer |
| /platform | Catalogue alias | Match the simplified public entrance |
| /barang/sora | Photo-first Sora product | Live 3D default |
| /barang/sora?tab=condition | Live condition inspection | Preserve deep link; integrate with default viewer |
| /barang/sora?tab=room | Room controls | Prepared room example first |
| /barang/sora?tab=guide | Spatial photography guide | Prepared capture journey |
| /barang/arca, /barang/nara, /barang/rimba, /barang/batu, /barang/lino | Photo-only products | Remove from public discovery; decide safe legacy handling |
| /tersimpan | Saved listings | Support Sora naturally without stale counts |
| /jual and /buat | Empty personal selling flow | Prepared Sora walkthrough first; optional genuine branch |
| /barang-saya | Device-local drafts | Optional genuine branch; do not confuse seeded examples with personal records |
| /checkout/sora | Pickup/delivery choices | No compulsory personal data |
| /checkout/sora/tinjau | Editable review | Preserve honest endpoint |
| /tentang | Concise commercial explanation | Update single-product/capture wording if necessary |
| /laporan with #r snapshot | Legacy report entry | Preserve validated report behavior |
| /studio | Legacy entry mapped to Sora condition | Preserve safe compatibility; no old extra entrance requirement |
| /ruang | Legacy entry mapped to room | Preserve safe compatibility |

The exact new route names are routine engineering decisions. Preserve meaningful existing links and direct refresh support.

Removing five public listings should not leave related cards, stale filters, search placeholder promises, broken favourite references or empty legacy paths. Review all these surfaces together.

## 15. Current source architecture

The current project uses Vite, JavaScript modules, CSS and Three.js. It is not React, Next.js or a backend application.

### Major files

| File | Current role |
| --- | --- |
| src/main.js | App routing, catalogue/product/gallery/checkout UI, global dialogs, favourites, clipboard, keyboard tabs, renderer teardown and purchase-dock visibility |
| src/style.css | Commercial shell, catalogue, gallery, product facts, checkout, dialogs and responsive layouts |
| src/catalogue.js | Six authored listings, prices, dimensions, photos, formatting and filtering |
| src/shop-state.js | Checkout arithmetic, safe delivery selection and favourite normalization |
| src/inspection.js | Live inspection UI, evidence, motion, room controls, capture guide, snapshots and dimension confidence |
| src/inspection.css | Inspection layout, stage, tool panels, evidence, room and guide presentation |
| src/engine.js | Three.js asset loading, camera control, articulation, condition anchors, room rendering and geometry results |
| src/geometry.js | Cabinet dimensions, collision geometry, transforms and motion-clearance checks |
| src/capture-scene.js | Authored room/phone/capture illustration and phases |
| src/seller.js | Genuine camera/upload flow, five-step forms, local draft lifecycle, review and original downloads |
| src/seller.css | Seller forms, workspace, photo cards, review and storage warnings |
| src/media-store.js | Original Blob validation, exact-byte duplicate checking, IndexedDB drafts and memory fallback |
| src/state.js | Strict report URL, room, placement and legacy local-record validation |
| src/viewer-state.js | Bounded camera/motion/room/session schemas and persistence |
| src/capture.js | Older prepared report-capture and workspace contracts retained for compatibility |
| src/studio.js | Retained historical studio controller/template contract and tests |
| src/mobile.js | Historical mobile workspace/viewport support |
| src/ui.js, src/data.js, src/capture-ui.js | Retained earlier view/data/capture helpers |
| package.json | Version, dependency and command authority |
| vercel.json | Vite build, static output, SPA rewrites and basic response headers |
| public/assets/ | Runtime cabinet GLB and metadata |
| public/images/ | Cabinet angles, condition renders, room imagery and catalogue photographs |
| public/fonts/ | Self-hosted font and licence |
| scripts/ | Browser verification and authored render helpers |
| tests/ | Current unit checks and retained browser specifications |
| docs/ | Historical plans/contracts, provenance and previous context |

Some historical modules are retained but no longer provide the primary V4 route controller. Do not infer current screen behavior from old templates alone.

### Live engine API

createEngine returns these operations:

| Operation | Role |
| --- | --- |
| setView | Move to a supported camera preset |
| selectCondition | Focus and select a known authored wear point |
| setStorage | Set combined storage-opening presentation |
| setMotion | Adjust an individual door or the drawer |
| setCaptureScene | Enter/update the authored camera guide |
| leaveCaptureScene | Leave the authored camera guide |
| captureViewState | Return a validated persistable scene snapshot |
| restoreViewState | Restore a bounded scene snapshot |
| zoomBy | Apply a bounded zoom action |
| capturePlacementPreview | Render a bounded saved-placement thumbnail |
| setDimensionsVisible | Show or hide physical dimension annotations |
| enterRoom | Enter the authored room scene |
| leaveRoom | Return to item inspection |
| setRoom | Update validated room dimensions and placement |
| setFixture | Apply a supported obstruction scenario |
| resetCamera | Recover the camera without deleting other state |
| getState | Inspect a copied current scene state |
| dispose | Release the engine, event handlers and rendering resources |

Engine callbacks include onCondition, onPlacement, onInteraction and onLoadProgress. Guard late callbacks with the current route/render token. A route teardown should dispose the renderer; a tool change should preserve it when practical.

The engine also exposes model, manifest, report, camera, controls, scene and renderer references for integration and verification. These are local implementation surfaces, not a remote API or a security boundary. Never store secrets there.

### Media-store exports

PHOTO_AREAS, makeId, createDraft, validatePhoto, validateDimensions, assignPhoto, assignUniquePhoto, saveDraft, getDrafts, getDraft and deleteDraft are the current original-photo store operations.

Use assignUniquePhoto when accepting an actual new photo. assignPhoto alone checks identity but does not perform the cross-angle byte comparison. Do not regress this distinction while adding a prepared example.

### Recommended implementation ownership if approved

1. Main route/shell and catalogue simplification.
2. Inspection stage and unified angle/opening/condition controls.
3. Prepared capture state and example content.
4. Prepared room scenarios and geometry validation.
5. No-entry checkout path and commercial finishing.
6. Responsive, accessibility, persistence and package verification.

Keep shared state contracts explicit. If parallel workers are used later, assign separate source modules and integrate through the controller.

Avoid unrelated framework migration or wholesale refactoring. The current stack already supports the requested experience.

## 16. Current dependency and operation contracts

Package name: lihatdulu. Version: 4.0.0. Module type: ES modules.

| Dependency | Declared version |
| --- | --- |
| @fontsource-variable/plus-jakarta-sans | ^5.3.0 |
| @playwright/test | ^1.63.0 |
| three | ^0.186.1 |
| vite | ^8.3.2 |
| @sparticuz/chromium | ^153.0.0, development dependency |

Preserve package-lock.json. Versions here describe the current checked source, not a recommendation to upgrade.

README recommends Node.js 24 or later.

### Commands

~~~bash
npm ci
npm run dev
npm run build
npm run preview
npm run test:unit
npm run test:redesign
npm run test:production
npm test
~~~

- Development and preview servers bind to 127.0.0.1.
- Build output is dist.
- npm test runs unit checks and integrated redesign/browser checks.
- QA_OUTPUT can change the browser suite output directory.
- CHROMIUM_PATH can select an existing compatible test browser.
- On macOS or Windows, install the test browser with npx playwright install chromium as described in README.
- Do not confuse successful build output with successful interaction or layout QA.

Vercel configuration sets framework vite, npm run build, dist and a catch-all rewrite to index.html.

Do not add runtime secrets to the client. This revision does not require environment variables.

## 17. State, persistence and input safety

### Favourites

Local-storage key: lihatdulu:favourites:v2.

Only known listing IDs are accepted. Values are deduplicated and bounded to 100.

The proposed single-item revision must normalize old saved IDs without pretending removed listings are visible stock.

### Legacy local state keys

| Purpose | Key |
| --- | --- |
| Draft report | lihatdulu:draft:v1 |
| Saved reports | lihatdulu:saved:v1 |
| Placements | lihatdulu:placements:v1 |
| Workspace | lihatdulu:workspace:v1 |
| Viewer sessions | lihatdulu:viewer:v1 |
| Inspection room confidence | lihatdulu:inspection:room-report:v1 |

clearLocalData clears the legacy state keys. It does not automatically clear the newer favourites or IndexedDB photo drafts. Do not use it as a universal “restart example” action.

Prepared-example state needs a distinct namespace or explicit in-memory session so resetting it cannot destroy personal data.

### Report schemas

Schema 1 has schema, asset, name, note and views.

Schema 2 adds conditionNotes and dimensionsConfirmed.

Report asset identity is cabinet-01-v1. Runtime asset manifest identity is oak-cabinet-01. These IDs serve different contracts; do not substitute one for the other.

Validation bounds include:

- Name up to 80 characters.
- Report note up to 1200 characters.
- Known views only, up to nine.
- Known conditions only, up to three.
- Condition note up to 600 characters.
- Report bytes up to 9000.
- Encoded snapshot up to 12000 characters.
- Canonical UTF-8 and base64url handling.
- Strict object keys and finite values.

A report snapshot is encoded in the URL hash as #r=....

A shared report link does not upload photo originals to a server. It does not create a live cloud listing or revocable account record.

### Room and placement validation

Room bounds:

- Width 1.2 to 10 metres.
- Depth 1 to 10 metres.
- X and Z positions from -10 to 10 metres.
- Rotation from -180 to 180 degrees.
- Fixture enum: clear, door, drawer or wall.

Saved placements are bounded to 20 and retain validated report, room and ISO saved timestamp.

Optional rendered WebP placement preview is bounded to 400 × 300 and 100000 encoded characters. The independent fit summary retains three booleans when confidence supports them.

Unknown dimension confidence must remain unknown through save, reload, undo and reset.

### Viewer sessions

Current inspection session identifiers include inspection-sora-condition, inspection-sora-room and inspection-sora-guide inside the legacy viewer envelope.

Camera, target, supported preset, selected condition, door/drawer values, dimensions visibility, room state and capture-scene state are validated.

Do not restore malformed or nonfinite state into the engine.

### Original-photo drafts

IndexedDB database: lihatdulu-photo-drafts.

Database version: 1.

Store: drafts, with id as key path.

Memory fallback uses Symbol.for('lihatdulu.media.memory').

Draft schema fields:

- schema
- id
- name
- category
- price
- location
- description
- photos
- skipped
- conditions
- dimensions
- dimensionsConfirmed
- phase
- status
- createdAt
- updatedAt

Photo areas: front, rear, side, interior and detail.

Accepted originals: JPEG, PNG and WebP, up to 20 MB and up to 80 million decoded pixels.

Dimension inputs accept 1 to 1000 cm.

Photo duplicate validation compares actual original Blob bytes across areas, rather than just filename or superficial identifiers.

Saving returns draft, persistent and reason. Quota/unavailable storage uses memory fallback with truthful warnings and recovery actions.

All customer text must be escaped before insertion into HTML. Prepared content does not excuse weakening the input validation in the optional real branch.

## 18. Cabinet and evidence contract

### Physical model

| Fact | Value |
| --- | --- |
| Name | Lemari Sora |
| Closed width | 90 cm |
| Closed depth | 47.5 cm, including front hardware |
| Height | 120 cm |
| Doors | Two independently articulated doors |
| Maximum door angle | 100 degrees each |
| Drawer travel | 30 cm |
| Units | Metres in the runtime model |
| Axes | X width, Y up, +Z front |
| Runtime manifest ID | oak-cabinet-01 |
| Report asset ID | cabinet-01-v1 |
| Mesh count | 31 |
| Triangle count | 27,503 |
| Runtime GLB bytes | 4,702,852 |
| Runtime GLB SHA256 | 18cf94f5d342f9949d5b100bde3968dfc14b1746c3cb47570cf930ab55c9d742 |

The asset is authored geometry, not a photogrammetric capture of a real seller item.

Preserve left_door_pivot, right_door_pivot and drawer_slide. Their local motion differs:

- Left door rotates around Y toward -100 degrees.
- Right door rotates around Y toward +100 degrees.
- Drawer translates along +Z from 0 to 0.3 m.

Do not stretch the cabinet for room fitting, change its dimensions to force a result or visually decouple moving parts from evidence anchors.

### Authored cosmetic evidence

| ID | Location | Example dimensions |
| --- | --- | --- |
| scratch | Left door surface | 110 × 1 mm |
| chip | Upper front-right edge | 8 × 5 × 1 mm |
| mark | Top surface ring | 55 mm diameter |

These are authored visible examples. They are not detected from uploaded photographs.

The condition close-ups are useful evidence for the interactive example, but they do not establish a real inspection service.

### Model construction history

The cabinet was made through parametric CadQuery source and exported with authored geometry and materials. The source retains cabinet and room STEP/GLB files, construction spec and reproduction scripts.

Existing hardware is presentation geometry. It is not a fabrication-ready hinge or runner specification, structural calculation, load rating or manufacturing approval.

### Geometry limits

Current room checks use conservative geometric collision approximations. Door motion boxes are sampled around one-degree increments; drawer movement is sampled around five-millimetre increments.

A result concerns the model and supplied room geometry. It does not account for every real obstruction, wall irregularity, moving person, assembly tolerance or measurement error.

## 19. Current asset inventory and provenance

Runtime assets include:

- Cabinet GLB and its manifest/report JSON.
- Cabinet closed and open overall views.
- Front, front-left, front-right, left, right, rear, top, underside, interior and drawer documentation renders.
- Scratch, chip and ring-mark close-ups.
- Authored room hero/detail images.
- Authored phone/capture scene preview.
- Self-hosted Plus Jakarta Sans.
- Five generated photographs for the non-3D catalogue listings.

### Important images

| Image | Purpose |
| --- | --- |
| cabinet-closed.webp | Loading poster and initial product image |
| cabinet-open.webp | Doors/drawer open view |
| capture-rear.webp | Rear view |
| capture-front.webp and side/angle variants | Prepared capture evidence |
| capture-interior.webp | Interior evidence |
| capture-drawer.webp | Drawer evidence |
| capture-underside.webp | Underside evidence |
| wear-scratch.webp | Left-door scratch close-up |
| wear-chip.webp | Upper-edge chip close-up |
| wear-mark.webp | Top ring-mark close-up |
| room-cabinet-hero.webp | Authored warm room context |
| room-cabinet-detail.webp | Authored room detail |
| studio-capture-scene.webp | Authored phone and cabinet capture illustration |

The prepared images must not be presented as photographs newly taken by the visitor.

The cabinet light-wood texture came from a user-supplied texture. Available provenance does not establish complete legal certification of every original reference asset.

Generated catalogue images are original authored showcase imagery. Their prompts/provenance are in docs/catalogue-assets.md. Removing them from public discovery does not change their historical role.

Original Mobbin/Turo/Envato packages and source screenshots are references. Do not redistribute them in the public website ZIP. The runtime phone prop is independently authored rather than copied PSD pixels.

Three.js and Vite use MIT licences. Plus Jakarta Sans uses SIL Open Font License. Preserve included notices.

## 20. Prior V4 review and verified release record

These are records from the completed V4 run, not new implementation checks performed for the proposed revision.

### Source and archive checks

- 53 unit tests passed in the source checkout.
- 53 unit tests passed again from the clean extracted distribution.
- A clean extracted install and production build succeeded.
- All 35 prebuilt dist files matched the rebuilt extracted project.
- The archive contained 110 unique entries beneath one LihatDulu root.
- ZIP CRC and safe path checks passed.
- Source, assets, prebuilt website, package lock and Vercel configuration were included.
- node_modules, Git internals, credentials, environment files and private review records were excluded.

### Browser checks

The integrated V4 evidence totals 97 passing checks across a full run and one targeted harness recheck.

The frozen full run had 96 of 97 passing checks. The remaining assertion concerned native modal focus crossing into browser chrome and was overly strict. A targeted recheck corrected the harness without changing the app.

Do not describe this as a second complete matrix rerun. The final record combines 96 prior passes with the targeted passing recheck.

The viewport matrix was:

| Width | Height |
| ---: | ---: |
| 320 | 568 |
| 375 | 667 |
| 390 | 844 |
| 412 | 915 |
| 768 | 1024 |
| 1024 | 768 |
| 1440 | 900 |
| 1920 | 1080 |

The suite included 72 route-by-viewport checks, plus interaction and state cases.

Checks covered:

- Search, filters and sorting.
- Saved items and reload.
- Gallery selection and tab focus.
- Independent doors and drawer.
- Condition evidence.
- Room persistence, confidence and collisions.
- Capture guide.
- Checkout.
- Clipboard readback.
- Original photo bytes.
- Controlled test camera capture and track cleanup.
- Draft save/reload.
- Exact duplicate rejection.
- Long inputs.
- CSS zoom at 200 percent.
- Reduced motion.
- No unexpected page/console errors, broken assets or external backend requests.

CSS zoom tests do not certify every physical OS/browser zoom combination.

### Compiled production evidence retained in the current source

qa-output/production-results.json records a passing run finished at 2026-10-08T00:36:28.049Z.

It contains ten direct-route/refresh checks at width 390, plus unknown-dimension persistence and favourite storage checks.

Recorded arrays for errors, missing resources and external requests are empty.

This file is current V4 evidence. In contrast, previews/verification.json and the 31 older preview screenshots describe V3.

### Independent review

Independent critics actually reviewed V4 source and rendered behavior. A first round found concrete issues. The implementation fixed them and a second review found no blocking defect under the agreed criteria.

Private numeric ratings and critique exchanges are intentionally not reproduced here.

### Significant issues fixed before V4 delivery

- Unknown saved dimension confidence had incorrectly allowed positive room-fit messaging.
- The same original photo could count as multiple angles.
- Gallery choice was lost after switching tabs.
- Tab activation could lose focus.
- The mobile purchase dock covered inspection content.
- Selecting mobile condition evidence could move an offscreen model without revealing it.
- Save-button accessible labels were stale.
- The guide tab had incorrect accessibility state.
- A drafts route wrapper could accidentally mount the empty seller form.
- Chair-image cropping, global-city copy and long search text needed correction.
- Generic seller advice clutter was removed.
- Distribution checks needed portable paths and correct runtime prerequisites.
- Texture provenance language was corrected.

These past fixes matter because the next simplification can regress them.

### Verification limits

- Physical phone cameras were not tested.
- Mobile Safari was not tested.
- Hardware GPU/driver combinations were not certified.
- Controlled camera tests are not proof of a real phone camera session.
- The private deployment succeeded, but this planning turn does not claim a fresh native cloud-browser UI examination.
- No backend transaction or reconstruction tests exist because those features are not implemented.
- No new website QA is claimed merely because this plan is detailed.

## 21. Proposed next QA and revision loop

The user requires a demanding review-and-revision loop, with up to four rounds. Apply it to the actual revised website if implementation is authorized.

### Step 1: Freeze success criteria

Confirm the three material choices. Define a default judge journey requiring zero uploads, zero permissions, zero mandatory text input and zero account setup.

Record which paths are prepared and which remain genuine local-photo workflows.

### Step 2: Build a complete first attempt

Complete the main product, capture, room and review paths before asking the user to approve a partial shell.

Do not report completion after only a visually attractive homepage.

### Step 3: Review actual output

Use an independent critic when available. The critic should inspect rendered desktop and mobile pages and operate controls.

Compare the actual result to the brief, not to an imagined implementation.

### Step 4: Score privately

Use 0 to 10 for:

- Task fulfillment.
- Correctness.
- Completeness.
- Clarity and usability.
- Presentation and execution quality.

Each score needs observable evidence and remaining defects. A 5 requires substantial revision; 7 has clear weaknesses; 8.5 is strong with minor issues; 10 requires exceptional supporting evidence.

Do not raise a score just to stop. Keep numeric ratings out of the finished product.

### Step 5: Fix by impact

1. Wrong technology or transaction claims.
2. Mandatory judge setup and missing required journeys.
3. Broken controls, geometry, persistence and navigation.
4. Overlap, hidden actions and phone scrolling problems.
5. Visual hierarchy, camera easing and small copy details.

### Step 6: Recheck affected areas

Repeat affected interaction and layout checks after a fix. Broaden testing if changes cross shared contracts or introduce new uncertainty.

Stop when every applicable dimension is at least 8.5 and there are no known critical errors or unmet explicit requirements, or after four concrete revision rounds. Disclose material remaining limitations.

### Concrete acceptance checklist for the revised experience

| Area | Required observable result |
| --- | --- |
| Initial view | Stage and matching poster are visible without navigation; real controls become operable after verified model loading, with honest loading/retry states |
| Judge friction | Main path has no required uploads, permissions, account, contact fields or room measurements |
| Angles | All visible angle buttons change the actual model camera |
| Articulation | Left/right doors and drawer can be operated independently |
| Condition | Each selected wear point corresponds to the correct location and supplied image |
| Evidence navigation | Model and detail can be reached without disorienting scroll jumps |
| Single item | No non-3D distractions, stale counts or meaningless broad filters |
| Capture | Prepared story works start-to-finish with supplied Sora content |
| Truth | No fake reconstruction task, diagnosis, payment or submitted order |
| Rooms | Clear and obstructed presets match actual independent geometry results |
| Confidence | Unconfirmed measurements never become a guaranteed positive fit |
| State | Back, refresh, resume and restart are predictable |
| Data safety | Example reset never removes personal photos or unrelated saved state |
| Mobile | Orbit does not trap normal page scrolling; controls remain visible and reachable |
| Accessibility | Keyboard alternatives, focus, names, pressed/selected states and announcements work |
| Motion | Reduced motion is honoured; manual input cancels camera movement |
| Loading | Matching poster prevents a blank page or layout jump |
| Failure | Model/WebGL failure leaves useful images/facts and an obvious retry |
| Checkout | Pickup and prepared delivery review require no real personal details |
| Package | Clean extracted install/build/direct refresh succeeds with included local assets |

### Responsive and interaction test matrix

Retain the eight-size V4 baseline and test both portrait and relevant landscape layouts. Include desktop mouse, phone touch emulation, keyboard navigation and 200 percent zoom.

Test a short phone height, software-keyboard viewport shrink if real forms remain, long text, blocked storage, missing model and reload with malformed stored state.

Physical phone and Safari verification should be reported separately if available. Do not imply emulation covers them.

### Performance

- Do not mount multiple cabinet renderers unnecessarily.
- Reuse the engine across tool changes.
- Load the essential asset early enough for the immediate viewer.
- Keep a matching poster while loading.
- Stop rendering work after teardown or when the relevant scene is inactive.
- Cap pixel ratio when appropriate.
- Avoid importing unnecessary photo-only product assets into the initial path.
- Do not promise a numeric first-load or frame-rate target without measuring the actual deployment and device conditions.

## 22. Vercel ZIP and publishing requirements

The user explicitly expects a ZIP suitable for Vercel after website work.

### Existing V4 archive

| Field | Recorded value |
| --- | --- |
| Filename | LihatDulu_Vercel_v4.zip |
| Size | 12,642,264 bytes |
| Entries | 110 unique entries |
| Root folder | LihatDulu |
| SHA256 | 5dc640cecf460d4d0de85bf619fae14b77ffef060d1476c4010c11da291ff59e |
| Persistent availability | Saved successfully; exact filename and size were resolved again this planning turn |
| Current package version | 4.0.0 |

The archive was not regenerated in this planning turn.

Its original temporary download path can expire. Recover by the exact filename or from the synced source; do not assume a broken temporary link means the file was never saved.

### Next archive when approved

Include:

- Full current application source.
- All required runtime assets and font.
- package.json and package-lock.json.
- index.html.
- vercel.json.
- Current prebuilt dist.
- Accurate README.
- Asset/dependency licence notices.
- Appropriate reproducible checks.

Exclude:

- node_modules.
- Git metadata and credentials.
- Environment files or tokens.
- Native private hosting identity.
- Private numeric reviews and critique exchanges.
- Uploaded licensed reference kits.
- Unused large raw model source unless requested.
- Old screenshots or docs falsely suggesting they verify the new version.

Validate safe paths, CRC, unique entries, extracted npm ci, production build, direct routes/refresh and required local assets.

Do not announce a successful Vercel deployment unless one actually happens. Providing a Vercel-ready package is a different outcome.

### Native private preview continuity

Current project ID:

appgprj_6ac6dc3dbaac8191bc7848094fd00da7

Current source commit:

ff128c93eaac46cd7905383d4e2e6d0d3bf01030

Last successful deployment ID:

appgdep_6ac6e94700848191808fbadcfa3404db

Last published version ID:

appgprj_6ac6dc3dbaac8191bc7848094fd00da7~appgver_5cd02a141f50819191e3a75b5224c6cb

These identify the existing project. Reuse it if an authorized revision is published. Do not create a duplicate site.

Publishing access should remain unchanged unless the user requests it. A private preview must not be assumed accessible to judges. The intended competition handoff is a public Vercel deployment or other user-approved public access.

Do not place credentials in this document, client source or archive. Short-lived repository credentials must be freshly obtained through the official workflow when needed.

## 23. File recovery and documentation authority

### Available this turn

- Current source checkout.
- Current README/package/configuration.
- Authored cabinet and evidence assets.
- Historical docs including the complete V3 master.
- Current compiled production-results JSON.
- Two current uploaded feedback screenshots.
- Exact V4 archive metadata.

### Missing or not freshly recoverable

- Scratch video/audio production artifacts.
- Full prior assistant messages absent from the recoverable conversation.
- Any actual rendered final two-minute film.
- Verified voiceover or music masters.
- Complete original business research and numerical market assumptions.
- Some older attachment packages and original licensing records.

### Important historical documentation

| Document | Use | Caution |
| --- | --- | --- |
| docs/MASTER_AI_CONTEXT.md | Detailed V3 history and contracts | Superseded as current context; preserved below |
| docs/mobile-exploration-revision.md | V3 phone/free-exploration rationale | Does not dictate current V4 shell |
| docs/v3-engine-contract.md | Engine/session contracts | Confirm against actual source |
| docs/capture-implementation.md | Older report/workspace capture | Genuine V4 photo flow now uses seller/media-store |
| docs/capture-engine.md | Authored phone/cabinet scene | Does not prove real reconstruction |
| docs/design-system.md | Historical consumer design tokens | Current CSS supersedes outdated values |
| docs/asset-provenance.md | Cabinet/room/phone image provenance | Some old simulation wording remains historical |
| docs/catalogue-assets.md | Five generated catalogue images | Those images are proposed to leave public discovery |
| docs/release-verification.md | Historical V2 release | Not fresh V4 evidence |
| docs/final-review.md | Earlier bounded review | Not fresh V4 evidence |
| previews/verification.json | V3 preview record | Dated 3 October 2026 |
| qa-output/production-results.json | Current V4 compiled smoke | Dated 8 October 2026 |
| model-source/ | Parametric construction and exports | Do not run a fresh asset replacement casually |

Workspace recovery should use the synced source project or saved archive. Do not scan unrelated projects or treat unrelated files as LihatDulu inputs.

## 24. Video project context that remains relevant

The original broader request was a roughly two-minute competition/investor product-demo video made entirely by the assistant.

The user wants most of the video devoted to 3D exploration, with a smaller marketplace portion.

They later noticed the capture-camera journey was missing and requested that the demo start with capturing the cabinet before showing inspection and room use.

They want polished motion and audio design, a fast but smooth rhythm, and an output suitable for YouTube.

### User reference videos

- https://www.youtube.com/watch?v=Cx2dkpBxst8
- https://www.youtube.com/watch?v=SCS1rsCxKkw
- https://www.youtube.com/watch?v=t_LBECIQQqs
- https://www.youtube.com/watch?v=YeeGHCixr7o

The user characterized the desired style as Claude, Figma and OpenAI product demos. Exact video titles and a fresh shot-by-shot viewing are not verified in this planning turn.

The user previously authorized watching through the cloud browser and taking screenshots to avoid expensive extra production work. Do not claim that this turn rewatched the videos.

### Requested production qualities

- Product-led, not long pitch-deck text.
- Smooth camera movement and clear click/action continuity.
- Strong framing and no overlaps.
- Clear motion hierarchy.
- Sound effects supporting actions.
- Tasteful music and narration if available.
- Existing access only.
- No new accounts, API-key work or manual user contribution.
- Repeated visual and audio QA.
- User wants assistant ownership of the full creative and technical workflow.

### TTS and audio

The user asked whether Gemini TTS or other methods could be used.

No confirmed Gemini TTS credential or finished Gemini voiceover is recoverable. Do not promise it without checking actual available access.

An AI voice-generation connector, InVideo audio/media capabilities and Remotion/video skills are available in the current tool environment. Availability does not prove successful generation, licensing, export or suitability for Indonesian narration.

For future video production:

1. Inspect available voice tools and supported language/voice controls.
2. Produce a short pronunciation/cadence test before the full narration.
3. Verify names, Indonesian phrases, cabinet terms and currency.
4. Use properly licensed music/sound assets and retain provenance.
5. Keep narration intelligible over music.
6. Check clipping, transitions and export duration.
7. Review actual rendered frames and listen to the actual audio.
8. Do not create a fake product claim through editing.

No MP4, WebM, WAV or MP3 is currently present in the source project. No finished film or audio master is delivered by this planning turn.

### Relationship to the website revision

The website should first provide a coherent hands-on journey. A later video can then use the same prepared Sora capture, 3D inspection, condition and room states.

Do not mix preparation for a future film with the current plan-only website authorization.

A tentative two-minute structure, subject to a later video brief:

- Opening problem through product action, very brief.
- Prepared cabinet capture story.
- Reveal the buyer's live cabinet.
- Orbit and independent opening.
- Condition close-up.
- Room clearance example.
- Brief commercial selection/review.
- Clean brand ending.

This is a proposed sequence, not a completed storyboard or render.

## 25. Business and research boundaries

The earlier project explored consumer uncertainty, product condition, secondary-data research and an Indonesian business-plan competition.

Those discussions led from refurbished-device condition uncertainty toward furniture capture and spatial inspection.

Potential benefits are hypotheses:

- Better visual understanding.
- More specific condition information.
- Less effort requesting missing views.
- More confidence about dimensions and opening space.
- Better seller documentation.

The prototype does not establish demand, willingness to pay, fraud reduction, conversion improvement, scan accuracy or market size.

Do not invent TAM/SAM/SOM, resale rates, revenue, users, customers, investors or validated partnerships.

Possible revenue models in historical material are unvalidated proposals, not active pricing.

The cabinet price is showcase inventory content, not evidence of real stock or a completed transaction.

The interface can look commercial without fabricated business proof.

## 26. Recent conversation chronology

The recoverable recent sequence, in order:

1. User asked for a fully assistant-produced demo video and mentioned repos such as “ultrademo”.
2. User supplied the original Vercel website and requested planning only.
3. User supplied four YouTube references.
4. User allowed cloud-browser viewing/screenshots.
5. User emphasized smooth, fast-paced Claude/Figma/OpenAI-like product demos.
6. User requested inspection of the actual LihatDulu website and a roughly two-minute demo weighted toward 3D.
7. User asked whether simulation buttons could enable motion capture.
8. User requested an extensively refined tool-based production plan and TTS exploration.
9. User chose competition/investor audience, recommended defaults, and existing access only.
10. User required a rigorous review-and-revision loop.
11. User criticized overlaps and useless presentation elements and requested a large QA run.
12. User identified missing camera capture and asked for a capture-first narrative plus marketplace explanation.
13. User shifted focus to improving the website's commercial appearance.
14. User requested installation/use of Taste, Vercel guidelines, Awesome Design MD and Playwright CLI.
15. User rejected machine-facing copy, prototype labels, em dashes, takeaway boxes and AI self-explanations.
16. User approved recommended visual/product choices and clarified that real backend functionality was unnecessary.
17. User required support across device sizes.
18. User authorized the website build and repeated the rigorous QA loop.
19. User clarified that a Vercel-ready ZIP was expected.
20. User asked to continue if they had interrupted work.
21. V4 redesign, independent review, fixes, QA, ZIP and private preview were completed.
22. User praised the visuals but identified actual input/upload requirements as unsuitable for judges.
23. User explicitly requested thoughts with no changes.
24. User supplied two screenshots.
25. User now requests an extensively refined single-cabinet, immediate-3D, judge-friendly revision plan and final clarifying questions.
26. User simultaneously requests a super-detailed master AI context Markdown file.
27. This turn produces the plan and document, with read-only source/screenshot review and independent planning criticism. No website implementation is authorized yet.

The complete much earlier V1/V2/V3 history is preserved in the appendix.

## 27. Material uncertainty and pending work

### Known and verified this planning turn

- The user likes the current visuals.
- Default Sora product view is photos.
- More-photo action is prominent.
- Seller path starts empty.
- There are six authored listings and only Sora has 3D.
- Real local camera/upload exists.
- No reconstruction or payment backend exists.
- Current renderer uses a GLB.
- Two screenshots were inspected.
- Source is still at the recorded V4 commit.
- A prior V3 master exists and was audited for preservation.
- V4 archive metadata was resolved.
- Current compiled smoke record exists.
- No website source changes were needed to draft this plan.

### Unverified or not yet decided

- Whether the user wants direct product entry or a one-item storefront.
- Whether real camera/upload remains in competition navigation.
- Whether the competition requires literal Gaussian-splat/reconstruction proof.
- The exact future room-preset parameters.
- Actual user comprehension times.
- Future revised performance on physical phones and Safari.
- A public judge-accessible deployment.
- Any finished video/audio output.

### Work explicitly deferred until approval

- Route/controller changes.
- Catalogue removal from the public experience.
- Main-stage redesign.
- Prepared capture implementation.
- Room preset implementation.
- Checkout simplification.
- New rendered QA and revision rounds.
- New website ZIP.
- Updating or publishing the existing site.

## 28. Prompt for the next AI collaborator

> Continue LihatDulu from the current V4 website. First read the current sections of LihatDulu_MASTER_AI_CONTEXT_2026-10-08.md, then inspect current source and README. The latest user likes the visuals and wants an effortless competition experience with one Sora cabinet and immediately visible 3D. Do not start implementation until the user approves the revision plan or explicitly asks you to proceed. Recommended next structure: direct live Sora product page, simple angle and independent door/drawer controls, linked condition evidence, one-click room examples, optional prepared capture walkthrough with supplied data, and checkout review requiring no real personal details. Remove non-3D product distractions and the prominent request for extra photos. Preserve Plus Jakarta Sans, the off-white/forest/warm-wood visual identity, cabinet dimensions and moving hierarchy, strict validation, legacy report links, measurement confidence, input escaping, original-photo bytes, reduced motion and graceful 3D fallback. Current technology is an authored Three.js GLB; no Gaussian-splat asset, automatic reconstruction, AI damage detection, production seller accounts, real orders or payments exist. Make prepared example content clear at its point of use without broad prototype/demo banners. Keep genuine personal drafts separate from prepared example state and never delete photos when restarting the example. After authorized implementation, inspect actual desktop and phone output, use independent critique, fix substantive issues, run appropriate current checks, verify a clean extracted build, update documentation and deliver a Vercel-ready ZIP. Do not claim historical tests verify new code or invent market proof. Ask only material open questions; resolve routine design choices independently. The historical V3 appendix contains obsolete instructions and is background only.

## 29. Historical V3 appendix: explicit warning

The following earlier master context is preserved in full to avoid losing prior business exploration, reference inventory, CAD details, schemas, V1/V2/V3 decisions and verification records.

It is dated 3 October 2026 and describes V3. It is not the current product brief.

In particular, these historical claims are superseded:

| Historical V3 statement | Current authority |
| --- | --- |
| No real camera/upload | V4 supports original local photos and controlled-camera-tested capture |
| No checkout | V4 has checkout and editable review, without payment/order submission |
| Two main entrances must survive | Latest proposal prioritizes a single live Sora product entrance |
| Simulation/prototype labels are required | Latest user rejects broad customer-facing prototype/demo/simulation labels |
| No external publication | V4 has a successful owner-private preview |
| Gallery-first buyer report | Latest proposal makes live 3D the default |
| No marketplace | V4 added a showcase marketplace; latest proposal simplifies it to Sora |
| Old design tokens are current | Current V4 CSS tokens above supersede them |
| V3 test counts are latest | V4 verification record above is newer |
| Old next-agent prompt is authoritative | Use the new continuation prompt above |

Preserved historical text follows. Any “current” wording below means current at V3's date, not today.

---

# LihatDulu Master AI Context Pack

## Document identity and reading instructions

| Field | Value |
| --- | --- |
| Project | LihatDulu |
| Purpose | Indonesian interactive consumer prototype for a business-plan competition |
| Revision | V3 mobile workspace and direct free exploration, following the v2 capture-to-buyer redesign |
| Context date | 3 October 2026 |
| Principal deliverable | `LihatDulu_Vercel_v3.zip`, a Vercel-ready source ZIP with a prebuilt static website |
| Companion deliverable | `LihatDulu_MASTER_AI_CONTEXT_v3.md`, the same complete context as the ZIP copy |
| Previous packages | `LihatDulu_Vercel_v2.zip`, then `LihatDulu_Vercel.zip` |
| Previous model package | `3D_Furniture_Models.zip` |
| Working repository root | The folder containing `package.json`, `vercel.json`, and this `docs/` directory |
| Authoritative product facts | Final source, cabinet manifests, tested behavior, and the user decisions recorded below |

This document gives a future AI collaborator enough context to continue the project without reconstructing the entire conversation. It records the available user-visible history, product intent, assumptions, model facts, references, interfaces, operational instructions, and evidence boundaries. It does not claim to contain inaccessible attachments or every earlier assistant answer. When an earlier answer or research result cannot be recovered, this document identifies that gap instead of inventing a replacement.

Read this document in this order when continuing work:

1. Read **Current objective and scope**, **Current v3 revision: mobile workspace and direct exploration**, and **Decisions that must survive future revisions**.
2. Read the seller, buyer, and studio journeys before proposing new screens.
3. Read **What actually works and what remains a simulation** before describing product capabilities.
4. Inspect `src/` and `package.json` before changing technical contracts or running commands.
5. Read the final verification record and known limits before claiming a defect or a completed fix.
6. Consult the historical documents only for rationale. The final implementation can supersede an old plan.
7. Preserve the original cabinet dimensions, moving hierarchy, evidence IDs, and legacy report-link behavior unless the user explicitly requests a change.

This pack covers the project, not unrelated user biography. It excludes credentials, private account information, inaccessible messages, hidden instructions, and unrelated files. The context should help a collaborator explain and modify LihatDulu accurately. It should never serve as evidence that a market assumption, AI model, scan accuracy, or business outcome has already been validated.

## Current objective and scope

The user approved the v3 revision after reporting that the otherwise well-received v2 prototype required too much up-and-down scrolling on a phone to reach the model and Next action. They also requested a freely navigable 3D experience for people who do not want the repeated Next sequence. The approved scope is a mobile interaction redesign, complete direct free exploration, mode continuity, shorter capture review, saved-placement previews, touch guidance, quick demonstrations and reset/undo. The current deliverables are a revised Vercel ZIP and updated detailed master context. Routine design gaps may be resolved with judgment.

V2 supplied the professional consumer redesign, complete seller capture journey, deeper platform states, clearer buyer report and studio that starts with a cabinet in a room and a phone capturing it. That design remains the visual and product foundation. V3 improves how visitors operate it, particularly on phones; it does not replace the cabinet or turn the static competition demonstration into a reconstruction service.

The website demonstrates the proposed service through interaction. A seller starts a furniture report, follows a guided sample capture, reviews evidence and missing areas, confirms dimensions and condition notes, then shares a report. A buyer opens the report, inspects the item and its authored wear, tries it in a configurable room, checks opening clearance, and saves the result. The alternate studio entrance explains that same journey through animated cameras, a generic phone prop, prepared evidence, and interactive controls.

The competition requires a business plan, not a deployed reconstruction service. The website therefore uses one invented but realistic cabinet, authored model geometry, and rendered documentation imagery. It offers genuine frontend interactions and sample data persistence. It does not reconstruct an actual object from the visitor's camera, upload their photographs, diagnose defects, authenticate a seller, operate a marketplace, collect payments, or store reports on a backend.

The visible product language remains Indonesian. The repository and handoff documentation use English where that improves implementation clarity. LihatDulu is a working business name. No trademark, company-name, domain-availability, incorporation, or legal clearance claim accompanies it.

The interface should feel like a consumer product. The site should not resemble a pitch deck with long problem explanations. Business research, implementation theory, pricing hypotheses, and market arguments belong in separate competition materials. The prototype should let judges understand the proposed experience by using it.

## Current v3 revision: mobile workspace and direct exploration

### Revision status and evidence authority

V3 is version `3.0.0`. Its source changes implement the user-approved brief in `docs/mobile-exploration-revision.md`. This section describes the agreed behavior and technical handoff. **Fresh final integrated verification passed.** Archive integrity is recorded in the release verification table and the final packaging record. Historical v2 pass counts, screenshot filenames, build sizes and archive file counts below describe v2 only.

| Record | Current status | Meaning |
| --- | --- | --- |
| User approval | Granted | “Sounds good, proceed and revise” authorizes this implementation |
| Source version | `3.0.0` | Same Vite/Three.js foundation; no new production service |
| Approved scope | Mobile and free-exploration revision | Interaction changes, state continuity, preview/feedback improvements |
| Cabinet/assets | Preserved | No fresh CadQuery model, Mitsuba evidence regeneration or new inventory claim |
| V3 integrated test/build run | Passed |43 unit tests,28 browser/geometry checks and a production build |
| V3 final screenshots/production smoke | Passed |31 regenerated screenshots; seven production routes plus mobile workflows; zero recorded errors |
| V3 archive integrity/counts | Final packaging record | CRC/readback, exact asset and master comparisons are recorded below |
| External publication | Not requested | Provide a Vercel-ready ZIP, not an asserted deployed account |

The working copy was separated from v2 before changing runtime files. This preserves the previous package and makes regression comparison possible. Parallel workers own isolated source modules, while the application controller integrates them. This is an implementation workflow detail, not a user-facing product feature.

### Why vertical mobile usability required a revision

The v2 phone layout successfully wrapped content and avoided horizontal page overflow, but the model, explanatory chapter content and Next action could occupy a taller area than the visible phone screen. Visitors had to move repeatedly between the scene and the navigation. A width-only check could pass while that interaction remained uncomfortable.

V3 treats the studio, room and capture camera as active workspaces rather than long document pages. The active workspace keeps the scene, essential current controls and primary action near one another. It does not merely hide page overflow while placing actions beyond reach. Detail-heavy content belongs in a sheet or a bounded panel; preparation and review content can scroll internally with a persistent action dock. The ordinary home, workspace grids, buyer gallery and saved-list pages retain document scrolling when it supports browsing.

The target portrait sizes are 320 × 568, 375 × 667, 390 × 844 and 412 × 915 CSS pixels. The smallest target may need a smaller scene, a full-view control or a bounded control panel. Text should remain readable, button targets should remain usable and important meaning should not be removed solely to make a screenshot fit. Desktop still gets a spacious model/panel composition.

The layout breakpoint for these dedicated workspaces is at or below 760 px. It is a layout rule, not a claim that every device below that width is a phone. Browser chrome, keyboard appearance and changes to the visual viewport can alter usable height. `--app-height` follows `visualViewport.height` where available, with `innerHeight` fallback, so the workspace responds to the visible viewport rather than a fixed screenshot height.

### Mobile shell metadata and structure

The controller assigns `body.dataset.layout` as `studio`, `room`, `capture` or `default` before rendering the current route. Capture adds `body.dataset.capturePhase` as `prepare`, `capture`, `review` or `ready`. Keyboard/viewport state uses `body.dataset.keyboard`. `body.dataset.studioTool` selects larger room/opening control areas without changing report evidence. These metadata values are presentation state; they do not validate a report or affect evidence coverage.

`src/mobile.js` owns viewport handling and workspace metadata. The CSS uses the special layout only within the mobile breakpoint. A compact `.mobile-workspace-header` replaces the global header in active studio/room/capture views. It should retain useful back/context controls without consuming the space of the full desktop header. The desktop global navigation remains appropriate for wider pages.

Studio and room have a persistent scene and a compact control area. Capture recording has a compact camera illustration and its action dock. Capture prepare/review/ready use `.capture-content` for internal scrolling as necessary. The primary action remains in `.capture-action-dock`. Review input focus and keyboard appearance must not leave the focused field or action trapped behind a footer. Safe-area padding should keep controls away from device-edge gesture areas where CSS supports it.

A template refresh for a tool, tab or chapter should update the panel, not dispose the Three.js canvas. Route changes still dispose the old engine. This distinction avoids reloading a 4.7 MB model and losing the visitor's orientation whenever they switch controls. `#stage`, `#studio-panel` and `#chapter-title` remain stable integration anchors.

### Two modes with a full direct entrance

The studio supports `guided` and `free` as explicit modes. The homepage still has the platform and studio as its two large areas. Within the studio entrance, the visitor can follow the story or explore immediately. Direct free exploration is not buried behind a first guide step, a later chapter or a hidden orbit gesture.

`/studio?mode=free` opens free exploration directly. `/studio?mode=guided` selects the guided story. Either can carry `#r=<snapshot>` with the same validated report. Explicit mode queries should take precedence over a persisted mode when entering through a named link. A normal return to the studio can resume its local session. Invalid/unsupported mode text must normalize to a supported state; it should not become arbitrary HTML or script.

Free exploration removes compulsory Next navigation and exposes five tools. The visible names remain Indonesian, while code uses bounded IDs:

| Tool ID | Visitor task | Relevant controls/evidence |
| --- | --- | --- |
| `model` | Inspect the overall shape | Orbit, front/side/rear/interior presets, zoom and camera reset |
| `condition` | Inspect observable authored wear | Scratch/chip/ring choices, correct model close-up, linked evidence photo and note |
| `opening` | Understand independent storage movement | Left door, right door and full drawer sliders with meaningful units |
| `size` | Inspect authored closed dimensions | Dimension overlay, 90 × 47.5 × 120 cm values and confirmation context |
| `room` | Test illustrative placement | Room size/position/fixture tabs, results, save, reset and undo |

The guide keeps ten chapters and one previous/next pair. Visitors may use a chapter picker for direct navigation. A detail control can reveal longer explanation without putting it between the scene and the primary action. Guide content remains a demonstration of the input-to-report story. It should not expand into a pitch-deck explanation of the market, business model or technology stack.

“Free” in this revision means unrestricted navigation within the demonstration. It does not establish production pricing, a freemium tier, unlimited real scans, account entitlement, or a validated commercial plan. All demonstration routes are currently available without a paid account.

### Explicit mode changes and independent continuity

Orbiting, panning, dragging a cabinet or touching a scene does not select a new mode. `onInteraction` can cancel a moving guide camera and trigger persistence, but it must not set `free=true` as v2 did for some inspection chapters. Mode change happens through `data-mode="guided"` or `data-mode="free"` controls.

Before changing mode or leaving the route, the controller captures the relevant mode's scene state. Returning to that mode restores its own camera, target, selected condition, opening pose, dimension visibility and appropriate room/capture context. Guided and free snapshots are independent. A visitor can try a drawer in free exploration, follow a guide chapter, then return to their free setup rather than receiving a freshly reset model.

The viewer session also records bounded navigation context: mode, chapter, selected tool, room tab, illustrative capture area and the area IDs tried in the studio. Session state is keyed to the report context so separate reports do not casually share one last-used room or condition selection. It does not change the report snapshot, seller capture statuses or coverage declared by a shared URL.

The underlying report remains the source of buyer evidence. The studio's **Contoh 7 area / Contoh 9 area** comparison is a temporary teaching view. It must never write additional views into an imported report, a share link or a seller capture session. Reload/state-resume tests must include a report that genuinely has fewer areas so cosmetic demos cannot erase this distinction.

The exact viewer schema is implemented in `src/viewer-state.js` and detailed in `docs/v3-engine-contract.md`. Callers must use its validators rather than re-implement permissive copies. `validateViewState`, `validateViewerSession`, `loadViewerSession`, `saveViewerSession`, `CAMERA_VIEWS`, `VIEWER_TOOLS` and `ROOM_TABS` are exported.

A valid scene snapshot has these exact fields:

```json
{
  "schema": 1,
  "camera": { "position": [2, 2, 3], "target": [0, 0.65, 0] },
  "view": "overview",
  "condition": null,
  "motions": { "left": 0, "right": 0, "drawer": 0 },
  "dimensionsVisible": false,
  "inRoom": false,
  "roomState": { "width": 3.2, "depth": 3, "x": 0, "z": -0.4, "rotation": 0, "fixture": "clear" },
  "captureScene": { "active": false, "phase": "prepare", "area": "front", "progress": 0 }
}
```

All nested fields are exact. Unknown/missing fields, sparse arrays, unsupported enums and nonfinite numbers are rejected. Camera vectors contain three finite values in −30..30; camera/target distance is 0.065..12 m with a small boundary tolerance. Orbit target radius is bounded to18m, so long pan gestures stay within persistable camera bounds. Door values are 0..100 degrees, drawer 0..0.3 m. Room bounds are width 1.2..10 m, depth 1..10 m, x/z −10..10 m, rotation −180..180 degrees and fixture clear/door/drawer/wall. The active capture composition cannot simultaneously be in the editable room, display dimensions or select a condition. Snapshot JSON caps at 3,000 characters.

Supported view IDs are overview, front-left, front-right and the nine canonical report views. Conditions are null/scratch/chip/mark. Capture phase is prepare/exterior/interior/review; its area is a known view or condition and progress is 0..1. These engine capture phases differ from seller session phases. Motion values describe the requested opening destination, so a snapshot taken during animation can restore that destination immediately.

The independent viewer session uses this exact envelope:

```json
{
  "schema": 1,
  "mode": "guided",
  "chapter": 0,
  "tool": "model",
  "roomTab": "size",
  "freeView": null,
  "guidedView": null,
  "area": "front",
  "taken": []
}
```

Chapter is integer 0..9; tool and roomTab use the bounded lists above. Each mode view is null or a valid snapshot. `area` is one report-view ID. `taken` accepts at most nine unique report-view IDs and normalizes to canonical report order. Session JSON caps at 6,000 characters.

`loadViewerSession(reportKey)` returns a fresh normalized session or null. `saveViewerSession(reportKey, session)` returns false on rejected input and true for an accepted durable or memory-fallback write. Report keys are nonempty ASCII letters/digits/underscore/hyphen, at most 12,000 characters; `encodeReport(report)` supplies a suitable key. Arbitrary URLs and DOM-looking strings are not accepted as keys.

Storage uses `lihatdulu:viewer:v1` with exact `{schema:1, entries:[{key,session}]}`. At most twenty sessions are retained, newest first, replacing a prior entry for the same report key. These per-record limits bound the envelope below approximately 361,000 JSON characters. Malformed envelopes return no records; malformed entries are discarded. The shared storage helper retains the newest valid in-memory state if browser storage is absent, blocked or out of quota, even when durable data is stale. `clearLocalData()` clears viewer records too. This state is local convenience and never updates report/capture evidence.

### Studio template and controller boundary

`studioHTML(context)` renders the workspace shell and `studioPanelHTML(context)` renders current controls. `studioChapters` remains the chapter definition list. The context extends the existing report/chapter/free/area/taken/room information with `mode`, `tool`, `roomTab`, `selected`, `motions` and dimension visibility. `free` remains a compatibility Boolean derived from the explicit mode, not a second independent state.

Only the application controller changes the engine or persistence. Templates should not call a renderer, mutate report data or read unvalidated storage. The DOM uses `data-tool` for the five free tools, `data-room-tab` for `size`, `position` and `fixtures`, and `data-mode` for mode selection. `.studio-navigation` owns the single guide navigation pair. `.explorer-tools` owns the free tool choices. `#studio-panel` can refresh without rebuilding `#stage`.

The integration contract also includes chapter/details actions, quick scenarios, zoom/camera reset, placement reset/undo and the existing condition/view/motion/room/fixture controls. Button labels may be refined for Indonesian clarity, but root controller and templates must agree on the bounded action IDs. Hidden duplicate primary buttons should not create ambiguous keyboard or accessible-name targets.

### Capture recording: confirm, then advance

Capture retains the same canonical nine IDs: `front`, `left`, `right`, `rear`, `top`, `interior`, `drawer`, `rear-lower`, `underside`. Interior/drawer can be grouped separately for instruction without changing the report schema, underlying IDs or evidence provenance. Reordering visible groups must not fabricate missing photos.

A pending or retake area offers sample capture and skip. Recording the prepared example confirms the active area as captured. Skipping leaves it missing. Neither action silently jumps to the next area. A captured or skipped area offers an explicit Next action; the last area's forward action leads to review. This gives visitors a moment to understand what was accepted and provides an obvious opportunity to retake before moving on.

`mark-active-retake` changes the current area to retake, removes it from captured-only shared coverage and exposes the recording choice again. Area selection opens an area picker on mobile; the desktop checklist remains useful in the wider layout. The picker shows current status and lets visitors reach a particular area without a long scroll. Native dialog content must feed the same `data-area` action handling as the ordinary page.

The mobile camera illustration is compact. Its large decorative phone casing is not needed to understand a phone-capture simulation when the visitor already holds a phone. Desktop may keep the physical-room/phone context. The wording still identifies sample evidence and a simulation; a camera-like interface must not imply that camera permission was granted or a real photo was recorded.

`captureHTML(session, shareURL, options)` accepts the current review tab. `captureAreaPickerHTML(session)` renders the picker. `.capture-action-dock` contains each logical primary action once and adapts through CSS rather than duplicated desktop/mobile buttons. A full rerender must preserve the validated session and not accidentally create a second report when continuing a known capture ID.

### Capture review: shorter sections with preserved inputs

Review exposes `photos`, `notes` and `size` tabs on mobile. Panels use `data-review-panel` with those IDs and the container identifies its current tab. Desktop can show the sections together. Switching tabs changes visibility rather than destroying input elements and typed values.

Photos show which areas are documented and which remain missing. Notes retain the report name, report note and the three authored condition-note inputs. Size retains the dimensions-confirmed control and its authored-value explanation. Dimension confirmation is optional. The review must not force it to true because the visitor selected Next, opened a tab or published a sample report.

Existing IDs and input names remain integration contracts: `report-name`, `report-note`, condition-note identifiers and `dimensions-confirmed`. Validation and persistence still occur through the capture/report modules. Invalid or oversize edits must not keep a misleading success indicator. Returning to capture for a retake invalidates stale share output. Publishing uses captured-only coverage.

### Engine additions and loading feedback

The engine extends existing lifecycle, motion, room and capture APIs rather than exposing arbitrary object mutation to templates. V3 adds these interfaces:

| API | Result or purpose | Caller responsibility |
| --- | --- | --- |
| `captureViewState()` | Validated, JSON-safe scene snapshot | Save under the correct mode/report session |
| `restoreViewState(snapshot)` | Boolean accepted/rejected result | Keep a safe current scene when input is rejected |
| `zoomBy(factor)` | Bounded change to camera distance | Use accessible zoom controls and preserve state afterward |
| `capturePlacementPreview()` | Bounded WebP image of the actual room and cabinet | Save only with a valid room/fit state; handle missing preview honestly |
| `onLoadProgress(fraction \| null)` | Determinate or indeterminate load feedback | Update only the live render token; do not report a false percentage |

The engine validates the entire snapshot before restoration; invalid input returns false without partially changing the scene. Valid restoration cancels pending damping/camera/opening animations, applies the stored pose immediately and calls existing condition/placement callbacks so the controller can refresh controls/results. It does not change report, chapter, mode or tool itself. Disposed engines return null/false where appropriate. Snapshots are convenience state, not evidence that the authored furniture matches a real object.

Loading feedback should explain what is happening in Indonesian. `onLoadProgress` emits 0 at start, fractions in 0..1 during the GLB and two authored JSON transfers, null when totals are unavailable or loading fails, and 1 after successful setup. Fractions describe authored asset transfer/setup, not reconstructed scan completion. Callback errors do not interrupt loading, and failure stops later progress notifications. Navigation while loading still disposes obsolete engines and suppresses stale callbacks. A failed load uses evidence imagery and leaves room results uncomputed.

### Condition comparison and touch guidance

Condition exploration pairs the selected model anchor with the correct prepared photo. A close-up should make the scratch, chip or top ring visible without the marker overlay covering it. The user can inspect both the spatial position and the authored evidence. The image is not a live camera capture, and the model cannot establish hidden damage or structural condition.

Touch instructions should use gestures appropriate to a touch screen instead of telling a phone visitor to scroll a mouse wheel. Zoom buttons and camera reset provide alternatives. Room position controls remain an alternative to floor dragging. Tool switches and recovery controls should be discoverable without imposing a tutorial on every repeat visit.

Quick demonstrations focus the scratch, open the drawer or apply a door-obstruction scenario. They are shortcuts to existing authored controls and geometry, not simulated AI decisions. A scenario that deliberately moves the cabinet should remain reversible, and the three room-result meanings stay independent.

### Room tabs, history and recovery

Room tools separate size, position and fixture selection into compact tab groups. The model and result summary remain visible while the visitor chooses a control group. Body fit, door clearance and drawer clearance are distinct booleans; one passing result must not turn the whole placement green.

Camera reset restores a useful view without changing the cabinet's room placement. Placement reset returns the room/cabinet to the application's defined starting layout. Undo reverses the preceding room edit according to the controller's bounded history. Mode switching or reload restores the appropriate mode/session rather than manufacturing an undo history from arbitrary stored input.

Changing a room dimension, moving/rotating the item, choosing a scenario or dragging updates the current result. Saving requires a live engine and computed geometry result. Static fallback cannot save a pretend computed placement. The existing `setRoom`/`setFixture` distinction remains critical: restoring a saved fixture does not reset x/z/rotation to its default scenario transform.

### Actual local placement previews and compatibility

V2 saved placements stored report, room and time. V3 adds optional `preview` and `fit`. The preview is a bounded local WebP data URL produced from the actual Three.js room/cabinet render. It is not an arbitrary remote URL or user-supplied HTML. A new saved card can therefore show the layout the visitor really chose instead of the same generic furniture image for every layout.

`fit` contains exact Boolean `closedFits`, `doorsClear` and `drawerClear` fields. Cards can show a concise result summary without treating the preview itself as geometry evidence. Opening a saved placement restores the report and room transform, then recalculates live results. Stored fit values summarize the save; they do not replace a later engine calculation.

Old `{report,room,savedAt}` values remain accepted. Their cards use an appropriate fallback image and do not invent a missing fit summary. A missing preview must be omitted rather than passed as null. Unknown placement fields reject a write. Invalid optional fields discard the individual stored placement during loading, rather than presenting its unsafe preview.

`PLACEMENT_PREVIEW_LIMIT` is 100,000 characters. `validatePlacementPreview` accepts a canonical base64 `data:image/webp` URL with a complete RIFF/WEBP envelope, recognized VP8/VP8L image content and a static canvas no larger than 400 × 300. Animated chunks, incomplete/trailing chunks, malformed base64, remote URLs, SVG and HTML are rejected. This checks the container and declared dimensions; browser regression decodes the resulting image. `validatePlacementFit` requires exactly the three Boolean results. `validateRoom` is exported to keep one room-bound contract.

Preview capture uses an offscreen 400 × 300 WebGL target from the actual current camera. It reads pixels, flips rows into a temporary canvas and tries bounded WebP quality levels. It returns null if not in an active room, after disposal, during capture composition or when rendering/encoding fails. Scene visibility and renderer target/viewport/scissor/settings are restored in a finally path. The live scene is not replaced by a generic image. Placements retain the existing `lihatdulu:placements:v1` key and twenty-record cap. Storage/quota failure keeps the established session-memory fallback and communicates its persistence limit.

### V3 QA intent and final release record

V3 must first reproduce the original failures: guide Next beneath the ordinary phone viewport, and a direct `mode=free` query that did not open free exploration. Then passing checks must exercise the corrected behavior rather than merely update selectors until old tests are green.

The interactive phone matrix covers all ten chapters at 320 × 568, 375 × 667, 390 × 844 and 412 × 915. It checks the scene and navigation/action geometry, tool reachability, no hidden page-scroll dependency, compact review tabs, keyboard interaction and current layout metadata. A pure no-horizontal-overflow assertion is insufficient.

Workflow/state checks cover explicit mode switching, no implicit orbit mode changes, per-mode camera/opening/room continuity, reload, report isolation, capture confirm/Next/skip/retake, review edits, immutable sharing, undo/reset, actual thumbnails and legacy stored placements. Validators receive malformed/unbounded scene and preview data. WebGL/model fallback keeps readable evidence and uncomputed room results.

Fresh final unit and browser suites, production build, screenshot capture and direct-route production smoke must run against the integrated v3 source. The final ZIP must include the same built public assets, master context and screenshots that were reviewed. Exclude dependencies, transient test output, raw licensed references, Python bytecode and unrelated files. Record archive CRC/readback, public/dist equality and standalone-master equality after packaging.

| Final v3 evidence | Release stamp |
| --- | --- |
| Initial RED regression evidence | Recorded in `docs/mobile-revision-ledger.md`: two pre-fix failures at 390 × 844, Next ending at Y1198.39 and direct free query reporting `free:false` |
| Unit tests and relevant bounds |43/43 pass, covering report/capture/viewer/preview/template validation and fallback storage |
| Browser/engine/mobile workflows |28/28 pass; all ten chapters at four phone viewports; capture/share, explicit modes, independent undo, snapshots/zoom/pan/preview |
| Production build and fresh chunk sizes | Passed; CSS105.29kB, main95.78kB, lazy engine694.24kB; engine advisory remains nonblocking |
| Mobile/desktop screenshots and review |31 regenerated application previews; desktop1440×1000, phone390×844 and320×568; independent touch375×667 review; zero page errors |
| Production direct routes and loading/error scan | Seven routes/refreshes and mobile375×667 workflows pass; real asset/font loads; zero page/console errors, failed/external runtime requests |
| Archive CRC, all-file readback, exclusions and file count | Passed;169 files,31 preview PNGs, about24.2MB; dependencies/raw reference/test output excluded |
| Public/dist and standalone-master equality | Passed; exact bytes of all public assets and the standalone/ZIP master are compared |

Automated Chromium software WebGL and viewport review does not certify physical Safari, all phones, assistive-technology announcements, hardware performance, real photo/reconstruction quality, backend security, product demand, market size or revenue hypotheses. V3 is still a clear, interactive business-plan demonstration.

## Decisions that must survive future revisions

1. **Two large entrances:** keep one path for the usable platform and one for the guided interactive 3D demonstration.
2. **One coherent item:** use the same cabinet, condition locations, evidence views, and dimensions throughout capture, report, studio, and room placement.
3. **Invented but realistic geometry:** the cabinet illustrates a plausible furniture item. It does not represent a measured physical object.
4. **Wear before room fit:** condition inspection leads the product story; room placement adds a second decision layer.
5. **Include a drawer:** the asset contains two lower doors, shelves, and a top drawer. Drawer travel differs from door swing.
6. **Phone-only consumer concept:** the proposed consumer service starts from a phone. A business capture kit remains a later business hypothesis.
7. **Indonesian UI:** labels, instructions, status messages, and key errors must remain understandable in Indonesian.
8. **Capture starts the story:** show how someone documents the actual barang before revealing a finished report.
9. **Warm consumer styling:** use large furniture imagery, white and warm off-white surfaces, charcoal text, forest-green actions, and restrained warm accents.
10. **Task-focused platform home:** report status and the next useful action matter more than promotional banners or arbitrary dashboard metrics.
11. **Linked evidence:** condition descriptions should connect to visible evidence and the correct cabinet part.
12. **Honest gaps:** a skipped, rejected, or inaccessible area remains undocumented in the buyer's report.
13. **Honest simulation labels:** authored imagery and prepared results should not imply live reconstruction or automated inspection.
14. **Snapshot consistency:** editing a local draft must not silently change an old shared link.
15. **Clear geometry results:** distinguish closed-body fit, door clearance, and drawer clearance.
16. **Fallback honesty:** when 3D cannot load, preserve images and report text; do not pretend to calculate room fit.
17. **Responsive interaction:** desktop, ordinary phone, and narrow-phone layouts must contain the core journey without horizontal page overflow.
18. **Reduced motion:** preserve all information and controls when the visitor requests less motion.
19. **Source handoff:** provide the source and static build in the ZIP, not only screenshots or a hosted URL.
20. **No external publication required:** the current request asks for a Vercel-ready ZIP. It does not require publishing to a user account.
21. **Scene and action together:** a phone visitor should not repeatedly scroll between the current model, essential controls and Next. Mobile workspace height follows the visible viewport.
22. **Free exploration is a full entrance:** visitors can reach model, condition, opening, dimensions and room tools without completing the guide. It is not a payment plan or an operational scan service.
23. **Modes are explicit:** an orbit gesture does not change guided/free mode. Each mode can resume its own validated setup.
24. **Manual capture advance:** recording or skipping an area confirms that state, then a separate Next action advances. Retake remains available and missing evidence stays honest.
25. **Real saved-placement previews:** a new saved layout should use the actual rendered cabinet and room, with independent body/door/drawer results. Legacy saves remain readable.
26. **Camera and room recovery differ:** camera reset, placement reset and placement undo must have clear, separate behavior.

## Available user-visible history and decision log

The conversation developed in several phases. This section preserves the substance of every available project request. Some early requests refer to attachments or analyses that no longer appear in the recoverable working files. Those requests remain useful context, but their missing contents must not become invented evidence.

### Phase 1: Broad problem exploration

The user first asked to combine supplied material into one detailed Markdown file and suggested OCR if needed. The specific initial source material is not available in the current handoff. A future collaborator should not infer its subthemes, wording, or institutional requirements from this request alone.

The user then asked for many problem statements for each subtheme. They wanted urgent, specific, less mainstream problems. They requested macro analysis, ongoing trends likely to continue, and a market large enough to matter. At that stage, the user explicitly asked for problems without solutions. This was exploratory research, not approval of the later product concept.

The user narrowed the search toward B2C and D2C problems. They wanted problems closer to ordinary consumers, easier problem validation, and a market with meaningful scale. This preference helps explain why the final prototype focuses on a household buyer and seller rather than an industrial inspection dashboard.

Two candidate household problems received specific attention:

- Households see electricity consumption increase but cannot identify which appliance or change in usage caused it.
- Household air-conditioner owners pay repeatedly for refrigerant refills, then lose cooling performance again and cannot tell whether servicing addressed the underlying fault.

Neither problem becomes a feature of LihatDulu. Their role in this history is to establish the user's interest in concrete consumer uncertainty and avoidable costs. Do not add electricity analysis, AC diagnostics, service booking, or energy dashboards to this furniture prototype based on those earlier requests.

### Phase 2: Secondary data and digital innovation

The user questioned whether digital innovation should act as a tool rather than define the problem. They considered scraping, Apify, Play Store reviews, social listening, literature reviews, institutional reports, and original secondary-data analysis. They expressed reluctance to rely heavily on surveys or interviews.

They also mentioned marketing-oriented analysis, synthetic data, machine learning, GANs, and MiroFish as possible inspiration for consolidating macro information with business data. These mentions did not establish technical requirements. LihatDulu does not use Apify, GANs, synthetic customers, MiroFish, machine-learning inference, Play Store scraping, or automated marketing insights.

The transferable requirement is the user's preference for credible problem argumentation from obtainable evidence. A later competition research document could analyze consumer reviews, condition-grade language, listing disclosures, complaints, and institutional data. Such work should clearly distinguish observed complaints from market prevalence and should document collection methods and bias. The current website does not include that research pipeline.

### Phase 3: Refurbished devices and condition uncertainty

A candidate problem particularly interested the user: refurbished-device buyers cannot consistently interpret condition grades and remain uncertain about battery health, replaced components, and warranty coverage. The user asked what kind of technical device or experience might address it.

The user drew inspiration from projects that reconstruct 3D objects with a phone camera. They asked to broaden the idea beyond devices and brainstorm deeply. This is the transition from the initial refurbished-device problem toward visual evidence and physical-item documentation.

That transition matters. A visually attractive model cannot establish battery capacity, internal replacement history, authenticity, warranty enforceability, structural integrity, or hidden damage. The furniture demonstration focuses on externally observable wear, visible interiors, dimensions, and illustrative placement. It does not solve the full refurbished-device verification problem.

### Phase 4: Business concept

The user liked the concept and suggested a large social-listening run to support the problem argument. They preferred a phone-only experience for consumers and considered a phone capture kit for businesses. They asked how the business would work, what it would provide, whom it would serve, and what revenue streams might fit.

The available history contains the questions and the eventual product direction. It does not contain a recoverable, fully validated business model, pricing analysis, market-sizing dataset, or social-listening result. Therefore this context records business options as hypotheses rather than approved evidence. A future collaborator should ask for or retrieve the actual research if a business-plan slide needs numerical claims.

The proposed service becomes a shareable item report that supports consumer decisions. The report can show the item from several directions, connect condition notes to evidence, display dimensions, and preview the item in a room. A seller creates and shares it. A buyer uses it before deciding whether to pursue a purchase elsewhere.

### Phase 5: Competition constraint and prototype approach

The user clarified that the competition only requires a business plan. They do not need to build a working reconstruction service. They want judges to visualize the experience and understand how it works.

They proposed a Vercel website with animated 3D designs, Three.js, CadQuery, camera changes, and contextual explanation boxes. The implementation follows that basic division: CadQuery authors geometry, prepared renders supply static imagery, and Three.js drives live interaction in the browser. Mitsuba supports prepared rendering; it does not render browser shadows during live interaction.

The user preferred CadQuery because the assistant could install and run it without requiring their involvement. They mentioned earlier CadQuery images as examples; two local image paths in that early turn were unavailable, so this pack does not claim to recover their visual contents. They suggested Mitsuba for improved shadows and appearance.

The user wanted the website itself to act as the prototype. They specifically preferred limited problem explanation or implementation exposition in the interface. They wanted a highly interactive experience. They also offered access to Envato Elements and Mobbin for downloadable references.

### Phase 6: Modeling choices

The user asked to model before building the website and requested a detailed model brief with dimensions and clarifying questions. The confirmed answers selected:

1. An invented but realistic object.
2. A drawer in addition to the cabinet's other storage.
3. Wear inspection followed by room fit as the priority.

The first modeled asset therefore became a light-wood cabinet with one full-width top drawer, two lower doors, two internal shelves, four feet, dark handles, and three restrained cosmetic examples. The second modeled context became a simple room. The recovered brief also proposed a future desk and sideboard, but the delivered interactive furniture remains one cabinet.

The user approved generation, then expressed strong satisfaction with the 3D models. The recovered asset package includes parametric source, GLB, STEP files, manifests, renders, an editable asset viewer, and tests. The current website consumes the exported cabinet and rendered imagery.

### Phase 7: First website

The user requested inspiration from `https://regencity-demo.vercel.app/` and `https://gopang-website.vercel.app/`. They particularly liked GoPang's design system, platform exploration, and equipment exploration. They requested a placeholder business name, two large things to do, a practical platform entrance, an actual 3D demonstration, camera moves, explanatory boxes, and Indonesian language.

The user asked to repeat clarifying questions after missing them while sleeping, then approved proceeding and asked for a Vercel ZIP. They later said they accidentally stopped the work and asked it to continue. Those messages resumed the same deliverable and did not introduce a different scope.

The first website adopted LihatDulu, forest green and a warm light background, a two-entry home, seller and buyer perspectives, a report builder, snapshot sharing, cabinet inspection, configurable room placement, local saves, and seven guided studio chapters. The first ZIP included source, a prebuilt static build, imagery, tests, and validation notes.

The first studio began with a finished cabinet. It did not show someone capturing a real item. That omission followed the first approved scope, which used prepared imagery selection. The user later chose to expand the product journey.

### Phase 8: Read-only QA and reference selection

The user asked to QA the prototype, said the studio should begin with someone using the software and camera to record the actual barang, requested a more professional visual direction, and wanted deeper platform functionality. They explicitly asked not to revise yet.

Read-only review found a strong viewer but a weak input-to-report story. The first platform also had a large promotional banner, one report card, a seller-side link-import panel, little meaningful activity, and several studio controls competing at once. The discussion proposed a guided capture flow, clear report states, evidence review, buyer handoff, and chapter-specific controls.

The recommended Mobbin examples included IKEA room scanning, Turo host photo documentation, Bird issue reporting, web workspace grids, and product-detail layouts. The user uploaded the complete Turo host-photo flow, a furniture mobile UI kit, and a hand-held-phone mockup package. Those references inform the redesign; they do not provide furniture scan data or a live reconstruction model.

### Phase 9: Consumer redesign plan and implementation request

The user liked the supplied reference set and asked for a more professional appearance, mentioning Airbnb as a possible visual inspiration. The planning response recommended warm consumer styling, a studio that transitions between a room and phone interface, and a task-focused platform home. The redesign plan covered a capture preparation screen, simulated camera interaction, report review, buyer report, saved placements, visual-system refinement, and a studio storyboard.

The user then approved implementation. They asked for a new Vercel ZIP, encouraged going all out, authorized judgment to fill gaps, and requested a master AI context Markdown containing everything relevant. That approval ends the earlier planning-only constraint. It authorizes the current implementation and packaging, while preserving the competition prototype boundary.

### Phase 10: Mobile critique and free-exploration approval

The user strongly praised the consumer redesign, then asked how it had been built and requested a repeatable technical-stack explanation. Later, they noticed that phone use required repeatedly scrolling between the 3D content and the Next button. They asked for a revision plan before any edits.

Read-only inspection confirmed that width responsiveness had not guaranteed comfortable vertical interaction. The large model, explanatory content and navigation could be individually legible while the primary action remained below the phone viewport. That distinction is the basis of v3: measure whether the scene and useful action can be operated together, not merely whether the page lacks horizontal overflow.

The user also wanted an option for visitors who prefer exploring the simulation directly instead of repeatedly selecting Next. The approved design separates guided storytelling from a full tool-based viewer while keeping the two modes in the same product. Free exploration means direct interaction, not an asserted freemium business model.

The user then said **“Sounds good, proceed and revise.”** That is implementation authorization. It supersedes the preceding planning-only boundary for this revision. The agreed work includes the mobile layout, full free exploration, explicit/resumable modes, touch instructions, photo/model condition comparison, actual saved thumbnails, quick scenarios, reset/undo, loading feedback, integrated QA, updated master context and a clean Vercel-ready package. No additional modeling, real camera access, backend, external publication, stock-image replacement or business research is implied.

## Problem and business context

### Working problem statement

Secondhand-furniture buyers struggle to assess observable condition and placement suitability from incomplete or inconsistent listing images. They must interpret seller descriptions, ask for missing views, and estimate whether the item fits and opens in their room. The proposed service aims to make the evidence and unanswered questions easier to inspect in one shared report.

This statement is a product hypothesis. The conversation establishes the user's interest and the prototype's response; it does not establish complaint prevalence, willingness to pay, conversion improvement, purchase safety, or the size of the addressable market. A business-plan presentation should support these claims through research rather than treat a prototype as validation.

### Roles

| Role | Proposed need | Prototype responsibility |
| --- | --- | --- |
| Casual seller | Document an item without preparing a complicated listing package | Start sample capture, complete area evidence, review notes and share report |
| Prospective buyer | Understand visible wear, missing information, dimensions, and room interaction | Open report, explore evidence and model, check illustrative placement |
| Repeat reseller | Produce consistent reports across more inventory | Workspace/report states demonstrate the direction; actual business operations remain future work |
| Judge or presenter | Understand the intended customer journey quickly | Guided studio and connected seller-to-buyer walkthrough |

The prototype's role selector changes the interface perspective. It does not create or authenticate accounts. Seller and buyer represent tasks, not verified identities. A seller can open a buyer preview on the same device to demonstrate the handoff.

### Potential value propositions, clearly marked as hypotheses

- Sellers could document items more consistently and reduce repeated requests for basic views.
- Buyers could identify missing evidence earlier and ask more precise questions.
- Linked condition photographs could help people interpret descriptions such as scratches or chipped edges.
- Dimension confirmation and room previews could support placement discussion before purchase.
- A reusable report link could travel through existing messaging or listing channels.
- Repeat sellers could standardize documentation across their inventory.

Each claim needs validation. The prototype demonstrates how the interaction might work. It does not measure the benefit. Avoid claims that the service eliminates fraud, guarantees condition, prevents disputes, proves authenticity, or guarantees successful delivery.

### Revenue possibilities for later research

| Hypothesis | Potential payer | What must be validated |
| --- | --- | --- |
| Per-report payment | Occasional seller | Whether sellers value the report enough to pay for one item |
| Subscription or report allowance | Repeat reseller | Inventory frequency, workflow adoption, retention, and unit economics |
| Paid richer capture or inspection service | Seller or buyer | Whether users want assistance and what an honest service can verify |
| Business capture-kit package | Reseller or furniture business | Whether a physical kit improves repeatability enough to justify setup and cost |
| Platform integration | Existing marketplace or reseller | Demand, integration effort, data rights, procurement timing, and attribution |

These are options, not implemented revenue streams. No price, take rate, subscription tier, customer count, sales forecast, margin, market share, or break-even point has been validated in the recoverable record. Do not add fake billing or pretend account entitlements to the current UI merely to make the business look complete.

### Market sizing and research boundaries

The user initially requested a substantial market. The current pack intentionally does not invent a TAM, SAM, SOM, resale growth rate, or Indonesian market estimate. The available project sources do not provide a current, attributable market-sizing model.

A future analysis should define the market before selecting a headline number. It should distinguish the total furniture market from the secondhand furniture market, then distinguish potential report creators from paying users. Geographic scope, resale channel, item value, listing frequency, internet access, and the cost of creating a report can materially affect the serviceable segment.

A defensible sizing worksheet could use an explicit bottom-up structure: estimated eligible secondhand listings per year, share with meaningful condition or placement uncertainty, achievable reporting adoption, and a tested revenue model. Every term should show its source, date, unit, uncertainty, and whether it measures listings, transactions, households, or businesses. Do not multiply incompatible populations or imply every furniture sale would use the service.

Secondary data could support original analysis without replacing all direct user validation. Examples include public review complaints, listing image coverage, the frequency of vague condition labels, requests for extra dimensions, and differences between product categories. Collection needs a stated sampling method, platform scope, time window, exclusion rules, deduplication, and coding procedure. Social posts and reviews often overrepresent unhappy users and do not directly measure population prevalence.

Synthetic data can help exercise UI states or test a pipeline. It cannot establish that real buyers experience a pain point or will pay. Machine learning should enter only when a specific validated task and evaluation dataset justify it. A future collaborator should not introduce GANs or an elaborate prediction stack simply because the early brainstorming mentioned them.

### Competition argumentation without unsupported claims

Separate the business narrative into problem evidence, target segment, proposed workflow, willingness-to-use evidence, willingness-to-pay evidence, technical feasibility, and business assumptions. The polished prototype supports the workflow and feasibility discussion at the interaction level. It cannot independently support consumer demand or scan accuracy. A judge may appreciate the interface while questioning whether a casual seller will complete nine-area documentation. That effort-versus-value question deserves direct research.

A social-listening study can code complaints about vague condition descriptions, absent rear/interior photographs, mismatched dimensions, undisclosed wear, or furniture that fits but cannot open. Preserve a de-identified evidence trail and distinguish the number of coded mentions from the number of people or transactions affected. Public posts can justify investigating a problem, but a sample of complaints does not establish national incidence or customer conversion.

For a secondary-data validation plan, specify platforms, search terms, date range, eligible product categories, sampling approach, duplicate handling, annotation rubric, and coder agreement where relevant. Compare positive or neutral transactions when feasible to reduce complaint-only bias. Treat platform rules, access restrictions, and licence terms as collection constraints. Avoid automatically collecting private messages or identifying people without a justified need.

For the competition deck, keep cautious language concrete: “Our prototype lets a seller mark missing areas and share linked example evidence,” rather than “Our AI verifies condition.” Label any proposed revenue numbers as assumptions and show a sensitivity range. Use an external market source only for what it actually measures. A general furniture retail value does not automatically equal the service's paying addressable market.

The user's preference for scraping and secondary data can shape the research plan, but it does not remove the need to validate completion effort and willingness to pay. A lightweight task walkthrough with a few real listings can reveal usability issues without requiring a broad survey. That is a future validation recommendation, not work completed by this website release.

## Product experience

### Two entrances with a shared story

The homepage keeps two primary areas: **Jelajahi Platform** and the **3D studio**. The studio entrance offers both the guided demonstration and direct free exploration. The platform lets them use the proposed software. The studio demonstrates the same software in a physical context. Both entrances preserve the cabinet identity and the relevant report context.

The two entrances should remain visually prominent. A visitor should not need to read a long business explanation to choose. The images and short descriptions should preview the actions: document an item and inspect it, or follow the capture-to-buyer story.

### Seller journey

The seller workspace shows items, statuses, and next actions. A new report starts a fresh capture session. Continuing a draft resumes its stored progress instead of silently creating another copy. The user should see which area needs attention and why the next action matters. The draft indicator reflects whether validation accepted the latest values. An empty name or oversize text should not keep displaying a successful save state.

Capture preparation explains light, access around the item, and the area sequence. The prototype uses rendered sample scenes and a simulated capture interface. It does not request camera access. The visitor records prepared exterior views, then interior and detail views. A captured image represents a sample state change, not an uploaded photo.

Historical v2 behavior scrolled the camera into view after area/retake selection. V3 replaces that workaround with a persistent mobile camera workspace and area-picker dialog. It remains sample UI navigation, not object tracking.

Review provides a place to inspect images, retake an example, or declare a surface inaccessible. The documentation model preserves the difference between captured and missing evidence. The seller can add notes and confirm the authored dimensions. A shared report then records the current bounded data as a snapshot.

The seller should never use a clean-material control to erase documented wear. The three authored cosmetic examples remain part of the cabinet. Editable notes supplement evidence; they do not change geometry or establish a condition grade.

### Buyer journey

A buyer opens a report or selects a demonstration report. The initial view prioritizes large images, item identity, dimensions, condition notes, and missing documentation. The buyer can inspect close-ups and move into the live model when supported.

Model controls let the buyer orbit, choose views, focus condition markers, open storage, and show dimensions. Selecting a condition should focus its actual location. A scratch on the door must continue to follow the door as it opens. The image gallery gives a useful path even when 3D fails.

Room placement lets the buyer vary the illustrative room, move and rotate the cabinet, select an obstruction scenario, and evaluate three outcomes. A closed cabinet can fit while its doors or drawer cannot open. The buyer can save a report or placement locally and later reopen it.

This sequence supports a more informed question or next step. It does not produce a purchase recommendation, an authenticity certification, a hidden-defect diagnosis, or a delivery feasibility guarantee. The prototype does not include checkout, escrow, logistics, verified messaging, or transaction completion.

### Studio journey

The redesigned studio begins with a room, cabinet, and generic phone. It establishes the physical item before showing the software interface. Guided chapters move through capture context, area documentation, condition evidence, the prepared model, dimensions, report handoff, room placement, and opening clearance.

The visitor remains an active participant. They can change chapters, repeat a chapter, inspect a condition, adjust the relevant demonstration state, or enter free exploration. The guide should not expose every possible control at once. Chapter-specific controls reduce competing instructions, while free exploration supports the complete viewer toolset.

Manual camera interaction interrupts a camera transition while preserving the explicitly chosen guide/free mode. Guided chapters retain their focused controls, including room-placement controls when the visitor drags or orbits. The first capture chapters establish the room/phone choreography; the visitor can explicitly choose free exploration at any point. Each mode retains its separate validated setup. Reduced motion applies the target view and pose immediately. Rapid chapter changes replace prior transitions instead of queuing them. These behaviors make the studio a controllable demonstration rather than an autoplay animation.

## Visual direction and reference map

### Design thesis

LihatDulu should look professional through clear hierarchy, purposeful imagery, consistent controls, and connected workflows. More shadows, more cards, or more animation alone will not add product depth. The cabinet and its evidence should dominate the visual story. Supporting text should explain the task in familiar language.

The direction uses white and warm off-white surfaces, charcoal text, forest green for primary actions, and restrained clay or wood accents. Plus Jakarta Sans supplies a clear sans-serif family. Rounded cards and controls create consistency. Status labels use text as well as colour. Captions remain secondary to core actions and information.

The first version used many similar pale-green panels and a large banner. The redesign gives different content types clearer visual roles: imagery-led report cards, operational next actions, focused capture controls, and a gallery-led buyer report. Seller management and buyer inspection should not compete on the same screen.

### Implemented visual tokens and responsive rules

| Token | Value | Use |
| --- | --- | --- |
| Ink | `#242923` | Primary text and headings |
| Muted | `#687068` | Secondary text |
| Primary green | `#173f32` | Main actions and selected navigation |
| Green hover | `#24533f` | Action feedback |
| Green light | `#eef4ee` | Selected/context surface |
| Page | `#faf9f6` | Warm neutral background |
| White | `#ffffff` | Cards/forms/report surfaces |
| Quiet line | `#e5e7e0` | Separation |
| Strong line | `#cdd3c9` | Secondary control boundary |
| Clay | `#af7359` | Restrained identity accent |
| Amber | `#835218` | Missing/retake warning |
| Amber light | `#fbf4e8` | Warning background |
| Red | `#973f31` | Blocked/error emphasis |
| Typical radius | `18px` | Standard surfaces |

Body text starts at 16 px with 1.65 line height. The variable font supports weights 200–800. Page headings range from 30 to 42 px, with the home composition reaching a larger size. Compact metadata stays secondary; it should not carry the only statement of a condition or obstruction. Controls use visible outlines and a consistent 11 px button radius. Hero entrances use a larger 23 px radius.

The main content width caps at 1280 px. Wide gutters are 48 px, laptop gutters 32 px, mobile gutters 20 px, and narrow-mobile gutters 16 px. The seller grid uses three, two, or one card columns as width permits. The buyer gallery begins with a large image and supporting views; its decision card remains separate from report content and joins the normal flow on mobile.

Breakpoints at 1200, 980, 760, 500, and 359 px progressively simplify the workspace, stack report/capture/studio/room layouts, reduce scene height, and protect the narrow viewport. Short-landscape rules reduce viewport height and disable sticky elements. Named filter/chapter strips can scroll horizontally inside their own containers; the page itself should not overflow horizontally.

Capture imagery uses `object-fit: contain` so the cabinet proportions stay intact. Gallery and consumer scene crops serve composition, while image dialogs retain source aspect ratio. Coarse-pointer rules raise compact controls to at least 44 px, and the mobile shutter remains substantially larger. Reduced-motion rules remove decorative transitions while the engine applies its final views instantly.

`docs/design-system.md` records the implemented tokens, component roles, typography, breakpoints, interaction sizes, and visual QA targets. CSS remains the source of actual values. A later visual revision should update that document and the master pack when changing the consumer direction.

### Exact reference URLs

| Reference | URL | Pattern and adaptation |
| --- | --- | --- |
| GoPang | https://gopang-website.vercel.app/ | Two large entrances, platform/equipment distinction, lightweight navigation, green visual language |
| ReGenCity | https://regencity-demo.vercel.app/ | Object-connected lists, exploration panel, state-dependent context |
| Airbnb | https://www.airbnb.com/ | Warm consumer clarity, image prominence, distinct consumer and host tasks; inspiration rather than brand copying |
| IKEA room scanning flow | https://mobbin.com/explore/flows/f6698e22-1ee6-4c36-a0a0-84df71c0c3bc | Preparation, scanning guidance, processing, failure/retry; room capture is an analogy, not object reconstruction |
| Turo host photo flow | https://mobbin.com/explore/flows/465d0910-359e-4d41-b899-2475f209f453 | Exterior/interior area guidance, photography, gallery review, incomplete capture handling |
| Bird issue reporting flow | https://mobbin.com/explore/flows/4bb0fda2-0003-46b3-b0e0-9ab39d7a7721 | Condition description connected to a photo and submission review |
| Mobbin taking-photos category | https://mobbin.com/explore/mobile/flows/taking-photos | Additional capture pattern exploration |
| Mobbin scanning category | https://mobbin.com/explore/mobile/flows/scanning | Guided scanning pattern exploration |
| Mobbin web grids | https://mobbin.com/explore/web/ui-elements/grid-list | Workspace thumbnails, project organisation, navigation patterns |
| Mobbin web product detail | https://mobbin.com/explore/web/screens/product-detail | Gallery and information hierarchy for buyer report |
| Furniture Mobile App | https://elements.envato.com/furniture-mobile-app-874AZ8F | Furniture card and screen-composition reference |
| Hand Holding Phone Mockup | https://elements.envato.com/hand-holding-phone-mockup-2NBABE9 | Static phone-interface presentation reference |
| Polycam object guidance | https://learn.poly.cam/ | Primary product documentation informed discussion of capture progression; do not treat it as a performance claim for LihatDulu |
| Vercel Vite guide | https://vercel.com/docs/frameworks/frontend/vite | Deployment reference for this project's static build |

The planning review verified the IKEA flow at 20 screens, Turo host flow at 13 screens, and Bird reporting flow at 10 screens. Those counts identify the referenced examples at the time of review. Mobbin content can change. Future collaborators should verify the current pages rather than assume the exports remain unchanged.

The first GoPang/ReGenCity review established layout and navigation patterns. Its review browser used static alternatives for the reference studios, so the record does not claim direct observation of every live 3D camera sequence on those sites. LihatDulu's camera implementation derives from its own working viewer and authored storyboard.

### Turo lessons from the uploaded screens

The uploaded Turo package contains thirteen ordered screenshots. Its host workflow includes exterior preparation, illustrated area guidance, capture, gallery review, an incomplete-coverage warning, and separate interior documentation.

Seven patterns transfer well:

1. Illustrate the area requested rather than relying on an abstract label.
2. Explain preparation before capture begins.
3. Keep extended guidance available without filling the main capture interface.
4. Distinguish capture from selecting existing images when the real product eventually supports both.
5. Let users keep capture momentum while showing progress.
6. Review evidence before finalising the report.
7. Preserve incomplete documentation and offer a return path.

Car-specific photo quotas and insurance claims do not transfer to furniture. A number of photos does not prove area coverage. Turo's illustrations, branding, policy text, and vehicle images should not ship as LihatDulu assets. The prototype adapts interaction ideas with its own cabinet, Indonesian copy, and visual system.

## Uploaded reference inventory and hashes

The following originals informed the redesign. SHA-256 hashes identify the exact supplied ZIP bytes. They do not establish a licence to redistribute the downloads. The original reference packages should remain separate from the public deployment unless the asset licence and intended use explicitly permit redistribution.

| Uploaded filename | Bytes | SHA-256 |
| --- | ---: | --- |
| `Turo iOS Taking car photos (Host) (1).zip` | 12,874,324 | `0e365e9eb4e63675eb5d8ca3e2e69b4495b5962120282ec9ff9ed9d1e79e512e` |
| `furniture-mobile-app-2025-11-23-16-40-01-utc.zip` | 469,478 | `6ca3f2060cd044f97e82a00a389a1c9b7d080b3ca2364bbb7e41247c6b7b77eb` |
| `hand-holding-phone-mockup-2025-12-05-16-28-34-utc.zip` | 25,671,843 | `7a732c9238c154016821ce76e2279f1e2b1910c80f44e095b1bd3d4e732407e7` |

### Turo ZIP contents

The archive contains thirteen PNGs named `Turo iOS Taking car photos (Host) 0.png` through `Turo iOS Taking car photos (Host) 12.png`. Their archive entry order is not chronological. Sort by the numeric suffix when reconstructing the flow. The filenames identify screenshot positions, not product release dates.

The review assembled a contact sheet for internal visual inspection. That sheet is a reference-review aid rather than a new product asset. The downloadable website should use authored visuals and should not place those competitor screenshots in the public UI.

### Furniture UI ZIP contents

The supplied kit includes:

- `SVG/Home Screen.svg`.
- `SVG/Search Screen.svg`.
- `SVG/Checkout screen.svg`.
- `SVG/Scan Screen.svg`.
- `Font/Link Font.txt`.
- `Furniture App/Furniture App.xd`.
- `Furniture App/Furniture App - UI KIT.fig`.
- `Furniture App/Furniture App.sketch`.
- macOS metadata entries under `__MACOSX/`.

The kit provides layout references in SVG, Adobe XD, Figma, and Sketch formats. Its inclusion of a checkout screen does not add checkout to LihatDulu's scope. The redesigned prototype uses its own components and the self-hosted Plus Jakarta Sans font. The reference font-link text does not replace the project's existing font licence.

### Phone mockup ZIP contents

The supplied package includes:

- `Hand Holding Phone Mockup 2/Hand Holding Phone Mockup 1.psd`, 32,258,838 bytes.
- `Hand Holding Phone Mockup 2/Hand Holding Phone Mockup 2.psd`, 10,288,631 bytes.
- `Hand Holding Phone Mockup 2/Hand Holding Phone Mockup 3.psd`, 21,957,564 bytes.
- `Hand Holding Phone Mockup 2/Help.pdf`, 1,310,769 bytes.

These are static Photoshop compositions with different poses. They do not supply a rigged, movable 3D hand or phone. The studio's animated phone requires authored geometry. A future designer can use a licensed static mockup in a presentation if appropriate, but should not describe a PSD as a live 3D asset.

## Cabinet and room asset specification

### Asset identity and provenance

The cabinet is an authored demonstration model. The exported cabinet manifest uses `id: oak-cabinet-01`. The report schema uses the whitelisted asset identifier `cabinet-01-v1`. These identifiers serve different purposes and should not be casually renamed. The model file contains 31 meshes, 27,503 triangles, and 4,702,852 bytes in the recorded source export.

CadQuery generated the cabinet solids and named assembly parts. The export pipeline transformed millimetre CAD geometry into metre GLB geometry with Y up. Prepared materials and cosmetic overlays supply the visual wear. Mitsuba rendered documentation imagery from the actual exported mesh. The files do not represent independently photographed or inspected furniture.

The revision also includes `model-source/` with the recovered parametric CAD scripts, specification, Python test source, requirements, historical asset README, and detailed model brief. It bundles the cabinet and room GLB, both STEP solids, manifests, authored report metadata, validation JSON, and optimized wood texture under the historical generated-assets path. The website does not execute this Python code. The scripts preserve their output layout under `model-source/asset-viewer/public/assets` and `model-source/previews`.

The original asset viewer used the temporary working name ReForm. That name refers to the older asset preview. The current consumer website uses LihatDulu. A future collaborator should not restore ReForm branding simply because it appears in the recovered model README.

### Core dimensions

| Measurement | Value |
| --- | --- |
| Closed cabinet width | 900 mm / 90 cm / 0.9 m |
| Closed cabinet depth | 475 mm / 47.5 cm / 0.475 m, including handles |
| Closed cabinet height | 1200 mm / 120 cm / 1.2 m |
| Closed construction depth without handle projection | 450 mm |
| Carcass dimensions | 900 W × 429 D × 1100 H mm |
| Carcass lower elevation | 100 mm above the floor |
| Side/top/bottom panel thickness | 18 mm |
| Back panel thickness | 6 mm |
| Feet | Four 40 × 40 × 100 mm blocks |
| Left/right door | 445.5 W × 18 D × 911 H mm each |
| Drawer fascia | 894 W × 18 D × 180 H mm |
| Drawer basket exterior | 838 W × 380 D × 140 H mm |
| Drawer basket walls/base | 12 mm walls, 6 mm base |
| Drawer clear interior | 814 W × 356 D × 134 H mm |
| Shelves | Two 860 W × 400 D × 18 H mm |
| Shelf lower faces | 400 mm and 700 mm above floor |
| Door opening limits | Left −100°, right +100° around Y |
| Complete drawer travel | +300 mm along Z |
| Drawer-only open envelope | 900 W × 775 D × 1200 H mm |

These are authored design dimensions. Displaying them does not measure the visitor's real furniture. The UI should call them example dimensions and record the seller's confirmation of this prepared data without pretending to infer scale from a scan.

### Coordinate contract

| Convention | Rule |
| --- | --- |
| CAD units | Millimetres |
| Export/runtime units | Metres |
| Runtime width axis | X |
| Runtime up axis | Y |
| Runtime front | Positive Z |
| Origin | Floor plane, centred on the full closed handle-inclusive footprint |
| Closed minimum | `[−0.45, 0, −0.2375]` m |
| Closed maximum | `[0.45, 1.2, 0.2375]` m |
| Left door pivot | `[−0.45, 0.5585, 0.2125]` m |
| Right door pivot | `[0.45, 0.5585, 0.2125]` m |
| Drawer slide | Translation parent with +Z travel |

The runtime's XYZ bounding-box lengths are 0.9 × 1.2 × 0.475 m. The consumer-facing W/D/H order is 0.9 × 0.475 × 1.2 m. Confusing these orders can create a misleading report or broken room fit. Scale conversion must occur exactly once.

### Assembly and moving parts

The physical part list contains side panels, top, bottom, back, divider, two shelves, four feet, two doors and handles, a full drawer assembly and handle, runners, and hinge proxies. The door parent nodes are `left_door_pivot` and `right_door_pivot`. The drawer parent is `drawer_slide`.

The drawer includes its fascia, basket sides, front, back, base, and handle. All these components move together. Door handles follow their doors. The scratch uses a local position anchored to the left-door pivot so it follows that door. The chip and ring use their respective stationary part references.

Hardware represents presentation geometry. The asset does not specify a real commercial hinge, runner, screw pattern, load rating, fastening method, or manufacturing tolerance. Do not use the cabinet as a fabrication drawing or structural design.

### Cosmetic evidence

| ID | Location | Authored extent | Representation | Interpretation boundary |
| --- | --- | --- | --- | --- |
| `scratch` | Left door | About 110 × 1 mm | Portable translucent surface detail tied to moving door | Visible example surface scratch, no material-depth diagnosis |
| `chip` | Upper front-right edge | About 8 × 5 × 1 mm | Small change to a CadQuery solid | Visible example chip, no structural-integrity diagnosis |
| `mark` | Top surface | About 55 mm diameter | Faint ring-shaped surface overlay | Neutral surface mark, no asserted cause such as water damage |

The overlays sit slightly above the surface to avoid flicker. Published physical dimensions exclude nonphysical wear layers. The clean material variant belongs to asset-development comparison, not to a seller-facing remove-defects action.

### Evidence-area mapping

The report uses nine canonical area IDs: `front`, `left`, `right`, `rear`, `top`, `interior`, `drawer`, `rear-lower`, and `underside`. The first seven form the old incomplete example. The rear-lower and underside areas remain missing in that example.

The documentation image mapping uses `capture-front`, `capture-left`, `capture-right`, `capture-rear`, `capture-top`, `capture-interior`, `capture-drawer`, and `capture-underside`. The rear-lower row uses the full rear render rather than a separately authored close-up. The interface should explain that limitation. Multiple front images do not substitute for a rear image.

Separate front-left and front-right renders support promotional and visual context. They do not expand the report to eleven area IDs. Wear close-ups use `wear-scratch`, `wear-chip`, and `wear-mark`. Keep display names, image keys, model part references, and condition IDs aligned.

### Room geometry

The reference room interior measures 3.2 m wide, 3.0 m deep, and 2.6 m high. Walls are 100 mm thick outside the interior, and the floor slab extends 50 mm below the floor plane. The front door aperture measures 800 × 2100 mm. The centred rear window aperture measures 1200 × 1000 mm with a 900 mm sill.

The current runtime constructs a procedural room so width and depth can change. The reference room's outer GLB bounds include walls, floor, and sill; use interior dimensions for placement. The interface can hide the nearest walls to expose the item while the evaluator retains all interior boundaries.

The door aperture is visual context. It does not establish that the cabinet passes through it. Delivery through corridors, stairs, elevators, and doors remains outside the placement check.

### Clearance algorithm and practical limit

The evaluator computes conservative physical-part boxes and samples the complete opening range. It checks closed-body fit first, door motion separately, and drawer motion separately. The doors use one-degree samples across the 100-degree range. The drawer uses sixty intervals across 300 mm, equivalent to 5 mm spacing.

An obstruction can intersect the door height band while leaving the drawer clear, or intersect the drawer band while leaving the doors clear. The runtime provides fixtures to demonstrate these differences. A cabinet can also cross a wall boundary. These scenarios support a product demonstration and regression tests.

The sampled envelope in the recovered asset record measures approximately 1092.6 W × 898.8 D × 1200 H mm. The farthest forward door extent occurs before the final open angle. Therefore checking only the final door pose would miss part of the sweep. The evaluator examines intermediate poses and restores the previously displayed transforms afterward.

The method is conservative and illustrative. Part boxes can report a tight placement blocked even when detailed geometry might clear it. Sampling does not prove that every possible between-sample contact is impossible. The result is not a certified continuous collision calculation, a site survey, a real dimension measurement, or a guarantee of usability in a furnished room.

## Previous implementation and recovered files

The previous website used Vite, modular JavaScript, CSS, Three.js, self-hosted Plus Jakarta Sans, browser tests, and Node state tests. Its main modules were `main.js`, `data.js`, `state.js`, `engine.js`, and `geometry.js`. It had a seller report builder but no capture session model. The seven studio chapters began with the finished model and progressed through condition, opening, dimensions, documentation, room placement, and clearance.

The old report schema is deliberately small: schema version, whitelisted asset ID, name, note, and documented view IDs. Shared links contain a validated snapshot in the URL fragment. Local storage holds a draft, saved reports, and saved placements. This static architecture avoids a backend for the demonstration while preserving a meaningful seller-to-buyer handoff.

Historical website verification recorded a successful production build, nine browser/geometry cases, seven state tests, desktop and phone screenshot review, a 320 px containment check, Unicode report sharing in a new browser context, geometry fixture distinctions, reduced motion, rapid chapter navigation, and honest model fallback. Those results describe the first package. The revision needs its own fresh verification.

The historical bounded review identified and addressed five concrete defects: saved fixture placements reset coordinates; studio links lost report context on reload; edited drafts left stale generated share links; documentation selections failed to synchronize model views/poses; and room-fit feedback lacked live status semantics. Those fixes form regression requirements for the redesign.

The recovered modeling source exists under a prior model package. Its historical validation recorded eight Python asset tests and seven asset-viewer browser tests. The source requirements included CadQuery 2.7.0, Trimesh 5.1.1, Mitsuba 3.9.1, NumPy, Pillow, and pytest. The website runtime does not need these Python tools. It consumes already exported assets.

The original light-wood material derives from an optimized copy of the user's uploaded texture 2, originally named `2.jpg`. The recovered brief describes a ten-image wood archive, each 5000 × 3500 pixels. It does not provide a recoverable licence grant or a current standalone archive identity in this handoff. Treat the material as user-supplied source content and do not fabricate an external stock attribution or wood-species classification.

## Revision architecture

The redesign preserves the Vite/static-site foundation and adds independent capture-session state and a spatial capture illustration. This keeps the competition prototype portable without introducing a backend, an expensive reconstruction pipeline, or unrelated account/commerce systems.

| Layer | Source | Responsibility |
| --- | --- | --- |
| Application shell | `src/main.js` | Routes, navigation, role perspective, connected screen state, explicit viewer modes, model integration |
| Mobile shell | `src/mobile.js` | Visual viewport height, workspace layout metadata and keyboard-aware sizing |
| Shared product views | `src/ui.js` | Consumer page templates, safe images/navigation, gallery, workspace and room controls |
| Capture views | `src/capture-ui.js` | Preparation, camera simulation, review and sharing templates |
| Studio views | `src/studio.js` | Ten chapter definitions, focused chapter controls and free exploration |
| Product content | `src/data.js` | Indonesian labels, conditions, images, chapter definitions, icon utilities |
| Visual system | `src/style.css` | Responsive consumer styling, workspace/capture/gallery layouts, viewer controls |
| Reports and storage | `src/state.js` | Exact report schemas, snapshots, safe text, draft/save/placement persistence |
| Viewer persistence | `src/viewer-state.js` | Validated scene snapshots and per-report guided/free session continuity |
| Capture/workspace | `src/capture.js` | Sample recording areas, session states, resumable items, archiving |
| Live 3D | `src/engine.js` | Cabinet loading, articulation, views, conditions, room and capture mode |
| Capture illustration | `src/capture-scene.js` | Authored room/phone/coverage checkpoints, simulated phone preview |
| Geometry | `src/geometry.js` | Procedural room bounds and sampled clearance evaluator |
| Exported assets | `public/assets/` | Stable cabinet GLB, manifest and condition/camera metadata |
| Image assets | `public/images/` | Evidence renders, transparent cabinet, warm room and capture previews |
| Rendering/capture scripts | `scripts/` | Regenerate consumer illustrations and review screenshots |
| Regression checks | `tests/` | State/capture and browser/geometry assertions |

`main.js` consumes capture and engine APIs rather than allowing capture state to depend on a DOM element or model renderer. `capture-scene.js` visualizes a phase and area but does not become the source of evidence truth. `capture.js` derives evidence coverage from captured area statuses. `state.js` validates the shared report independently of the current screen.

The same separation should survive future development. A user can review evidence without a successful WebGL load. A camera animation should not quietly mark an area captured. A model render should not prove a condition statement. Room checks should use known geometry rather than whatever a decorative illustration suggests.

### Routes and screen state

| Route | Initial screen and purpose | URL/local context |
| --- | --- | --- |
| `/` | Two-entry consumer home | Uses prepared room/capture imagery; does not load a cabinet engine immediately |
| `/platform` | Seller or buyer workspace | Seller lists local workspace items; buyer opens sample/saved reports or imports a link |
| `/buat?id=<captureId>` | Guided report creation | Resumes a known local session by ID; otherwise creates a safe new sample session |
| `/laporan#r=<snapshot>` | Buyer report | Reads validated report data; gallery/text remain available without 3D |
| `/studio?mode=guided#r=<snapshot>` | Guided capture-to-buyer studio | Explicit guide entrance; can carry the originating report snapshot |
| `/studio?mode=free#r=<snapshot>` | Direct free exploration | Explicit free entrance; the same report context and authored cabinet remain available |
| `/ruang#r=<snapshot>` | Illustrative placement | Carries report snapshot; room transform comes from current UI or a selected local save |
| `/tersimpan` | Saved reports and placements | Reads current origin's local lists |
| Unknown path | Useful not-found page | Offers a return to the platform |

History navigation uses pushState/popstate instead of full reload for internal links. Modifiers such as opening a link in a new tab should retain ordinary browser behavior. Full route refresh requires the host's SPA rewrite. The app reads the report snapshot at startup and on relevant history navigation.

The platform stores role, filter, and search as current UI variables. These variables are not authenticated account settings. Capture sessions persist their phase and active area. Studio mode, chapter, tool, room tab, selected illustrative recording area and tried sample images belong to a bounded viewer session. Guided and free scene snapshots are separate. Explicit query mode takes precedence when entering through a named mode link. Read the current v3 section for the final persistence contract. Saved room placements persist validated report and room data; the ordinary room URL does not contain a room-layout snapshot.

The buyer workspace supplies a visibly labelled seven-of-nine-area example when no shared or saved reports exist. This prevents an empty starting grid while preserving the distinction between a demonstration and the seller's actual local records.

The buyer report begins with image/evidence overview. Its detail views expose condition, documentation, and live 3D without requiring immediate WebGL creation for the initial gallery. The room and studio mount a live engine when their stage appears. Each render increments a token and disposes the prior engine. An async controller that completes after navigation disposes itself instead of attaching to the obsolete route.

`window.lihatDulu` exposes read-only getters for current `engine`, `report`, `room`, `capture`, and `studio` data to support browser verification and presentation debugging. Report/capture/room getters copy state. This diagnostic surface is not a remote API or a security boundary; do not place secrets in it.

### Buyer request for additional evidence

The buyer can open **Minta bukti tambahan**. The app composes a message naming missing documentation areas, or a general request for condition/size details if none are missing. The visitor can edit and copy the text, then send it themselves through their preferred channel.

The app does not send that message to a seller. It has no chat service, contact lookup, messaging integration, recipient address, or automatic outreach. Copying a request demonstrates a useful next action while keeping the competition prototype within the authorized frontend scope.

### Build metadata and scripts

The current package name is `lihatdulu-prototype` and version is `3.0.0`. V2 used version `2.0.0`. The package uses ES modules. Its declared dependencies include Three.js `^0.186.1`, Vite `^8.3.2`, Plus Jakarta Sans variable font `^5.3.0`, and Playwright test `^1.63.0`. The Chromium test helper dependency declares `^153.0.0`. The lockfile determines the exact installed versions for reproducible `npm ci`; do not assume a caret range identifies a future install without a lockfile.

| npm script | Declared command | Purpose |
| --- | --- | --- |
| `dev` | `vite --host 127.0.0.1` | Local source server |
| `build` | `vite build` | Static production build |
| `preview` | `vite preview --host 127.0.0.1` | Review the production build |
| `test` | `playwright test` | Integrated browser and geometry checks |
| `test:unit` | `node --test` with the explicit test files in `package.json` | Report/capture state plus v3 viewer, placement-preview and template contracts |
| `capture` | `node scripts/capture.js` | Desktop/mobile preview captures |

`vercel.json` sets framework `vite`, build command `npm run build`, and output directory `dist`. It rewrites client paths to `index.html`. It also sends `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and `X-Frame-Options: DENY`. These headers provide basic browser behavior; they do not replace input validation, report access control, or a complete production security policy.

### Live engine controller

`createEngine(container, {onCondition,onPlacement,onInteraction,onLoadProgress})` asynchronously loads the cabinet GLB and the two JSON metadata files. It returns a controller after setup. A model or WebGL failure throws so the UI can select a static fallback. The container owns a responsive canvas and DOM markers/labels.

| Method or field | Signature / type | Meaning |
| --- | --- | --- |
| `ready` | Boolean true | Engine completed initialization |
| `setView` | `(preset='overview', instant=false)` | Change camera preset; interior/drawer presets can set the corresponding opening pose |
| `selectCondition` | `(id|null)` | Select scratch/chip/mark and focus real anchor, or clear selection |
| `setStorage` | `(openBoolean)` | Set both doors and full drawer to open/closed targets |
| `setMotion` | `(kind,value)` | Left/right use 0–100 degrees; drawer uses 0–0.3 metres |
| `setDimensionsVisible` | `(boolean)` | Show authored dimension lines and labels outside capture mode |
| `enterRoom` | `(roomState?)` | Enter editable placement and evaluate current room |
| `leaveRoom` | `()` | Leave placement and reset model transform to inspection context |
| `setRoom` | `(patch)` | Update bounded dimensions/position/rotation/fixture without discarding saved transforms |
| `setFixture` | `('clear'|'door'|'drawer'|'wall')` | Choose an intentional scenario and its demonstration placement |
| `setCaptureScene` | `({phase,area,progress})` | Enter authored room/phone capture context |
| `leaveCaptureScene` | `()` | Remove capture context and return to inspection |
| `resetCamera` | `()` | Reset camera according to active capture/room/inspection mode |
| `getState` | `()` | Copy runtime state for UI/testing |
| `captureViewState` | `()` | Capture a validated JSON-safe scene snapshot for mode/session continuity |
| `restoreViewState` | `(snapshot)` | Restore a valid scene snapshot; Boolean result signals accepted input |
| `zoomBy` | `(factor)` | Apply a bounded camera-distance change through the controller |
| `capturePlacementPreview` | `()` | Return a bounded WebP image of the actual room/cabinet for a local save |
| `dispose` | `()` | Stop events/animation and free renderer/scene resources |
| `model`, `manifest`, `report` | Runtime asset references | Model and asset metadata for integration/verification |
| `camera`, `controls`, `scene`, `renderer` | Three.js objects | Exposed runtime references; avoid changing them casually from product UI |

`onCondition` receives an ID or null. `onPlacement` receives `{state,result}`, with a copied room state and `{closedFits,doorsClear,drawerClear,conflicts}`. `onInteraction` reports manual scene interaction. In v3 it must not switch the studio mode; mode changes come from explicit guided/free controls. `onLoadProgress` reports a fraction when known, or null for an indeterminate loading stage. The controller guards late callbacks with the current render token.

`getState()` returns `roomState`, `condition`, `motions`, `view`, `dimensionsVisible`, `inRoom`, `captureScene`, and `camera`. Camera is a position array. The capture state is `{active,phase,area,progress}`. Motion values describe target degrees/metres, while an animation can still be moving toward them. Tests that need exact displayed transforms should inspect the nodes after the animation settles, or use reduced motion.

### Capture-scene phases and mode transitions

Capture-scene phases differ from session phases. The engine accepts `prepare`, `exterior`, `interior`, and `review`. The session accepts `prepare`, `capture`, `review`, and `ready`. The UI maps recording areas to exterior/interior engine phases. Do not pass session `capture` directly and expect the engine to recognize it; unsupported phase values normalize to prepare.

The scene accepts the known camera areas plus rear-lower, underside, and the three detail IDs. Progress normalizes to 0–1. It represents the illustrative coverage indicator; it does not measure photo quality. The external-capture scene keeps the cabinet stationary and closed. Only the separate interior phase opens the doors and drawer.

Entering capture hides the placement room and fixture, ends floor dragging, clears selected condition, suppresses dimension labels and hotspots, returns the cabinet to origin/zero rotation, disables manual orbit for the guided spatial shot, and sets the phone's area pose. Selecting an ordinary view or entering placement deactivates capture. Leaving capture resets moving parts and restores inspection controls.

The authored capture room measures 4.8 × 4.8 × 2.6 m. It differs from the editable placement room's default 3.2 × 3.0 × 2.6 m. That capture-room size is illustrative staging, not a promised minimum space requirement for real scanning. Decorative art, plant, trim, and procedural floor create context without becoming placement obstacles.

The generic phone measures approximately 11.5 cm wide, 23 cm high, and 1.1 cm thick before bevels. This larger illustration improves readability. It supersedes the older model brief's optional 76 × 9 × 158 mm phone proposal. The runtime phone does not represent a manufacturer device or guarantee screen-scale accuracy.

A secondary PerspectiveCamera renders the same authored scene into a 384 × 480 render target. The phone's screen combines that preview with a canvas-drawn capture interface, instructions, progress, shutter graphic, and explicit simulation label. The screen uses no media stream. The renderer hides the phone and checkpoints during the preview pass to avoid recursive phone images.

Six floor checkpoints and a dashed coverage arc illustrate recording progress. They do not replace the nine canonical report areas. The checkpoints change colour with progress; the evidence states remain in the capture session. The phone position/quaternion transitions use a replaceable 650 ms easing. Preview updates throttle to roughly ten frames per second while idle and update during movement. The main viewer continues to render independently.

Capture camera framing expands for portrait viewports. A ResizeObserver updates renderer dimensions and the active capture framing. Reduced motion immediately applies the target phone and camera pose. A rapid phase/area request replaces the previous phone transition and camera target. Disposal frees the render target, phone/room geometries, generated textures, materials, and scene group.

### Studio chapter contract

`src/studio.js` defines ten chapters in this revision:

1. **Siapkan barang:** establish lighting, accessible sides, stationary cabinet, and the phone in the room.
2. **Rekam bagian luar:** select exterior areas and record sample images.
3. **Lihat sampai ke dalam:** show open doors/drawer and separate interior documentation.
4. **Tinjau hasil rekaman:** inspect prepared evidence and compare seven/nine-area example coverage.
5. **Periksa detail kondisi:** focus the three authored wear locations.
6. **Periksa ruang penyimpanan:** control doors and drawer through their real moving hierarchy.
7. **Konfirmasi ukurannya:** show the authored closed dimensions.
8. **Lihat sebagai pembeli:** preview/open the same report context.
9. **Coba di ruangmu:** adjust the illustrative room and placement.
10. **Periksa ruang bukanya:** compare body, door, and drawer outcomes, including saved placement.

The studio uses separate illustrative capture interactions. Recording a sample image in the studio shows that interaction without silently modifying the seller workspace session. The seven/nine-area coverage comparison changes only the review chapter's temporary preview context. It never modifies the underlying imported report or the subsequently opened/shared buyer evidence. The UI labels those controls **Contoh 7 area / Contoh 9 area** and explains the isolation. The platform capture workflow remains the persistent seller record. Keep this distinction visible if future revisions connect the studio directly to a local draft.

The 3D phone shutter is part of the screen artwork and has no independent hit target. Use the HTML chapter action to record a sample image. Free exploration exposes standard model controls and exits the guided capture composition. The visitor can then return to the active chapter.

### Standard camera and room lifecycle

Standard camera transitions use 650 ms easing. Standard part motion uses 500 ms easing. New requests replace prior transitions for each controlled element. Orbit-start cancels the guided camera move. V2 switched inspection chapters 3–7 into free mode on manual interaction. V3 replaces that rule: orbit-start still cancels a moving camera, but it keeps the chosen mode. Guided room controls remain in placement chapters 8–9, where manual placement is the chapter's intended task. Returning to either mode restores that mode's setup rather than implying that a gesture was a mode-selection command.

The engine uses a hemisphere light, key/fill directional lighting, shadows, and ACES filmic tone mapping. It caps device pixel ratio at two. The inspection floor acts as a shadow surface. The room's near walls hide according to camera position without changing collision bounds.

`setRoom` clamps supported numeric values, updates room geometry only when width/depth change, configures a changed fixture without resetting x/z/rotation, then evaluates. `setFixture` deliberately applies a scenario placement. That distinction fixes the original saved-placement regression: restoring a saved fixture must not reapply the scenario's default transform.

Floor dragging uses a raycast against the item and a horizontal floor plane. It manages pointer capture and supports pointerup/pointercancel. The UI's directional controls provide a non-drag alternative. Room evaluation restores door/drawer transforms in a `finally` path after sampling so the visible pose does not jump because a clearance check ran.

### New image inventory and regeneration

| File | Pixel dimensions | Bytes at revision handoff | Source |
| --- | --- | ---: | --- |
| `public/images/room-cabinet-hero.webp` | 1600 × 1150 | 101,442 | Unchanged cabinet GLB, closed, in original warm room composition |
| `public/images/room-cabinet-detail.webp` | 1000 × 1100 | 81,830 | Same cabinet, left door 22° and drawer 0.09 m open |
| `public/images/studio-capture-scene.webp` | 1600 × 1000 | 47,718 | Actual runtime capture scene, prepare/front/zero progress |

`node scripts/render-scene-assets.js` renders the first two consumer scenes. `node scripts/render-capture-preview.js` renders the runtime studio preview. The scripts load the real cabinet and create original room props and procedural canvas textures. They do not import competitor images or the supplied Photoshop mockups. `docs/asset-provenance.md` gives the exact rendering method and exclusions.

The render scripts use Chromium/WebGL through a local server, capture WebP directly from the canvas, and close the browser/engine. The studio-preview script serves a temporary dedicated page through Vite middleware rather than replacing application markup. New scene dimensions and bytes can change after regeneration, so refresh the inventory when changing cameras or export quality.

## Historical v2 final verification

The capture/state implementation passed twenty-one unit cases. The consumer scene render stage successfully generated and visually inspected all three new images. Isolated capture-engine verification checked its six desktop compositions, portrait behavior, mode transitions, hidden overlays, stationary model, reduced motion, and disposal without browser JavaScript errors.

An independent browser workflow check passed captured/skipped/retake persistence and reload; a fresh buyer link preserved the documented subset, edited condition note, and dimension-confirmation flag; the missing-evidence request produced a local draft; body/door/drawer outcomes and exact saved placement restoration remained distinct; rapid studio switching retained one canvas and coherent modes without page errors. This bounded check does not constitute a full security or all-device audit.

Source review found that the room breadcrumb passed the user-entered report name into an HTML-capable navigation label without escaping it. The implementation corrected that call with `esc(report.name)` and added a regression. An inert local sentinel demonstrated the failure before correction; the final passing browser suite includes the corrected report-name behavior. Another regression isolates studio seven/nine-area previews so they cannot overwrite an imported buyer report's evidence. These are bounded fixes, not a claim of complete security certification.

### V2 final integrated verification, 3 October 2026

| Check | Result | Scope |
| --- | --- | --- |
| `npm run test:unit` | 21 passed, 0 failed | Eleven report/storage cases and ten capture/workspace cases |
| `npm test` | 15 passed, 0 failed | Twelve app workflows and three geometry/live-engine cases; final run took about 36.6 seconds |
| `npm run build` | Passed | Vite production bundle; runtime source remained unchanged after the recorded build |
| Capture engine isolated check | Passed | Six desktop compositions, portrait resize, modes, motion, hidden overlays and disposal |
| New scene image generation | Passed | Three authored WebP images generated and visually inspected |
| Responsive CSS pass | Passed | Thirty-five route/viewport combinations spanning 320–1440 px, without page-level horizontal overflow |
| Independent product/visual QA | No blocking finding | Twenty-four page/phase cases at 1440, 390 and 320 px; no overflow, broken loaded images or page errors |
| Independent workflow QA | Passed | Resume, missing/retake evidence, fresh sharing, request draft, room restore and rapid studio switching |
| Exporter Python syntax | Passed | `py_compile` for the revised texture-fallback exporter; no fresh geometric regeneration |

The production build records the lazy 3D chunk at approximately 691.27 kB before gzip and 177.43 kB gzipped. The main app chunk measures approximately 71.28 kB before gzip and 22.63 kB gzipped. CSS measures approximately 70.38 kB before gzip and 14.26 kB gzipped. These build sizes describe historical v2, not v3 or download timing on a physical device. Vite's size advisory is a nonblocking warning. The homepage and gallery do not need to eagerly instantiate the 3D scene.

The checks run in Chromium with software WebGL in the execution environment. They do not establish physical-device performance, Safari behavior, every assistive-technology announcement, real capture quality, production-backend security, customer demand, or market size. The historical eight Python model tests remain a separate earlier record. The current source pack includes reviewed copied exports and a syntax-checked fallback; it does not claim a fresh CadQuery/Mitsuba regeneration.

Preview generation produced twenty screenshots with no JavaScript page errors. The capture script waits for fonts, forces below-the-fold images to load, verifies page width, and captures the actual app. Desktop uses 1440 × 1000 and phone uses 390 × 844, with device pixel ratio one and reduced motion. `previews/verification.json` records the generated timestamp, viewport settings, screenshot names, and error list. The final run corrects an example note to name the upper-right chip consistently.

### Bundled preview inventory

| File under `previews/` | View |
| --- | --- |
| `home-desktop.png` | Image-led two-entry home |
| `platform-desktop.png` | Seller items and task states |
| `buyer-workspace-desktop.png` | Buyer entry and report example |
| `capture-prepare-desktop.png` | Preparation, name, owner note and guidance |
| `capture-recording-desktop.png` | Simulated camera and area checklist |
| `capture-review-desktop.png` | Evidence review, missing areas, notes and confirmation |
| `capture-share-desktop.png` | Snapshot sharing and buyer handoff |
| `report-desktop.png` | Gallery-led buyer overview |
| `report-condition-3d-desktop.png` | Live cabinet with condition focus |
| `room-desktop.png` | Configurable placement and separate results |
| `room-door-clearance-desktop.png` | Door-only obstruction example |
| `studio-desktop.png` | Room and phone preparation context |
| `studio-capture-desktop.png` | Exterior recording composition |
| `studio-interior-desktop.png` | Open-cabinet interior recording composition |
| `home-mobile.png` | Two entrances on a phone |
| `platform-mobile.png` | Phone seller workspace |
| `capture-recording-mobile.png` | Phone capture flow |
| `report-mobile.png` | Phone evidence/decision report |
| `studio-mobile.png` | Phone guided studio |
| `studio-room-mobile.png` | Phone room-placement chapter |
| `verification.json` | Machine-readable screenshot-generation record |

These previews document the prepared dataset and simulated recording. Their static room illustrations do not prove real furniture capture or placement. A screenshot does not replace the app's editable interaction; use the website for the judging walkthrough.

### Prebuilt production smoke check

An independent smoke check served the actual `dist/` build on a local preview server. All seven direct routes returned HTTP 200 and survived refresh. The font, cabinet GLB, and metadata loaded successfully. Studio and room models appeared, doors reached 100 degrees, the drawer reached 30 cm, dimensions/rear view worked, and the door-obstruction scenario kept body fit distinct from blocked opening.

A one-area Unicode capture generated a report for a fresh mobile buyer. The buyer retained eight missing areas and the dimension-confirmation flag after reload. The check recorded zero JavaScript page errors, console errors, failed requests, or external HTTP(S) requests. These results support the prebuilt source handoff. They do not claim a deployment to a Vercel account, a real camera scan, or an offline service-worker implementation.

`docs/release-verification.md` records the historical v2 release unless a new explicitly labelled v3 appendix is added. The current v3 record is `docs/v3-release-notes.md` and the current v3 verification section below. It distinguishes executed redesign checks from historical model verification and contains the final packaging appendix. The final archive passes CRC integrity, complete file readback, required-file inclusion and excluded-content checks. Its standalone master Markdown matches the copy in the ZIP byte for byte. All copied public assets match the prebuilt `dist/` assets. The package contains 140 files, including twenty preview PNGs, with no dependency folders, transient QA evidence, raw licensed references or Python bytecode.

## Report, capture, workspace, and persistence contracts

### Report schema version 1

Legacy links remain valid. Version 1 accepts exactly these fields:

```json
{
  "schema": 1,
  "asset": "cabinet-01-v1",
  "name": "Lemari Kayu Sora",
  "note": "Dipakai di ruang kerja. Silakan periksa tiga detail kondisi yang ditandai.",
  "views": ["front", "left", "right", "rear", "top", "interior", "drawer"]
}
```

`freshReport()` returns a fresh copy with an independent views array. The legacy default contains seven documented areas. Do not change it to a complete report as a convenience, because old fallback behavior and regression tests rely on the declared missing coverage.

### Report schema version 2

Version 2 adds condition notes and dimension confirmation. It still accepts only the cabinet asset and canonical view IDs:

```json
{
  "schema": 2,
  "asset": "cabinet-01-v1",
  "name": "Lemari Kayu Sora",
  "note": "Catatan pemilik contoh.",
  "views": ["front", "left"],
  "conditionNotes": [
    {"id": "scratch", "note": "Goresan memanjang pada pintu kiri."},
    {"id": "chip", "note": "Serpihan kecil pada sudut kanan atas."},
    {"id": "mark", "note": "Bekas lingkaran samar pada panel atas."}
  ],
  "dimensionsConfirmed": false
}
```

`freshEditableReport()` returns schema 2 with the legacy default view set, the three default condition descriptions, and `dimensionsConfirmed: false`. A new capture explicitly overrides that view set to an empty array. Supplying a legacy report to capture upgrades its editable representation to version 2 without changing its documented areas.

Dimension confirmation means the user has reviewed the authored example dimensions. It does not claim camera-based measurement. Condition notes refer to the three fixed example features. Version 2 does not accept arbitrary uploaded image URLs, new condition IDs, custom geometry, HTML fragments, external scripts, binary media, or additional nested metadata.

### Report validation rules

| Field or input | Rule |
| --- | --- |
| Root | Plain object with exactly the schema's known keys |
| Schema | Integer value 1 or 2 |
| Asset | Exact `cabinet-01-v1` |
| Name | String, trim outer whitespace, 1 to 80 UTF-16 code units after trimming |
| Owner note | String, at most 1200 UTF-16 code units |
| Unicode | Reject unpaired surrogate code units |
| Views | Array of at most 9 known IDs, no duplicates |
| View ordering | Normalize to the canonical `VIEW_IDS` order |
| Condition notes | Schema 2 only, array of at most 3 exact `{id,note}` objects |
| Condition ID | `scratch`, `chip`, or `mark`, without duplicates |
| Condition note | At most 600 UTF-16 code units, valid Unicode |
| Dimension confirmation | Schema 2 only, Boolean |
| Schema-2 serialized size | At most 9000 UTF-8 bytes |
| Encoded input | Nonempty base64url alphabet, at most 12000 characters |
| UTF-8 decoding | Fatal decoding, so invalid byte sequences do not silently become replacement characters |
| Canonical payload | Decoded report must re-encode to exactly the supplied payload |

String-length bounds use JavaScript string length. An emoji can use two UTF-16 code units, while the serialized byte cap uses UTF-8. The byte cap protects the full link rather than assuming every character has one byte. These limits are part of the static-sharing contract and should not disappear when changing UI maxlength attributes.

### State-module exports

`src/state.js` supplies constants and report utilities:

- `VIEW_IDS`: frozen canonical area list.
- `CONDITION_IDS`: frozen `scratch`, `chip`, and `mark` IDs.
- `DEFAULT_REPORT`: frozen legacy example metadata.
- `freshReport()`: independent legacy report.
- `freshEditableReport()`: independent editable version-2 report.
- `validateReport(value)`: returns normalized report or throws an Indonesian validation error.
- `encodeReport(report)`: validates and creates Unicode-safe, unpadded base64url JSON.
- `decodeReport(encoded)`: enforces bounded, canonical, strict decoding and returns normalized report.
- `makeReportURL(report, base)`: builds an absolute `/laporan#r=…` URL on the supplied origin.
- `readReportURL(input)`: returns `{report,error}` and recovers to the legacy sample if a snapshot is malformed.
- `escapeHTML(value)`: escapes ampersand, angle brackets, double quotes, and single quotes.
- `storageAvailable()`: probes durable storage availability.
- `loadDraft()` and `saveDraft(report)`: legacy draft support.
- `loadSavedReports()` and `saveReport(report)`: bounded, deduplicated saved reports.
- `loadPlacements()` and `savePlacement({report,room,preview?,fit?})`: bounded saved room placements, with legacy report/room/savedAt compatibility and optional v3 actual scene preview/result summary.
- `removeSavedReport(index)` and `removePlacement(index)`: remove a valid integer list position.
- `readLocalRecord(name)` and `writeLocalRecord(name,value)`: shared storage access for the bounded `workspace` and `viewer` records only; unrecognized names return null/false.
- `clearLocalData()`: clears this application's stored records and memory fallback, not unrelated browser data.

Write helpers return success for a valid in-memory save even if durable browser storage fails. Use `storageAvailable()` to communicate persistence limits. A Boolean success result is not evidence that a draft will survive closing the browser.

### Capture-session schema

`src/capture.js` owns guided sample capture. A session accepts exactly:

```json
{
  "schema": 1,
  "id": "cap-example-session",
  "createdAt": "2026-10-03T00:00:00.000Z",
  "updatedAt": "2026-10-03T00:00:00.000Z",
  "phase": "capture",
  "activeArea": "front",
  "report": {
    "schema": 2,
    "asset": "cabinet-01-v1",
    "name": "Lemari Kayu Sora",
    "note": "Contoh perekaman.",
    "views": ["front"],
    "conditionNotes": [],
    "dimensionsConfirmed": false
  },
  "areas": {
    "front": "captured",
    "left": "pending",
    "right": "retake",
    "rear": "skipped",
    "top": "pending",
    "interior": "pending",
    "drawer": "pending",
    "rear-lower": "pending",
    "underside": "pending"
  }
}
```

The permitted phases are `prepare`, `capture`, `review`, and `ready`. The permitted area statuses are `pending`, `captured`, `skipped`, and `retake`. Only `captured` enters the report's `views`. Both skipped and retake states therefore remain missing in the buyer snapshot. The session preserves their different meanings for the seller.

IDs use lowercase letters, digits, and hyphens, beginning with a letter or digit, with 4 to 81 total characters under the implementation's regular expression. Timestamps must parse as dates and normalize to ISO strings. The session's areas object contains exactly the nine known IDs. It cannot introduce an arbitrary view.

`markArea` returns a validated new session. It does not mutate the original object. Changing an area from a completed/ready state returns the session to capture. The UI remains responsible for choosing when to set review or ready phase and for saving that transition.

### Capture-module exports

| Export | Signature | Behavior |
| --- | --- | --- |
| `CAPTURE_AREAS` | Frozen array of `{id,label,image,group,hint}` | Describes the canonical capture areas, instructions, and prepared image keys |
| `createCapture` | `createCapture(report?)` | Creates a new unsaved session with a distinct ID; no argument starts with zero documented areas |
| `loadCapture` | `loadCapture(id?)` | Loads the requested valid session, or the current session; returns `null` when absent or invalid |
| `saveCapture` | `saveCapture(session)` | Validates and atomically saves session plus its workspace card; makes it current |
| `markArea` | `markArea(session,id,status)` | Accepts captured, skipped, or retake; returns new session or throws for invalid choices |
| `captureReport` | `captureReport(session)` | Returns normalized version-2 report with captured-only views |
| `listWorkspace` | `listWorkspace()` | Returns valid, nonarchived workspace items |
| `upsertWorkspace` | `upsertWorkspace(item)` | Validates card and synchronizes its linked session when present |
| `archiveWorkspace` | `archiveWorkspace(id)` | Marks a known active item hidden/archived and persists the change; visible action says Sembunyikan |
| `workspaceSummary` | `workspaceSummary(item)` | Returns label, next action, progress percentage, captured count, and missing IDs |

The interior and drawer belong to the `interior` instruction group. The other areas belong to `exterior`. Those group names organize guidance; they do not declare a category of inspection certainty. Underside guidance explicitly allows an undocumented status rather than suggesting unsafe physical handling.

### Workspace schema and seeded examples

A workspace item contains exact fields: `id`, `report`, `captureId`, `status`, `isSample`, `archived`, `createdAt`, and `updatedAt`. Status accepts `not-started`, `capturing`, `review`, or `shared`. `captureId` points to a known session or can be null. The flags are Boolean.

The initial workspace supplies three separate scenarios of the same cabinet:

| ID | Initial state | Capture evidence | Purpose |
| --- | --- | --- | --- |
| `sample-new` | Prepare / not started | No captured areas | Demonstrate starting documentation |
| `sample-capture` | Capture / in progress | Front and left captured; right marked retake | Demonstrate continuing an incomplete recording |
| `sample-review` | Review | First seven areas captured; rear-lower and underside skipped | Demonstrate reviewing and sharing incomplete evidence |

These are not three different real cabinets. Their labels identify workflow scenarios. The workspace uses **Sembunyikan** for hiding a local report rather than implying a complete archive-management destination. Each owns a separate session so changing one does not overwrite another. A new user session receives its own ID and workspace card. Archiving a sample should survive reload rather than causing the initializer to recreate it on every visit.

The summary maps states to Indonesian labels and next actions. `not-started` becomes **Belum direkam / Mulai rekaman**. `capturing` becomes **Rekaman belum lengkap / Lanjutkan rekaman**. `review` becomes **Perlu ditinjau / Tinjau laporan**. `shared` becomes **Siap dibagikan / Lihat laporan**. Progress derives from captured areas divided by nine. It describes documentation count, not scan accuracy or a quality score.

### Storage model

| Key | Contents |
| --- | --- |
| `lihatdulu:draft:v1` | Legacy draft report |
| `lihatdulu:saved:v1` | Saved report list |
| `lihatdulu:placements:v1` | Saved placement list |
| `lihatdulu:workspace:v1` | Atomic capture/workspace envelope |
| `lihatdulu:viewer:v1` | Bounded per-report guide/free viewer sessions |

The workspace envelope accepts `schema:1`, `currentId`, `items`, and `sessions`. Saving the session and card in one envelope prevents a partially written relationship across separate keys. The lists cap at twenty records. The envelope drops duplicate IDs, rejects malformed rows, and removes sessions that no retained item references. A malformed envelope yields an empty safe state rather than executing content or creating arbitrary records.

Saved reports deduplicate by canonical encoded snapshot. Legacy placements contain `{report,room,savedAt}`. V3 permits validated optional `preview` and `fit` fields; see the current v3 contract. Missing optional fields remain valid for old local saves. Their timestamps normalize to ISO strings. The placement validator accepts a room with exact `width`, `depth`, `x`, `z`, `rotation`, and `fixture` fields. Width ranges from 1.2 to 10 m, depth from 1 to 10 m, x/z from −10 to 10 m, rotation from −180 to 180 degrees, and fixture from `clear`, `door`, `drawer`, or `wall`. Reject nonfinite numbers.

The browser origin owns durable local data. Localhost, a Vercel preview URL, and a production domain each have separate stores. Clearing browser data or using a new browser removes access to local drafts and saves. A share link can carry its report to another browser, but it does not carry local capture-session history or saved room layouts.

## Sharing, input safety, and privacy boundaries

The report link encodes bounded JSON in a URL fragment. A fragment normally remains client-side during an HTTP request, but it is not encrypted or access controlled. Anyone who receives the full link can read the report contents. A user can copy it, forward it, record it in browser history, or include it in a screenshot. Use demonstration notes rather than personal information.

A shared link is immutable by construction: it contains a snapshot, not a database report ID. Changing a draft creates different data and requires a new link. Old links continue to contain old text and coverage. There is no remote revocation, owner authentication, expiry, permission list, audit trail, or live update service.

The import flow reads report data rather than navigating to an arbitrary supplied external page. A URL that looks external should not give that origin authority over application code. The parser recognizes only the whitelisted report contract. The renderer escapes user text before inserting HTML and uses text-safe assignments where possible.

The validation boundary matters even in a competition demo. Names and notes can contain strings that look like HTML. Those strings should remain literal text. A malformed, oversize, unknown-schema, duplicate-parameter, or invalid-Unicode snapshot should recover to a readable sample report with an Indonesian error. It should not crash navigation or silently accept untrusted fields.

The prototype has no backend APIs, secret keys, payment endpoints, authentication credentials, or camera-photo uploads. Do not add production secrets to a client-side Vite build. If a future service introduces uploads or accounts, it will need new access-control, retention, consent, and data-processing decisions. The existing static validation is not a complete security design for that service.

## What actually works and what remains a simulation

| Capability | Current nature | Honest description |
| --- | --- | --- |
| Page navigation and role perspectives | Functional frontend | Operate seller and buyer interfaces |
| New/continued capture sessions | Functional local state | Start or resume a sample documentation workflow |
| Capture button and coverage progress | Simulated imagery, functional state | Record prepared example evidence, not camera media |
| Retake and skip | Functional state | Exclude rejected or inaccessible area evidence from report |
| Prepared model reveal | Simulation | Show an authored model after a sample capture story |
| Condition evidence | Authored images and geometry | Inspect three illustrative cosmetic features |
| Condition-note editing | Functional bounded text | Supplement fixed examples with seller statements |
| Dimension confirmation | Functional Boolean | Confirm reviewed example dimensions, not measured real dimensions |
| Model orbit, zoom, camera views | Functional WebGL | Explore the exported cabinet |
| Doors and drawer | Functional model articulation | Open defined virtual moving groups |
| Dimension overlay | Functional example display | Show authored dimensions |
| Report sharing | Functional static snapshot | Transfer report text and whitelisted evidence IDs in a URL |
| Workspace/saved items | Functional local persistence with fallback | Store records in current browser or current session memory |
| Room size, movement, rotation | Functional frontend controls | Manipulate illustrative geometry |
| Body/door/drawer clearance | Functional sampled calculation | Check the authored model against illustrative room bounds and fixtures |
| Phone prop and camera transitions | Authored demonstration | Visualize how future capture could work |
| 3D failure imagery | Functional fallback | Continue reading evidence without computing clearance |
| Live camera access | Not implemented | No camera permission or recording of a physical item |
| Photogrammetry or reconstruction | Not implemented | No model generated from visitor photographs |
| AI damage detection or grading | Not implemented | No inferred condition score or hidden-defect diagnosis |
| Remote media/report storage | Not implemented | No cloud uploads or cross-device draft sync |
| Authentication and verified identity | Not implemented | Role selector is a demonstration perspective |
| Commerce and logistics | Not implemented | No payment, checkout, delivery booking, or verified transaction |

The simulation boundary should appear where people act, not only in the README. Appropriate labels include **Simulasi perekaman**, **Data contoh**, **Gambar demonstrasi**, and **Ukuran contoh**. Keep them clear without placing implementation details in every product instruction.

## Asset provenance and licensing

The cabinet geometry, procedural room, capture phone prop, and new scene arrangements belong to the authored prototype pipeline. The cabinet GLB's SHA-256 is `18cf94f5d342f9949d5b100bde3968dfc14b1746c3cb47570cf930ab55c9d742`. That hash identifies the reused cabinet bytes and helps detect accidental geometry changes during a visual-only revision.

Existing Mitsuba renders come from the cabinet mesh and prepared wood material. New consumer scene images use authored Three.js room props and the same cabinet. They are actual rendered model scenes, not stock photographs of inspected furniture and not independent evidence of an item's condition.

The uploaded Mobbin screenshots and Envato source files act as design references. The website does not require their original ZIPs at runtime. Do not bundle competitor screens, Photoshop source mockups, UI-kit files, or paid downloadable assets in the public deployment merely because the user supplied them. Refer to the applicable asset licence before any later redistribution or presentation use.

Three.js and Vite use MIT licences. Plus Jakarta Sans uses the SIL Open Font License. The repository's `THIRD_PARTY_LICENSES.txt` preserves bundled dependency notices and the font licence. Test dependencies do not run in the browser, but their licences remain relevant to the source/package environment. Do not replace the full notice file with a short informal attribution.

The project package metadata uses its existing licence field. That field does not override third-party licences or establish an unrestricted licence for user-supplied textures. Treat each source according to its provenance. No trademark endorsement follows from naming Airbnb, GoPang, ReGenCity, IKEA, Turo, Bird, Mobbin, or Envato as references.

## Local development and deployment operations

### Runtime prerequisites

Use Node.js 22.12 or later. Node 24 provides a suitable development target. The project uses npm and the included lockfile. Install the locked dependencies with `npm ci` from the folder containing `package.json`.

Do not double-click `index.html` to run the source. ES modules, fetch requests, assets, and client routes require an HTTP origin. The older model package's single-file asset preview has different behavior and should not be confused with this Vite application.

### Core commands

```sh
npm ci
npm run dev
```

Open the URL printed by Vite. The development script binds to 127.0.0.1. To view the site from a separate device, adjust the host setting intentionally and use an appropriate local network address. Avoid making the development server publicly accessible as an accidental substitute for deployment.

```sh
npm run build
npm run preview
```

The build writes `dist/`. The preview command serves that production output. The ZIP includes a prebuilt copy for handoff, but rebuild after changing source. Do not edit generated hashed JavaScript in `dist/assets/` as the main source of truth.

```sh
npm run test:unit
npm test
npm run capture
```

The exact scripts in `package.json` remain authoritative. Unit tests cover report/capture state. Browser tests cover the connected journey, engine behavior, and responsive conditions. Screenshot capture records viewports and model imagery. An additional scene-render script produces the authored consumer illustrations.

### Vercel deployment

Extract the ZIP first. Choose the folder containing `package.json` as the Vercel project root. Do not choose the outer download folder if it merely contains this project directory, and do not choose `docs/` or `public/` as the root.

For Git import:

1. Place the extracted project in a repository you control.
2. Import it into Vercel.
3. Select the Vite framework preset.
4. Use `npm run build` as the build command.
5. Use `dist` as the output directory.
6. Deploy and inspect a preview.
7. Verify direct route refresh, not only navigation from the homepage.

For the Vercel CLI:

```sh
npx vercel
```

Follow the account and project prompts. After reviewing the preview deployment, publish only when the user wants an external release:

```sh
npx vercel --prod
```

No environment variables, API keys, databases, paid runtime services, or uploaded reference packages are required for this static demonstration. The included `vercel.json` routes client paths to the application. All report/image/model asset URLs need to remain accessible from the deployment root.

The current handoff does not claim an external Vercel deployment. A Vercel-ready ZIP means the project contains the configuration and build materials for deployment, not that it has been published to a particular account or domain.

### Browser-test prerequisites

The Linux environment uses packaged Chromium when available. On macOS or Windows, install a compatible Playwright Chromium with `npx playwright install chromium`, or set `CHROMIUM_PATH` to an installed compatible executable as the test helper permits. The test browser does not ship into the client application.

Chromium software rendering validates WebGL behavior in the build environment. Physical phones, Safari, hardware GPUs, thermal limits, touch latency, memory pressure, and browser extensions can behave differently. Avoid saying “works on all devices” based only on viewport tests.

### Regenerating the parametric model source

`model-source/` preserves the editable CadQuery and Mitsuba pipeline. It is a development handoff, not a runtime requirement. The existing exported cabinet already runs in the website without installing Python libraries.

From `model-source/`, a developer can use the included optimized texture:

```sh
python -m pip install -r requirements.txt
python cad/export_asset.py
python cad/render_previews.py
python -m pytest -q
```

The exporter first checks its supplied/default source directory for `2.jpg`. If the original source exists, it prepares an optimized copy. Otherwise it reuses the bundled `asset-viewer/public/assets/textures/wood-light.jpg`. It fails with a clear missing-input error only if neither input exists. This revision preserves the actual material used by the delivered GLB without claiming that the optimized JPEG is the original full-resolution upload.

To regenerate texture preparation from the original user input, pass its directory explicitly:

```sh
python cad/export_asset.py /absolute/path/to/original/wood-textures
```

The original wood ZIP is not part of the revised website package. The supplied source directory must contain `2.jpg`. A deliberately reviewed replacement can change appearance and exported bytes even when geometry dimensions stay the same. The current website build does not need either regeneration command.

The export command writes cabinet/room GLB, manifests, STEP solids, optimized texture, and validation metadata under `model-source/asset-viewer/public/assets`. The render script reads that generated output and writes model previews under the source root. The included Python tests expect that historical generated-assets path, which now contains the copied reviewed exports. They do not look at the consumer website's separate `public/assets/cabinet.glb` path. A pass against copied exports checks those files; it does not by itself prove a fresh CadQuery regeneration has completed.

After regenerating, compare dimensions, moving groups, material direction, wear visibility, and asset size. Then intentionally copy the approved cabinet GLB and metadata into the website's `public/assets/`, convert selected evidence PNGs to optimized WebP, refresh the consumer scene renders, rebuild the website, and run relevant asset/browser tests. Do not overwrite the current reviewed cabinet with an unverified export.

The included `model-source/ASSET_README.md` describes the original full modeling package, including files that a later export creates or that belonged to the earlier viewer. Its historical validation counts describe that earlier release. The revision context and current file inventory distinguish bundled source from generated files and from the final website runtime.

## Accessibility and interaction rules

Use visible focus states and familiar controls. Buttons should remain keyboard actionable. The room supports position controls as an alternative to floor dragging. Sliders should display the relevant units. Information must not rely only on green or amber colouring.

Condition markers need meaningful labels and should not cover the selected defect. The first asset review found that overlays could obscure wear on a narrow viewport. Close-up mode hides hotspots and keeps descriptions in a separate panel. Preserve this behavior when changing model framing or introducing a new phone overlay.

Dialog flows should support closing and focus behavior. Navigation should preserve the report snapshot. A skip-to-content action should move focus without replacing the existing report fragment. Toasts and room outcomes use status semantics so feedback does not require visually watching the panel.

Respect `prefers-reduced-motion`. The same final camera view, pose, evidence, and controls should appear without a moving camera. A shorter animation alone is not the only acceptable reduced-motion response. Do not create mandatory motion or scrolling that prevents people from reaching the report.

Responsive layouts should contain the navigation, cards, inputs, evidence images, action bars, model canvas and chapter controls. V3 additionally targets action visibility and simultaneous scene/control use at 320 × 568, 375 × 667, 390 × 844 and 412 × 915 phone viewports, not only page-width containment. Desktop remains part of regression review. Product copy should wrap rather than force a viewport wider than the device. The 3D framing should preserve the cabinet and close-up detail in portrait aspect ratios.

## Performance and lifecycle principles

The homepage should use prepared imagery instead of creating a full WebGL scene immediately. Lazy-load the 3D controller on routes that need it. The cabinet model is approximately 4.7 MB, and Three.js creates a meaningful JavaScript payload. Those facts support measured loading and honest loading states rather than a claim of instant rendering on every connection.

Maintain one live engine per viewer mount. Route changes should dispose the old engine and prevent late async completion from attaching an obsolete canvas to a new screen. Clear animation frames, resize observers, pointer handlers, controls, scene resources, materials, textures, and renderer/context resources when the engine leaves.

A chapter change should replace old camera/part transitions. Manual orbit should cancel a guided camera move rather than fight it. Selecting a condition should focus once, not restart the same close-up every animation frame. Changing room position should update evaluation without rebuilding the entire room unnecessarily.

Prepared WebP illustrations reduce image payload. The source PNG can remain a regeneration artefact when required, but the production UI should reference the optimized file. The current font file is `public/fonts/plus-jakarta-sans-latin.woff2`, with the accompanying `public/fonts/OFL.txt`. CSS loads that local file rather than importing the font package into the JavaScript bundle. This avoids relying on a remote font request or a development symlink outside the allowed server path. Self-hosted fonts reduce dependence on an external font request. Avoid introducing a large animation or framework dependency solely for cosmetic changes when CSS and the current engine can achieve the interaction.

## Troubleshooting guide

| Symptom | Likely cause | Recommended check |
| --- | --- | --- |
| Blank page after opening the file directly | `file://` origin cannot serve the module/fetch workflow | Run Vite or serve `dist/` over HTTP |
| Vercel build cannot find package | Wrong project root | Choose the directory containing `package.json` |
| Direct `/studio` or `/laporan` refresh returns 404 | Missing SPA routing | Confirm included `vercel.json` and output directory |
| Model or images fail | Missing public assets, wrong base path, deployment omission | Inspect network requests and preserve root-relative assets |
| 3D fallback appears | WebGL unavailable or model loading failed | Keep evidence accessible, retry after checking console/network, do not claim clearance |
| New browser lacks drafts | Local storage belongs to the original browser/origin | Use share link for report transfer; drafts do not synchronize remotely |
| Local saves disappear after closing | Storage blocked or session-memory fallback | Check `storageAvailable()` and browser privacy/storage settings |
| Copied link opens older notes | Snapshot encodes an earlier version | Generate a new link after edits; old links do not live-update |
| Very long notes cannot share | Payload or string bounds | Shorten text; do not bypass validation to force an oversize link |
| Report link resets to example | Corrupt or unsupported snapshot | Read the Indonesian error and regenerate a valid share URL |
| Sample cards seem like multiple identical items | They demonstrate workflow states | Keep scenario labels and do not imply distinct inventory |
| Cabinet fits but door result is blocked | Opening sweep differs from closed footprint | Move/rotate the item and inspect the obstruction scenario |
| Hidden wall still causes conflict | Visibility does not remove room bounds | This is intentional; move inside the declared interior |
| Test browser cannot launch | Chromium dependency/path unavailable | Install Playwright Chromium or configure compatible `CHROMIUM_PATH` |
| Build warns about a large chunk | Three.js lazy bundle exceeds advisory threshold | Verify lazy loading and measured sizes before changing architecture |
| Motion feels absent | User prefers reduced motion | Confirm the final state and controls remain available |
| Studio returns to a prior tool/pose | Valid per-report viewer session resumed | Use an explicit guide/free entrance or the distinct reset controls as appropriate |
| Old saved layout has a generic image | Legacy entry predates optional preview/fit | Restore it in the room and make a new save; do not fabricate an old thumbnail |
| Mobile field/action seems obscured | Visual viewport/keyboard layout mismatch | Inspect `--app-height`, body layout metadata and the focused review panel |

Do not “fix” a missing-evidence warning by marking skipped areas captured. Do not “fix” a blocked room result by deleting wall bounds. Those shortcuts would break the product's meaning. Fix the source of the input or the calculation and keep the evidence state truthful.

## Known product limits and presentation guidance

The cabinet is the only fully modeled furniture item in the current product. Workflow cards demonstrate different states of that item. The model does not support custom uploaded furniture, arbitrary dimension entry, alternative manufacturing hardware, or user-generated wear geometry. Additional cards should not imply a broad existing asset catalogue.

The studio phone floats in the room as an illustration. It contains no rigged person or hand. The visual emphasizes device position and recording context. The larger phone proportions improve legibility and should not become a physical kit specification. The underside view uses a low-angle composition; it does not instruct someone to lift a heavy cabinet or represent actual hidden underside inspection.

The report distinguishes prepared images, owner notes, and documentation gaps. It does not verify the truth of owner notes or guarantee that every relevant defect appears. Visible furniture wear can be cosmetic, while structural, material, pest, odour, moisture, and internal conditions can remain unknown. The prototype intentionally avoids diagnosing those hidden conditions.

The buyer can save reports and placements locally. New v3 placement cards can use an actual bounded rendered thumbnail and saved independent fit summary. Legacy saves lack those optional fields and use a prepared-image fallback; text and reopened live scene preserve the actual stored coordinates and rotation. The preview is not a real measured room or reconstruction image. The product has no cloud account and no permanent link-management dashboard. Hidden workspace records remain local and count toward the bounded envelope; the current UI does not provide a separate restore-hidden-items destination. Archiving a local workspace card does not revoke a shared snapshot. Advancing to the sharing step marks the local workflow ready to share. Generating a link encodes its report snapshot; it does not publish media to a server. A browser link remains readable even after the seller deletes a local draft.

The visual room does not model a measured occupied home. Obstacle presets illustrate different clearance failures. Their artificial boxes do not represent all realistic room objects. Decorative imagery props never become calculation evidence. Users would need trustworthy dimensions and appropriate obstruction inputs in a real service.

For judging, introduce the demo with a concise distinction: the website demonstrates the intended interaction using a prepared cabinet, while reconstruction and inspection automation belong to a later validated product. Presenters can demonstrate actual frontend controls confidently without claiming a live scan. Show a missing area rather than always choosing complete coverage, because that demonstrates how the product treats uncertainty. Show door-only and drawer-only conflicts to explain why an item fitting in a room differs from opening it.

A useful presentation sequence lasts a few minutes: choose the platform, continue the incomplete sample, capture or skip an area, add a note, confirm dimensions, open the shared report, inspect a feature, compare room outcomes, and end with the studio's physical capture context. If time is short, use the studio for the narrative and a shared buyer report for the interactive proof. Keep market size and revenue assumptions in the separate business-plan presentation.

## Future implementation priorities

### Before creating a real capture service

1. Validate the user task and report usefulness with actual sellers and buyers.
2. Choose a category where external appearance and placement matter enough to support the initial value proposition.
3. Define a minimum evidence protocol for that category, including inaccessible surfaces.
4. Test capture effort on ordinary phones and varied lighting.
5. Separate global shape reconstruction from close-up condition evidence and measurement confirmation.
6. Define what the service can observe and what it cannot verify.
7. Choose report ownership, sharing permissions, retention, deletion, and link behavior.
8. Establish an evaluation dataset before claiming reconstruction or damage-detection accuracy.

### First production capabilities after validation

A real service could introduce uploads, server-side report/media persistence, accounts, private links, report versions, and cross-device draft continuity. It would need a media-processing pipeline, failure recovery, real storage costs, access controls, moderation decisions, and support procedures. A browser camera preview alone would not create reliable 3D reconstruction or measurements.

If using photogrammetry, evaluate object texture, reflective surfaces, transparency, motion blur, lighting changes, missing rear coverage, scale estimation, and compute latency. Tiny cosmetic features may require separate original close-ups. If using generative 3D methods, do not treat plausible generated geometry as evidence of the real item. The product should preserve source photographs and disclose uncertainty.

A business capture kit could later provide a stand, lighting, or scale reference. That hardware would need its own usability and measurement validation. The current generic phone prop and old optional kit discussion do not establish a validated capture setup.

### Additional categories and assets

The recovered modeling brief proposed a 1200 × 600 × 750 mm desk with a drawer and a 1400 × 425 × 800 mm sideboard. Those are design proposals, not implemented furniture in the current website. Add them only if they test a useful difference in shape, opening, evidence, or placement. Do not expand the dashboard with fabricated inventory merely to fill space.

Devices, collectibles, appliances, vehicles, and furnishings each raise different evidence needs. A phone's external model cannot establish battery health or replacement components. A furniture model cannot establish load-bearing safety. Category expansion should begin with a specific decision problem and validation protocol rather than treating all physical goods as interchangeable.

## Instructions for the next AI collaborator

Use the following prompt as a starting context when continuing the project:

> You are continuing LihatDulu, an Indonesian consumer prototype for a business-plan competition. Read `docs/MASTER_AI_CONTEXT.md`, `docs/mobile-exploration-revision.md`, `docs/v3-engine-contract.md`, `README.md`, `package.json`, and the current source before changing anything. Preserve the two entrances, one cabinet's consistent geometry/evidence, seller capture-to-review-to-share journey, buyer condition/room-fit journey, and clear simulation labels. The cabinet is an authored 90 × 47.5 × 120 cm item with two 100-degree doors, a 30 cm drawer, and three cosmetic examples. The app uses Vite, modular JavaScript/CSS, Three.js, local persistence, and bounded schema-1/schema-2 URL snapshots. It does not reconstruct photos, detect damage with AI, authenticate users, upload media, or operate a marketplace. Keep legacy report links valid, escaped text safe, skipped/retake areas missing, saved fixture transforms exact, reduced motion functional, and 3D fallback honest. Preserve the dedicated mobile workspace, explicit guided/free modes, independent resumable scene state, complete direct exploration, manual capture advance, actual saved thumbnails and separate camera/placement recovery controls. Read final validation evidence before claiming tests pass. Make changes to source, rebuild `dist/`, run checks appropriate to the changed behavior, update the context/README, and package a clean Vercel ZIP when requested. Treat business benefits, pricing, and market size as unvalidated hypotheses unless supplied evidence establishes them. Do not redistribute uploaded Mobbin or Envato source downloads. Ask only for missing decisions that materially affect the requested work; use the current approved brief for routine choices.

A future collaborator should first identify whether the user asks for product design, website implementation, market research, presentation material, or real capture technology. These tasks share context but have different evidence requirements. Keep the requested scope concrete and do not claim progress from a polished demo as market validation.

## Documentation index and authority

| Document | Use | Authority boundary |
| --- | --- | --- |
| `README.md` | Fast local/Vercel operation and demo walkthrough | Match current package scripts and runtime scope |
| `docs/MASTER_AI_CONTEXT.md` | Full continuation context | This revision's detailed handoff; source and fresh tests decide final behavior |
| `docs/handoff-checklist.md` | Historical v2 release and presentation review | Its checked items describe v2; use qa-checklist for v3 |
| `docs/revision-design.md` | Approved v2 consumer/capture brief | Historical foundation preserved by v3 |
| `docs/mobile-exploration-revision.md` | Approved v3 mobile/free-exploration brief | Current revision intent and shared implementation contracts |
| `docs/mobile-revision-ledger.md` | V3 revision decisions and RED verification | Current execution record, not a substitute for final pass evidence |
| `docs/v3-engine-contract.md` | Viewer/session/preview APIs and bounds | Exact current engine/state contract |
| `docs/qa-checklist.md` | V3 interaction, responsive, state, fallback and package checks | Items require actual v3 evidence before being marked passed |
| `docs/v3-release-notes.md` | V3 changes and fresh release stamp | Current release evidence; pending entries are not pass claims |
| `docs/superpowers/plans/2026-10-03-consumer-redesign.md` | Implementation task map | Execution plan; final source may refine routine details |
| `docs/capture-implementation.md` | Report/capture/workspace state detail | Current worker contracts and bounded unit verification |
| `docs/capture-engine.md` | Room/phone capture engine detail | Current engine contracts and isolated scene verification |
| `docs/asset-provenance.md` | Authored illustration origins and reproduction | Current image provenance, not legal certification |
| `docs/design-system.md` | Implemented consumer styling | Current CSS tokens, components and responsive rules |
| `docs/revision-ledger.md` | Revision milestones | Current release progress and decisions |
| `docs/release-verification.md` | V2 final build, tests, independent QA, previews and package review | Historical v2 evidence unless a labelled v3 appendix explicitly supersedes it |
| `docs/approved-plan.md` | First website design rationale | Historical first version, superseded where revision changes workflow |
| `docs/build-ledger.md` | First website execution summary | Historical nine-browser/seven-state verification |
| `docs/validation.md` | First website verification | Historical unless release explicitly replaces its contents |
| `docs/final-review.md` | First website bounded review and fixes | Historical regression rationale, not automatically a new redesign review |
| `docs/state-brief.md`, `docs/state-report.md` | Original state architecture and implementation | Historical schema-1-only scope; current state source adds schema 2 |
| `docs/engine-brief.md`, `docs/engine-report.md` | Original engine architecture and implementation | Historical base contract; current capture engine extends it |
| `model-source/ASSET_README.md` | Original model package details | Historical full package; current source includes reviewed exports, while standalone preview/old viewer belong to the prior package |
| `model-source/3D_Furniture_Model_Brief_Draft.md` | Detailed asset design and future desk/sideboard proposals | Confirmed cabinet direction plus unimplemented secondary asset proposals |
| `model-source/cad/cabinet_spec.json` | Parametric cabinet facts | Source construction specification |
| `public/assets/cabinet-manifest.json` | Exported dimensions, parts, pivots and mesh facts | Runtime physical asset contract |
| `public/assets/cabinet-report.json` | Authored condition anchors, camera presets and evidence metadata | Runtime authored evidence contract |
| `THIRD_PARTY_LICENSES.txt`, `public/fonts/OFL.txt` | Dependency/font notices | Preserve licence texts; do not infer rights for separate uploaded source assets |

If two documents disagree, identify whether one describes historical scope, proposed future work, or measured current behavior. Do not silently combine their strongest claims. For example, a future desk proposal does not mean the UI supports desk capture, and historical Python passes do not mean a fresh export has run in the current workspace.

## Unrecoverable or incomplete historical material

- The initial material the user wanted merged into Markdown is not available in the current source handoff.
- The exact subtheme list from the original competition material is not recoverable here.
- Earlier complete problem-statement lists, macro-trend analyses, and market-size calculations do not appear in the recovered project documents.
- The full prior business-model response and any numerical revenue assumptions are not recoverable.
- The exact original wood-texture archive identity and licence record do not appear in this pack.
- Some planning answers appear only through accepted design summaries rather than a verbatim transcript.
- This pack records available user requests and artifacts; it does not recreate missing assistant text or inaccessible files.

These gaps do not block presenting the current prototype. They matter when writing competition claims, changing the business model, or attributing a numerical result. Retrieve the source research or perform a new analysis instead of treating a missing result as established fact.

## V3 final integration refinements

The studio keeps tool tabs sticky inside the control panel. Selecting Model or Bukaan chooses the whole-object overview after a wear close-up while retaining the independent motion values. Condition selection uses its selected button and corresponding photo rather than an extra toast. Explicit mode restoration retains the prior camera rather than applying a new overview. Each mode has its own short-lived undo array; first-time mode entry starts from the default room, and switching restores that mode's validated scene. Undo history is not reconstructed after reload.

Guided secondary links live inside the scrollable panel; only the primary previous/next row is pinned. Mobile free metadata and duplicate room/opening headings are compressed. Short standalone room panels give size inputs enough height above pinned independent fit results; the smallest room explanation is available through the detail dialog. At320×568, a smaller scene and internal control scroll are still necessary. Expanded scene mode gives a larger view.

The mobile viewport-shrink regression tests focused inputs and action bounds; it does not emulate a physical keyboard. Workspace-only clipping does not affect home, buyer galleries or saved lists. Capture review buttons synchronize aria-pressed, and condition/fixture buttons synchronize both visible and assistive states. Stage labels update between recording, model and placement. Free mode does not mark a guide chapter selected. Late engine callbacks are guarded by the current render token.

Current action labels include **Jelajah bebas** on the homepage, **Eksplorasi bebas** in the mode selector, **Simpan posisi** for placement saves, **Area berikutnya** and **Selesai merekam** for explicit capture advance, and **Tinjau lagi** when returning from the sharing view. The action IDs remain the integration contract; historical copy may differ.

The final test runner encountered a capacity failure before app assertions:107 disposable browser extraction directories occupied22.83GB. Inactive generated caches were removed, and the helper now cleans its own directory at process exit. The complete browser, production and screenshot runs then executed again. This was an infrastructure failure, not a website assertion failure.

Fresh v3 verification passed43 unit tests and28 browser/geometry checks, including all ten guide chapters at320×568,375×667,390×844 and412×915. The production build passed. Thirty-one regenerated application screenshots recorded zero page errors. The prebuilt production smoke passed seven direct routes and refreshes, actual model/font assets, a fresh Unicode buyer handoff and375×667 exploration/capture/room flows, with zero page/console errors, failed requests or external runtime requests. Physical Safari/phone/GPU and real keyboard certification remain outside this review.


---

## End of historical appendix

The current brief is at the start of this document. Do not implement the historical V3 continuation instructions. Await the user's answers to the three current revision questions.
<!-- LIHATDULU_V5_PRESERVED_HISTORY_END -->

## V5 continuation reminder

The preserved archive has ended. Its final instruction to await three answers is superseded. The user answered those questions and authorized implementation: open straight to Sora, remove real camera/upload access, and demonstrate an interactive product concept. The current V5 source uses prepared example frames, direct live inspection, prepared room layouts and a review-only checkout. Read the V5 verification record near the start for the current release status. Do not revive archived camera, catalogue, pitch-banner or planning-only instructions.
