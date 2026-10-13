# Mobile usability and weaker-device performance

## Release requirement

Mobile is a first-class product surface. A desktop layout compressed into a phone width does not satisfy this brief. Design and verify the role gateway, catalogue, product inspection, storefront, filters, collections, cart, seller workspace, photo search and full-screen capture.

Prioritize entry-level and midrange Android use as well as iPhone browser behaviour. Do not claim universal low-end-device support from desktop software rendering or a Lighthouse score.

## Approved adaptive-loading policy

Show a useful matching product poster immediately.

Load 3D automatically when conditions are suitable. In constrained conditions, keep browsing and inspection photos usable and expose a clear tap-to-load action. Do not hide the existence of 3D.

Network hints such as saveData, deviceMemory and hardwareConcurrency are optional, incomplete signals. They are not dependable GPU classifications and may be absent. Use conservative defaults, measured frame behaviour, feature availability and an explicit customer override. Do not depend on model-name sniffing.

Prepared capture follows the same principle. A lightweight scene or corresponding prepared frame supports the workflow if graphics are unavailable. Label the example accurately.

## Source-specific optimization opportunities

The V5.1 engine currently:
- Creates an antialiased WebGL renderer.
- Caps device pixel ratio at 2.
- Enables a 2048 by 2048 directional shadow map.
- Continues requestAnimationFrame rendering while mounted.
- Loads the cabinet, manifest and report from cabinet-specific paths.

These are source observations, not performance measurements. Replace costly defaults where evidence supports the change. Generalize asset paths and prevent mounting every product at once.

## Rendering profiles

Implement lightweight and balanced profiles, with an optional higher quality profile only if practical.

Lightweight should start with a low drawing-buffer scale, simple lighting, inexpensive or static contact-shadow treatment and conservative antialiasing. Balanced may add quality while staying responsive. On mobile, cap total drawing-buffer pixel count as well as any density multiplier. Test the viewport-filling capture stage, not just a small viewer.

Degrade quality based on sustained evidence rather than one noisy frame. Use bounded steps and hysteresis to avoid oscillation. Preserve all essential inspection actions and readable condition photos. A quality change must not reset camera or part state.

Avoid post-processing, heavy blur, multi-pass decorative effects and unnecessary real-time shadows on weaker devices.

## Rendering lifecycle

- Only one active live viewer is needed.
- Render on demand while idle, with frames continuing as needed for orbit damping, camera transitions, opening animation or capture animation.
- Stop or pause hidden/offscreen work and resume correctly.
- Release obsolete geometry, textures, materials, controls, listeners and animation frames.
- Prevent growth after repeated product changes.
- Handle WebGL context loss with recovery or useful fallback.
- Leave ordinary scrolling and navigation responsive during loading.
- Avoid repeated heavy geometry checks or DOM measurements on every pointer event when scheduling/coalescing suffices.

## Planning targets

These targets are proposed engineering budgets, not measured achievements or universal device promises.

| Area | Initial target |
| --- | --- |
| Role/catalogue initial compressed JS, CSS and fonts | At most 250 KiB combined, excluding visible image bytes and deferred viewer code |
| GLB downloads on role/catalogue routes | Zero |
| Live renderers during product exploration | One |
| Mobile model download | Aim below 3 MiB per product; justify exceptions and optimize the 4.49 MiB original Sora |
| Lightweight interaction | Aim for sustained 30 fps on a documented representative device/profile |
| Idle rendering | No continuous render workload once interactions and damping settle |
| Web quality goals | LCP at most 2.5 s, INP at most 200 ms, CLS at most 0.1 |
| Console/runtime failures | Zero unhandled application errors in tested journeys |

Record transfer and decoded/graphics costs separately. A smaller compressed download can still incur excessive decoding or GPU costs. If a budget needs adjustment, document the actual measured tradeoff and preserve the user outcome.

The Core Web Vitals values are standard goals measured at the 75th percentile for field compliance. A prototype lab run is not evidence of that field compliance. TBT and synthetic timing are not interchangeable with field INP.

## Mobile interaction and layout

- Check at 320, 360, 375, 390 and 430 CSS-pixel widths and useful short/tall heights.
- Check tablet and desktop separately.
- Use approximately 44-pixel practical primary touch targets.
- Put primary product actions within reasonable reach.
- Keep model rotation from trapping page scrolling.
- Supply preset views, zoom buttons and alternatives to drag-only actions.
- Use viewport-aware immersive capture sizing, safe-area insets and a reachable exit.
- Do not promise that the browser address bar disappears.
- Keep filter sheets, menus and dialogs internally scrollable without hidden actions.
- Test text wrapping, screen rotation, focus and virtual-keyboard viewport changes where feasible.
- Reduced motion affects graphics transitions and interface motion.

## Performance verification matrix

Test cold and warm loads, constrained network, CPU throttling, interrupted model fetches, WebGL unavailable, context loss where feasible, background/resume and repeated route changes.

Document network latency/bandwidth, CPU throttle, browser, viewport, selected quality profile, asset sizes and number of active renderers. Inspect screenshots and performance evidence.

Browser CPU/network throttling does not emulate a low-end GPU, physical phone memory pressure, thermals or a battery environment. Software WebGL is a separate condition. If actual phone hardware is unavailable, report the limitation and do not label it hardware-certified.

Where physical devices are available, test a representative entry-level or older Android and a midrange Android, plus mobile Safari if available. Specify the device rather than asserting that all devices in a category pass.

