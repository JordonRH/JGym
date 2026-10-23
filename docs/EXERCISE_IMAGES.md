# Exercise images

JGym bundles free demonstration artwork locally. No account, subscription, API key or purchase is required. Images ship in the frontend build and Linux Docker image; service-worker media caching applies.

## Coverage

**414 of 5,632 catalogue entries** have illustrations: 255 more than the initial release. **5,218 remain without images**, listed in `exercise-image-gaps.csv`. Coverage by source: Everkinetic 193, Open Exercise Illustrations 203, Workout Guide 18. These counts are catalogue entries, not unique drawings.

All existing exercise IDs and workout history remain intact. Unmatched details explicitly report missing artwork. Use “With demonstration images” in the library to browse covered exercises. No fuzzy runtime matching or unrelated fallback demonstration is used.

Mappings in `frontend/src/lib/exercise-illustrations.json` record catalogue names, source IDs, titles and local frame paths. New mappings were checked against equipment, movement and the first/last source frames. Questionable drawings and overbroad aliases were excluded. Visual matching is not professional certification of exercise technique. Open Exercise Illustrations artwork is AI-generated and labelled in the app.

## Sources and credits

| Source | Licence | Pinned revision |
| --- | --- | --- |
| [Greg Priday / Everkinetic](https://github.com/everkinetic/data) | CC BY-SA 4.0 | `446bb9a3d0c3beb6b84f7c9d77dfc8af707a2ab6` |
| [Open Exercise Illustrations](https://github.com/hitmanrepo/open-exercise-illustrations) | CC0 1.0 | `2786aefa4b36a08faeca8114e0d1eb0af3ef6732` |
| [Bryl Lim / Workout Guide](https://github.com/bryllim/workout-guide) | CC BY-SA 4.0 (artwork) | `aac599224bb9780305239607ef98540b7e0ce389` |

Images are copied unchanged. Only reviewed first/last frames are included for new mappings (one frame for static holds). Workout Guide includes derivatives of Everkinetic: per-frame original source, creator and upstream modification notices are retained in `frontend/public/exercise-media/provenance.json`, linked from its image credits. Full licences and attribution documents ship beside each source's assets. Preserve those credits and artwork licences when distributing JGym; artwork is licensed separately from application code.

White Workout Guide figures use a dark canvas in thumbnails and details in every theme. Static position buttons do not imply video or animation. Source figures are independent of the user's appearance/figure preference.

## Extending coverage

See [research findings](EXERCISE_IMAGE_RESEARCH.md) for sources investigated and exclusions. Add explicit verified mappings only; similar names alone are insufficient. Keep provenance and licences, update the gap list, and run media tests and the production build. Do not copy OpenGym's separately restricted Gym visual artwork.

Deploy using the normal `docker compose -f compose.jgym.yml up -d --build`; no media mount or paid service is needed.
