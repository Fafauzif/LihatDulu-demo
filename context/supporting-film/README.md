# LihatDulu product demo

The revised film is 120 seconds, 1920 × 1080, 30 fps, with Indonesian onscreen
storytelling, original instrumental music and synchronized product sounds.
There is no narration. The MP4 is delivered separately.

## Story

| Time | Product action |
| --- | --- |
| 0–22 s | Guided cabinet capture, seven photo actions, review and report sharing |
| 22–34 s | Rotate the authored cabinet model |
| 34–52 s | Match three condition photos to their locations on the model |
| 52–70 s | Open both doors and pull the drawer |
| 70–78 s | Check closed-model dimensions |
| 78–98 s | Test room clearance, identify an obstruction and move the cabinet |
| 98–116 s | Open the same cabinet's buyer report and prepare a missing-photo request |
| 116–120 s | Brand close |

## Reproduce or edit

Node.js, npm and FFmpeg are required. From this folder:

```bash
cd film
npm ci
npx remotion browser ensure
npm run render
```

The full output is `exports/LihatDulu_Product_Demo_Revised.mp4`. The pinned
Remotion version is 4.0.530. `FILM_BROWSER` may specify a Chromium executable,
and `FILM_FFMPEG` may specify FFmpeg. The default renderer uses software WebGL.

```bash
npm run studio
npm run stills -- 162,495,690,1100,1809,2160,2550,2760,3330,3420
node render.mjs range 2340 2939 ../exports/Room_Excerpt.mp4
```

Stills are written to `review/v3-stills`. These generated working files are not
included. Root.tsx owns the timeline and editable scene registrations. The
`withAudio` composition property defaults to true and can mute a picture-only
preview. CommonV3.tsx owns the editorial layout. V3Workflow.tsx owns the genuine
capture and buyer-interface sequences. V3Inspect.tsx owns the cabinet and room
camera poses. CabinetScene.tsx renders the original articulated model.

The renderer applies a timestamp-only remux to correct the 2048-sample leading
audio offset observed in this Remotion version. It copies the compressed video
and audio without re-encoding. Keep picture and soundtrack timing together
when changing the timeline.

## Sound and captions

`film/public/audio/master-v3.wav` is the aligned 120-second, stereo 48 kHz,
24-bit PCM soundtrack. `audio/` contains the original score and effects in
lossless FLAC, separate instrument stems, individual cues and a portable cue
manifest. All music and effects were synthesized for this film. No third-party
recordings are included.

The independent audio generator requires Python 3, NumPy, SciPy and FFmpeg.
Running `python3 audio/compose_audio_v3.py` rebuilds the score, stems, cues and
master in that folder. After editing, check the complete mix against the
picture before replacing the film's master.

`captions/LihatDulu_Captions_ID_Revised.srt` follows the onscreen story for
optional closed captions. It is not a spoken transcript.

## Asset provenance

The cabinet is the original authored demonstration GLB supplied with the
LihatDulu prototype. Its wood texture, condition geometry, hinge pivots and
drawer slide are retained. Door travel reaches 100 degrees and drawer travel
reaches 30 cm. Cinematic camera framing, room lighting and projected labels are
presentation treatments. The room and fixed obstruction use source geometry.

Interface images show real actions in the unchanged supplied application. The
camera workflow uses predefined sample photos and does not establish live
camera capture, photogrammetry or automatic reconstruction. The seven-area
capture, shared listing and buyer report belong to the same example cabinet.
The rear-lower area and underside remain undocumented.

The closed-model dimensions are 90 × 47.5 × 120 cm, including handles. Physical
measurements remain unconfirmed. Room-clearance results describe the authored
sample geometry. The buyer request dialog prepares text for the buyer to copy
and send. It does not send a message.

Plus Jakarta Sans is distributed under the included OFL license.
ASSET_MANIFEST.json records relative paths, sizes and SHA-256 checksums.

## Check after editing

- Keep text, image and 3D regions separated and inspect actual glyph bounds.
- Inspect shutter transitions, condition cuts and report-scroll endpoints.
- Keep the complete opening silhouette inside the frame.
- Keep condition badges attached to the correct model parts.
- Keep measurement context and the report's evidence gaps visible where relevant.
- Keep the room obstruction fixed while the cabinet moves.
- Align effects to actual button actions and mechanical movement.
- Verify the finished MP4's duration, frame rate, audio and full-stream decode.
