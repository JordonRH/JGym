# Free exercise-image research

Research combined Reddit discussions, repository issues, source manifests, licences and visual review. Community posts supplied leads; primary repository licences determined what was bundled. No paid sources were used.

| Source investigated | Finding / decision |
| --- | --- |
| [Open Exercise Illustrations](https://github.com/hitmanrepo/open-exercise-illustrations) | 415 movements, CC0 AI-generated WebP artwork. Imported reviewed exact matches; excluded equipment and posture mismatches. |
| [Workout Guide](https://github.com/bryllim/workout-guide) | 302 exercises with three SVG frames; assets CC BY-SA 4.0, distinct from MIT code. Imported selected first/last frames with frame-specific provenance. |
| [Everkinetic](https://github.com/everkinetic/data) | Revisited the original catalogue and added 34 mappings. Some source titles do not agree with the drawing; those were excluded. |
| [RepDB licence](https://github.com/RepDB/exercise-dataset/blob/main/LICENSE-DATA.md) | 650 entries; free in-app use with attribution, but raw/derived dataset redistribution restricted. Not bundled in this public repository. |
| [GymBells](https://github.com/gellyfish-ai/gymbells-exercises) | 631 exercises, CC BY-NC 4.0. Not imported because the noncommercial condition narrows downstream use. |
| [Free Exercise DB issue 13](https://github.com/yuhonas/free-exercise-db/issues/13) | Image ownership concerns acknowledged in the issue. Repository-level openness does not establish rights to scraped photographs. Not imported. |
| [wrkout contributing notice](https://github.com/wrkout/exercises.json/blob/master/CONTRIBUTING.md) | Scraped image provenance does not establish permission to redistribute. Not imported. |
| [wger](https://wger.de/en/software/api) | Checked exercise and licence data; many images overlap Everkinetic. No additional clearly verified matches imported in this pass. |
| [Flow dataset notice](https://github.com/ozansozuozgit/flow-exercise-dataset/blob/main/NOTICE.md) | Animated SVG collection with generation provenance/form limitations. Deferred pending stronger visual verification. |
| [sports-athletic issue 157](https://github.com/digital-athletic/sports-athletic/issues/157) | Discusses a large image collection, but publication was pending in the reviewed thread. Not an available verified source for this import. |

Community leads included [Reddit's public-domain exercise dataset discussion](https://www.reddit.com/r/datasets/comments/12u6gw1/open_public_domain_exercise_dataset_in_json/) and [fitness app illustration sourcing discussion](https://www.reddit.com/r/buildinpublic/comments/1rmj8bk/where_do_fitness_apps_get_these_exercise_muscle/). They raised useful provenance questions but were not treated as permission from image owners.

## Matching and exclusions

The import adds 255 catalogue mappings (203 Open Exercise Illustrations, 18 Workout Guide, 34 Everkinetic). Existing 159 mappings remain. Several catalogue entries can share a drawing when they describe the same movement; these are not 255 newly authored images.

Candidate names and aliases were compared, then first/last frames inspected in contact sheets. Exclusions included bodyweight sumo squats paired with weighted drawings, weighted pull-ups without visible added weight, a shrimp squat depicting a different squat, swimming depicting a machine, a dumbbell spider curl showing a barbell, and an original pullover title whose drawing depicts a pulldown. No unreviewed middle frames were imported. The selection is deliberately partial; the outstanding gap list is retained rather than claiming full coverage.

Source revisions and the bundled licensing/provenance files are listed in [Exercise images](EXERCISE_IMAGES.md). Future additions need the same exercise-specific review; a large downloadable collection alone does not solve correct matching.
