# Exercise images

JGym bundles unchanged Everkinetic SVG illustrations by Greg Priday under **CC BY-SA 4.0**. No account, subscription, API key, remote image service or purchase is required. Images ship in the frontend build and Linux Docker image. Existing service-worker media caching applies to these local paths.

Source: https://github.com/everkinetic/data at revision `446bb9a3d0c3beb6b84f7c9d77dfc8af707a2ab6`, `dist/svg`. Full licence and credits are shipped beside the assets in `frontend/public/exercise-media/everkinetic/`. Preserve attribution and the artwork licence when distributing the app. Artwork is licensed separately from the app code.

## Coverage

159 of 5,632 catalogue entries have mapped illustrations. **5,473 remain without a demonstration image**, listed in `exercise-image-gaps.csv`. This is partial coverage, not completion of the request for every exercise. The app keeps every existing exercise ID and workout history. Unmatched details explicitly state that an image is unavailable; they do not show an unrelated demonstration or muscle diagram. Use the library's “With demonstration images” filter to browse covered exercises.

Mappings are explicit in `frontend/src/lib/exercise-illustrations.json`, with catalogue names, source IDs, source titles and frame paths for review. The only inherited matches are the catalogue's explicit male/female counterparts of the same movement. These illustrations use the source artist's figure, independent of the appearance/figure preference. There is no fuzzy runtime substitution. Position buttons show the source's static demonstration frames, not video.

## Extending coverage

Add a verified illustration with permission for redistribution, retain its source and licence, and add an explicit exercise mapping. Confirm equipment, grip, posture and movement match; a similarly named exercise is insufficient. Update the coverage count and gap list, and run the media tests plus production build. Do not copy OpenGym's separately restricted Gym visual artwork into JGym. Free Exercise DB photos were not imported because their upstream provenance does not establish reusable image rights.

Deploy with the usual `docker compose -f compose.jgym.yml up -d --build`; no media mount or paid service is needed. The build includes the artwork automatically.
