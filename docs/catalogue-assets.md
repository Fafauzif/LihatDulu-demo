# Catalogue asset and data provenance

The six catalogue entries are authored showcase furniture concepts and proposed prices. They do not describe live stock, real sellers, completed sales, verified reviews, or confirmed product specifications. Cities and condition descriptions are invented presentation data. Static `created` timestamps provide deterministic ordering; they are not availability or urgency claims. Only Sora has an existing interactive model.

## Assets

| Entry | Local asset | Origin |
| --- | --- | --- |
| Sora | `public/images/cabinet-closed.webp`, `cabinet-open.webp`, `capture-rear.webp`, `wear-scratch.webp` | Existing authored Sora model renders; reused for the same cabinet only |
| Arca | `public/images/catalogue/arca-chair.webp` | Original AI-generated catalogue image |
| Nara | `public/images/catalogue/nara-lounge.webp` | Original AI-generated catalogue image |
| Rimba | `public/images/catalogue/rimba-sideboard.webp` | Original AI-generated catalogue image |
| Batu | `public/images/catalogue/batu-coffee.webp` | Original AI-generated catalogue image |
| Lino | `public/images/catalogue/lino-sofa.webp` | Original AI-generated catalogue image |

The five new assets were created with the built-in image generation tool on 2026-10-08, using five independent prompts and no reference images, stock photographs, third-party furniture designs, or remote image URLs. They were visually inspected as full, distinct products with coherent warm studio backgrounds. Generated PNG masters are 1254 × 1254 pixels. Website copies are 1100 × 1100 pixel WebPs, quality 88, totaling 472,394 bytes. Optimization resized the whole square image and did not crop or alter product details.

Generated imagery is an authored visual concept, not photographic evidence of an actual inspected item. Dimensions, material descriptions, condition labels and prices for the five new concepts are authored presentation values. Sora's 90 × 47.5 × 120 cm closed dimensions match the existing model contract. Its wear descriptions refer to the existing authored visible cosmetic examples.

## Final prompt set

Every generation used this exact common prompt, followed by one product subject below:

> Use case: product-mockup. Asset type: furniture catalogue product photo for an original Indonesian furniture showcase. Warm minimalist studio with ivory plaster wall and pale beige matte floor, soft natural light from upper left, subtle shadows, premium editorial product photography, physically realistic joinery and fabric, restrained contemporary design. Full product entirely visible, centered with generous margin, three-quarter front view at human eye level, square composition. No humans, no branding, no text, no watermark, no pricing, no extra furniture, no rug, no plants. Product subject:

**Arca:** one solid natural oak dining chair, softly curved rectangular open backrest, woven beige rope seat, four simple tapered legs, understated Scandinavian Indonesian design. Seat height approximately 46cm.

**Nara:** one low lounge armchair with a sculptural dark walnut wooden frame, cognac saddle leather back and seat cushions, exposed angled wooden armrests, generous broad seat, relaxed 1970s silhouette. Three-quarter front view revealing both arms.

**Rimba:** one long low walnut sideboard with three closed doors, the two outer doors having vertical fluted wood texture, the middle door smooth walnut, slender black metal legs, elegant geometric handles. Approximately 160cm wide and 75cm high.

**Batu:** one oval cream travertine coffee table, a broad gently rounded oval slab top on two thick cylindrical stone pedestal legs, natural subtle limestone pores, approx 110cm long and 38cm high. Full table visible.

**Lino:** one compact two-seat sofa with warm oatmeal woven linen upholstery, rounded padded arms, two separate plush seat cushions and two back cushions, low dark walnut feet. Approximately 180cm wide, inviting contemporary timeless silhouette. Full sofa visible.

## Data module

`src/catalogue.js` exports `LISTINGS`, `getListing(id)`, `formatPrice(number)` and `filterListings({query, category, sort, minPrice, maxPrice} = {})`.

Stable IDs are `sora`, `arca`, `nara`, `rimba`, `batu`, `lino`. Categories are `Lemari`, `Kursi`, `Meja`, `Sofa`. Only `sora` has `model: true`. Every image source is local. No seller identities, ratings, verification claims or countdowns are included.

Search ignores case and combines all query words across the title, category, material, location, description and features. Category accepts exact case-insensitive names plus `Semua`/`all`. Price bounds are inclusive and accept numeric values or numeric strings; blank/invalid bounds are ignored. Sorting accepts `relevance` (authored order), `newest` (static seeded timestamp), `price-asc`/`cheapest`, and `price-desc`/`priciest`. Filtering and sorting do not reorder `LISTINGS`.

## Verification

An isolated Node assertion run checked unique entries, Sora-only model availability, accurate Sora depth, missing-item behavior, rupiah formatting, multiple-term and case-insensitive queries, category matching, inclusive price bounds, combined category/price filtering, empty results, reversed price ranges, ascending/descending/newest sorts, invalid limits, unchanged catalogue order, valid positive dimensions and the existence of all nine local photo references. All checks passed.
