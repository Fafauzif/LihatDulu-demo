# Product models and asset coherence

## Existing Sora

The baseline contains a 4,702,852-byte cabinet GLB:
- SHA-256: 18cf94f5d342f9949d5b100bde3968dfc14b1746c3cb47570cf930ab55c9d742.
- Closed example dimensions: 0.90 m width, 0.475 m depth including handle, 1.20 m height.
- Independent left and right door pivots and drawer slide.
- Example door travel up to 100 degrees and drawer travel up to 0.30 m.
- Matching scratch, upper-right chip and top ring-mark condition evidence.

Preserve its product identity, functioning articulation and correspondence between photos and anchors. These are authored example dimensions and condition facts, not certified physical measurements of a seller's item.

The additional editable archive is a Remotion film project. Its GLB matches this asset exactly. It does not contain CadQuery construction scripts, STEP files, Blender source or other recovered cabinet-construction files. Do not claim those sources are supplied.

## Additional active products

Create distinct Arca chair, Batu table and Rimba sideboard models. Use their existing catalogue images as starting design cues where practicable. If new geometry differs, replace catalogue and gallery imagery with matching renders.

Every active product needs:
- Its own GLB and matching poster.
- A coherent gallery generated from or demonstrably matching the same geometry.
- Consistent material and dimensions.
- A per-product manifest with bounds, scale, coordinate convention and capability flags.
- Camera presets that frame the product appropriately.
- Reproducible generation source and dependency instructions.
- Documented asset provenance.

Do not make three renamed copies of Sora. Do not stretch an image, reuse its dimensions or create an unrelated stock-photo/model combination.

## Asset-production tools

Use available tools such as Blender, CadQuery with a suitable export pipeline, trimesh or procedural Three.js geometry/export. Choose the route that preserves materials, units and reproducibility. CadQuery is optional, not a reason to stop.

No live Python or CAD generation is needed in the deployed browser. Export production assets ahead of time.

Use a common coordinate convention in metres, Y up, with explicit front direction and floor origin. Validate generated bounds against dimensions and inspect rendered images.

Store production assets separately from generation sources. The final source export includes the generation scripts and appropriate notices. Do not include large unneeded working renders or caches.

## Generalize the viewer

The current engine is cabinet-specific. Refactor it around product asset/configuration data:
- Model, manifest and report URLs.
- Bounds, floor placement and camera presets.
- Optional condition anchors.
- Optional named moving parts, pivots, limits and units.
- Product-specific dimensions.
- Supported room and capture modes.

A missing door pivot on a chair must not crash initialization. A product without condition anchors must not inherit Sora's wear. Product-specific viewer and gallery state must not leak.

Keep the existing room-clearance behaviour for Sora. For additional products, body-only placement is sufficient if correctly implemented and labelled. Opening clearance requires actual articulation geometry. Do not add room controls that simply reuse cabinet calculations.

## Gaussian-splatting boundary

The current site uses an authored articulated mesh. Neither this pack nor the prepared capture implements Gaussian-splat reconstruction.

The website may demonstrate the intended inspection and capture concept. The internal technical handoff and presentation claims must distinguish implemented mesh inspection from proposed captured-appearance technology.

Do not introduce reconstruction spinners, AI confidence scores, generated-geometry success states or fabricated capture timing. A future captured appearance model would still need independent scale confirmation and appropriate geometry for articulation and clearance.

## Optimization and quality

Produce mobile-suitable exports while retaining visible shape, distinctive material and important wear evidence. Simplify hidden or redundant geometry where safe. Reduce texture sizes and duplicate materials before adding expensive compression machinery.

Any compression or lower-detail asset must preserve moving nodes, anchor names, scale, dimensions and photo correspondence. Test decoding cost and compatibility, not just file size.

Use one model at a time in live inspection. Catalogue cards remain ordinary images. Keep original Sora provenance and record optimized derivatives with new checksums.

## Condition and evidence

Only disclose authored or supplied condition details. Do not automatically grade damage or imply detection from the example photographs. Photos remain usable at lightweight render quality and when WebGL fails.

A geometric size illustration is bounded by its authored model and inputs. Keep measurement status and uncertainty associated with the correct product and saved record.

