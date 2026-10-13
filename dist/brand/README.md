# LihatDulu logo assets

`logo-mark.svg` and `logo-lockup.svg` are the editable original vector sources. `logo-concepts.svg` records the selected aperture frame direction alongside an exploratory ring concept. PNG exports are generated with ImageMagick from the SVG source.

Rebuild PNGs:

```sh
convert -background none logo-lockup.svg -resize 880x192 logo-lockup.png
convert -background none logo-mark.svg -resize 192x192 logo-mark.png
```

The SVG uses Georgia as a system serif fallback for the wordmark. The interface uses the locally bundled Plus Jakarta Sans for body and control text.
