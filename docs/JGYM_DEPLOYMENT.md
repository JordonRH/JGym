# JGym on Linux, behind Cloudflare

JGym runs the React frontend and OpenGym Node API on your Linux box. Cloudflare Tunnel routes your HTTPS hostname to the local web container. Cloudflare Pages is not required. The API and user records stay on your server; separate profiles use the existing authenticated OpenGym account system.

## Install

Install Docker Engine and the Compose plugin on your Linux host, then:

```sh
git clone https://github.com/JordonRH/JGym.git
cd JGym
cp .env.jgym.example .env
nano .env
docker compose -f compose.jgym.yml up -d --build
```

Set `RP_ID` to the exact hostname, e.g. `gym.yourdomain.com`, and `ORIGIN` to `https://gym.yourdomain.com` (no trailing slash). Use the final hostname before creating passkeys; passkeys are bound to that hostname. Set `RP_NAME=JGym`. The supplied stack builds JGym from source rather than pulling upstream OpenGym images.

## Connect Cloudflare

Create a remotely managed Cloudflare Tunnel. Set its published application hostname to your chosen hostname, service type HTTP, URL `web:80`. Put its token in `TUNNEL_TOKEN` in `.env`, then:

```sh
docker compose -f compose.jgym.yml --profile tunnel up -d --build
docker compose -f compose.jgym.yml logs --tail=100 cloudflared
```

If you already run cloudflared directly on the Linux host, omit the bundled tunnel and point the existing tunnel at `http://localhost:8080`. If your existing cloudflared is in another container, attach it to `jgym_default` and use `http://web:80`. Container localhost is not the host. The exposed web port is deliberately bound to loopback, and the API has no host port.

Do not cache `/api/*` in Cloudflare. Keep API responses, cookies and authentication requests dynamic. See the official [Tunnel setup](https://developers.cloudflare.com/tunnel/get-started/) and [token documentation](https://developers.cloudflare.com/tunnel/reference/tunnel-tokens/).

## Create your account and add people

1. Before sharing the address, restrict access to yourself (for example with a Cloudflare Access policy) and register your account on the final HTTPS address. `FIRST_USER_ADMIN=1` makes the first registered account administrator.
2. In `.env`, set `INVITE_ONLY=1`, then run `docker compose -f compose.jgym.yml up -d api`.
3. Open **People** in JGym. Generate an invitation code for each person. They open the same address, choose **Create new profile**, and enter the code. Each code is single use.
4. People keeps the upstream account disabling, password reset, activity history and invitation revocation controls. Accounts are separate; sign into the intended account before importing its data. Administrators can inspect workout and weight history through the existing admin dashboard.

The hostname must remain restricted during first-account setup: otherwise the first visitor could claim administrator. `ALLOW_GUEST=0` ensures people sign in. Password login is enabled alongside passkeys. Never put `.env` or `data/` in Git.

## Verify

Open the HTTPS hostname and confirm:

- Sign-up, sign-in, and sign-out work; People is visible only to your administrator.
- Log a weigh-in and a workout, refresh, and sign in from another device; both records remain.
- Choose a theme, save a height, and confirm both follow the same account.
- Import the CSV template and an XLSX worksheet; review before saving. Reimporting weigh-ins skips existing dates.
- An invited user can sign in and cannot access your profile or the admin API.

Inspect services with `docker compose -f compose.jgym.yml ps` and logs with `docker compose -f compose.jgym.yml logs --tail=100 api web`. A tunnel 502 usually means cloudflared cannot reach the configured `web:80` service.

## Back up and update

Back up `.env` securely and the whole `data/` folder, which includes accounts, session secrets, workouts and uploaded media. For a consistent filesystem backup, stop the API briefly:

```sh
docker compose -f compose.jgym.yml stop api
tar czf jgym-data-backup.tar.gz data
docker compose -f compose.jgym.yml start api
```

Store the backup outside the repository. To restore on a replacement host, stop the stack, restore `data/` and `.env` with the same ownership/permissions, and start the stack. Keep the same hostname for existing passkeys.

For an update, back up first, run `git pull`, and rebuild with `docker compose -f compose.jgym.yml --profile tunnel up -d --build`. Omit `--profile tunnel` if using your existing tunnel. To roll back, check out your previous commit and rebuild; restore the matching data backup if a future update changes its format.

## Continuous deployment from GitHub

The repository workflow runs the frontend and API checks for pull requests and `main` pushes. A successful push to `main` then deploys on the Docker host using a repository-scoped self-hosted GitHub Actions runner. The deployment pulls the latest `cloudflared` image, fast-forward updates the checkout, rebuilds JGym, and recreates the services in the tunnel profile.

The repository includes a runner container in `compose.deploy-runner.yml`. On the Docker host, after authenticating `gh` as a repository administrator, register and start it with:

```sh
sg docker -c 'RUNNER_TOKEN="$(gh api --method POST repos/JordonRH/JGym/actions/runners/registration-token --jq .token)" docker compose -f compose.deploy-runner.yml up -d --build'
sg docker -c 'docker compose -f compose.deploy-runner.yml up -d --force-recreate runner'
```

The first command uses GitHub's short-lived registration token; the second recreates the runner without retaining that token in its container environment. The runner keeps its registration under the ignored `deploy-runner-state-v2/` directory, uses the host Docker socket, and is labeled `self-hosted`, `linux`, `x64`, and `jgym-deploy`. Its separate Compose project restarts it after host reboots. The `deploy` job only runs on pushes to `main` after the GitHub-hosted checks pass; pull requests never run on the self-hosted runner.

Keep `.env` and `data/` only on the host; they are not taken from GitHub.

## Exercise images

JGym retains the open-source exercise catalogue, descriptions and muscle maps. The upstream Gym visual stills and animations are excluded because their licence is restricted to OpenGym. JGym displays neutral exercise icons; custom exercises can still use your own uploaded images and videos. See `JGYM_UPSTREAM.md`, `NOTICE.md`, and `LICENSE`.
