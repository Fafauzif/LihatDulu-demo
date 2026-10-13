# Baseline and pack verification scope

## Website baseline

On 13 October 2026 the live root at https://lihat-dulu-demo.vercel.app/ showed the buyer/seller role chooser and loaded:
- /assets/index-BxwkETk1.js
- /assets/index-Dfho1xh3.css

These identifiers match the supplied V5.1 dist/index.html. This establishes correspondence of the observed UI and build identifiers, not a byte-by-byte independent download of the entire live deployment.

The app/ source and prebuilt output are copied from the supplied website archive. The package manifest records SHA-256 values for its files.

## Earlier live inspection

The role gateway, catalogue, condition disclosure, room interface, seller prepared-frame selection, seller review and checkout/delivery review were explored.

The cloud browser had WebGL disabled, so live 3D rotation, articulation and room calculations could not be verified there. The visible fallback and disabled graphics-dependent controls were observed. That browser limitation does not prove the deployed model is broken.

Historical V5.1 QA results inside the original context remain historical. They are not fresh redesign passes.

## New film archive

The revised editable project was readable. Its cabinet GLB SHA-256 matches the website asset. The archive contains Remotion/React film source, audio and UI stills. It is not a newer Vercel website or recovered cabinet CAD source.

## Pack verification

The root PACK_MANIFEST.json and PACK_VALIDATION.json record package-file integrity, expected counts and structural checks for this implementation pack.

Those checks verify this pack's completeness and source/reference identity. They do not imply that the future redesign, mobile performance, new models or brand guidelines have already been implemented or tested.

Independent package review is a requirements/consistency review of the prompt pack. Its dialogue and ratings are excluded from the deliverable.

