# JGym source and attribution

Based on [DuarteSantos8/openGym](https://github.com/DuarteSantos8/openGym), snapshot `e348fc17c42c7e9a211c5972e573ad3698190ee2`.

Original code copyright (C) 2026 Duarte Santos, under AGPL-3.0-or-later. JGym modifications are distributed under the same licence. Original copyright and third-party notices are retained in `LICENSE` and `NOTICE.md`. The source link is available in the overview footer and Settings.

JGym adds a dashboard, Sage/Sand/Midnight appearances, a dedicated weigh-in and adult BMI page, CSV/XLSX worksheet selection and weight-column mapping, and a Linux/Cloudflare deployment configuration. Existing workout, plan, account, invite, sync and backup behaviour comes from OpenGym.

The upstream `catalogue/media/still` and `catalogue/media/clip` assets are NOT part of JGym. Their separate Gym visual licence grants use inside OpenGym only. The JGym source snapshot intentionally excludes those files and upstream history that contains them. Original exercise icons are used instead, and own-media uploads remain available. The original licence notice is kept for provenance; statements in upstream documentation that media are bundled refer to OpenGym, not this fork.

Upstream deployment/mirror/release workflows are not enabled for JGym. Use `compose.jgym.yml`, which builds local source, rather than upstream prebuilt images.
