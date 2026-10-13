# Marketplace specification

## Catalogue and discovery

Display four available demonstration listings and two coming soon with a coherent product-card system.

Provide text search, category selection, sorting and a compact filter interface. Implement meaningful filters such as price, condition, material, seller area, maximum width, depth and height, and availability. A small catalogue does not require every filter to be equally prominent.

Filters and sorting must actually affect results. Use a useful empty state with a clear reset. Do not imply a large product count by duplicating cards or inventing volume.

Use a four-column grid where desktop content permits, and well-proportioned mobile cards, usually two columns. Let actual readability and reference evidence decide spacing. Keep the catalogue denser than the inspection page.

## Product data contract

Use one authoritative listing record for every view:
- Stable product ID and slug.
- Display title, category and availability.
- Price and currency.
- Material, location and disclosed condition.
- Width, depth and height in a canonical unit.
- Seller ID.
- Matching photo records with descriptive alt text.
- Model URL, poster, manifest, bounds and camera presets.
- Explicit capabilities: model inspection, articulation, condition anchors, room placement and prepared capture.
- Source/measurement status where relevant.

Do not reuse Sora's hardcoded dimensions or storage controls for other products. Capability flags determine which controls appear. Dimensions displayed in centimetres should be derived from the same manifest or validated canonical data used by the viewer.

Seller-workspace edits use a draft layer rather than overwriting the asset facts. If a prepared price/status changes, cart eligibility and arithmetic must be recomputed from the same validated record.

## Product pages

Every available product has a direct route, real matching 3D, photos, price, dimensions, material, seller information, availability, save action and commercial next step.

Maintain an immediately useful matching poster during loading. Preserve customer actions while a viewer initializes. Show condition information in an easy-to-find summary, with close-up evidence where available.

Sora retains actual independent door and drawer articulation and its three matching wear details. Static furniture must not show irrelevant door sliders. Rimba articulation is optional unless a corresponding moving model is produced and verified.

Coming-soon pages identify that specific item, present its available imagery and prevent cart or checkout actions. Do not route a sofa card to the cabinet.

## Sample sellers and storefronts

Use a small number of clearly authored example seller profiles. Reuse the same seller record across listing, shop and cart.

A storefront can show seller name, area, bio, available items and pickup/delivery context. Do not fabricate verified identity, reputation, response times or completed sales. A review area may show an honest empty state. Uploaded review references inform hierarchy and interaction, not invented social proof.

Show useful fulfilment context before checkout. Distinguish a prepared delivery estimate from a live quote.

## Saved items and collections

Saving works for all four available products. Provide an understandable collection flow, meaningful empty states and local persistence. Existing Sora favourites should remain valid. Validate stored records and fall back safely on malformed or unavailable storage.

An example collection can be prepared if clearly identified. Do not invent personal history for the judge.

## Cart and checkout review

These are one-off pieces:
- Quantity is fixed at one per available listing.
- Repeated Add to cart does not multiply stock.
- Sold, reserved or coming-soon local states cannot silently remain buyable.
- Cart lines correspond to their own listing and seller.
- Prices and fees use validated numbers and correct Indonesian currency formatting.
- Review makes any seller-specific delivery assumptions visible.

For a multi-seller cart, group items by seller and show how fees are applied. Do not silently charge one blanket delivery amount for several sellers. Pickup can be the uncomplicated default. A delivery option may use explicit prepared routes and estimates, with no personal address required.

Checkout ends with editable review. It does not charge, reserve real inventory, send an order, generate an invoice implying an actual sale or contact a courier.

If an order-record concept is shown, identify it as an example and carry the same disclosed condition record into it.

## Optional offer interaction

The offer references may inform a local price-proposal composer after the core is complete. A prepared offer must not claim it was sent or accepted by a real seller. Omit it cleanly if it would distract from the required journeys.

## Furniture-specific commerce

Explain the actual piece's wear, material, dimensions, pickup area and handling context. Use a consistent record of disclosed wear between inspection and review. Differentiate appearance, confirmed size data and proposed real-world fulfilment.

Avoid unsupported original-price comparisons, false discounts, scarcity counts and guarantee language.

