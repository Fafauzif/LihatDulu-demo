# Implementation and delivery

## Baseline stack

The embedded website is V5.1:
- Vite build tooling.
- JavaScript ES modules and authored CSS.
- Three.js, GLTFLoader and OrbitControls.
- Local/session browser state.
- Existing unit and browser verification scripts.
- Static dist/ output and Vercel SPA rewrites.

Keep this stack. Do not automatically rewrite into Next.js, React, Tailwind, a native app, WebGPU or a backend because an upstream skill defaults to it. Small purposeful additions require an actual benefit and compatible existing dependencies.

The React/Remotion project belongs to the film. It is not the website baseline.

## Refactor boundaries

Generalize the Sora-only paths in main.js, catalogue.js, inspection.js and engine.js. Introduce reusable listing/seller data and capability-aware viewer configuration.

Separate catalogue state, per-product inspection state, prepared capture and cart/review state. Validate stored records and migrate existing Sora keys safely. Do not clear storage wholesale.

Use product IDs to scope camera, gallery, room confidence and selections. Share the canonical current product URL, not a fixed Sora URL from another listing.

Keep URL state for meaningful filters/tabs and direct-route refresh support. Maintain input escaping and strict validators when adding user-editable example fields.

## Build and runtime

Keep GLBs, fonts, images and prepared fixtures locally served where practical. No runtime dependency on private reference files, model-generation tools, paid APIs, a user's account or uploaded personal data.

Use deferred viewer code and on-demand model loading. Avoid creating expensive preview renderers per catalogue card.

The final build must be freshly regenerated from the final source. Serve and verify that compiled output, not only a development server. Preserve useful headers, accessibility metadata, titles, fallback images and licence notices.

## Artifact production

Use available presentation/PDF tools. Prefer one editable PPTX source and an exported PDF. Retain source scripts and final tokens.

Use native SVG/vector source for the logo. Asset generation scripts must document dependencies and reproducible commands without assuming access to missing historical files.

## Testing

Reuse and adapt meaningful existing tests. Update fixtures and assertions when the product contract changes. An old test that assumes every route is Sora is not evidence for the new catalogue.

Verify real engine effects, meaningful state isolation, cart arithmetic, fit uncertainty and no-media permissions. Do not write only tests that mirror the new implementation.

Retain separate source and compiled-production verification. Check rapid navigation and renderer disposal.

Record old baseline results separately from fresh redesign results.

## Delivery export

The future updated application ZIP should contain:
- Source, local production assets and generation source.
- package.json and package-lock.json.
- README with build/run commands.
- vercel.json and a fresh dist/.
- Appropriate licences and a concise continuation record.
- Relevant tests and a bounded QA report.

Exclude node_modules, browser binaries, credentials, API keys, caches, large film audio, private screenshot references and review transcripts from deployment. Provide the editable PPTX/PDF and logo assets as separate clearly named artifacts or a documented companion bundle.

Do not publish or deploy externally without authorization. Building local deployable output is authorized by this brief.

