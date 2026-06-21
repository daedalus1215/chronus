# Deploying Chronus to Proxmox with Terraform + Terragrunt + Ansible

How to provision a Proxmox VM and deploy the Chronus backend + frontend onto it,
using the central `homelab-infra` repo. Covers a Proxmox-free local smoke test
first, then the real provisioning run.

- **App:** Chronus — NestJS backend (TypeORM + SQLite) + Vite/React frontend.
- **IaC repo:** `~/Nextcloud/nebechaunezzer/homelab-infra/`
- **Provider:** `bpg/proxmox`

---

## Architecture

```
Terraform/Terragrunt ──creates──▶ Proxmox VM ──cloud-init (first boot)──▶ builds + runs Chronus
        │                                                                    ├─ nginx :80  (static frontend + /api proxy)
        │                                                                    └─ systemd   chronus-backend :3001
        └─ Ansible ──day-2──▶ OS patching + redeploys (after first boot)
```

The `homelab-infra` repo generalises this: a generic `proxmox-vm` module + a
parameterised `node-app` module. Chronus is one stack
(`live/homelab/chronus/`); every Chronus-specific detail is an *input*, not code.

---

## Chronus deployment gotchas (why the config looks the way it does)

Four non-obvious traps when deploying from a fresh `git clone`. All are handled
in the IaC, but know them:

1. **`frontend/vite.env.config.ts` is gitignored** → absent after clone, but
   `vite.config.ts` imports it, so the build fails without it. It is regenerated
   before building. Only `VITE_THOTH_WS_URL` (transcription WebSocket) affects the
   production bundle; the rest only matter to the dev/preview server.
2. **API is same-origin `/api`.** Frontend axios uses `baseURL: '/'` + an
   interceptor that prepends `/api`; the backend sets a global `/api` prefix
   (`app.setGlobalPrefix('api')`). So nginx proxies `/api` to the backend
   **without stripping the prefix** (`proxy_pass` has no trailing slash;
   `nginx_strip_prefix = false`). `VITE_API_URL` is NOT a production input.
3. **SQLite path mismatch.** Runtime reads `DATABASE` from env; TypeORM migrations
   hard-code `backend/db.sqlite`. A symlink `backend/db.sqlite → /var/lib/chronus/db.sqlite`
   keeps both pointed at the same persisted file (survives redeploys).
4. **Strict Joi env.** The backend won't boot without `JWT_SECRET`, `COOKIE_KEY`,
   `HERMES_API_URL`, `NODE_ENV`, `JWT_EXPIRES_IN`, and all `SMTP_*`. Placeholder
   SMTP values satisfy validation; email just won't work until set for real.

---

## Step 0 — Local smoke test (no Proxmox)

Validate the app-side logic in a throwaway container before touching Proxmox.
The script clones the repo **fresh** inside `node:20` (tracked files only — this
reproduces the VM scenario, including the missing `vite.env.config.ts`), then
runs the same env/symlink/build/migrate/boot steps.

```bash
cd ~/Nextcloud/nebechaunezzer/homelab-infra
scripts/smoke-test-chronus.sh
```

Pass = "frontend dist/index.html produced" and "backend boot probe: HTTP <code>"
(any HTTP code means the server booted). If this fails, the VM deploy will fail
too — fix it here first.

---

## Step 1 — Proxmox prerequisites

| Need | How to get it | Used as |
|---|---|---|
| API token | PVE UI → Datacenter → Permissions → API Tokens (user with `VM.Allocate`) | `PROXMOX_API_TOKEN` env |
| Endpoint + node | `https://<pve-ip>:8006/` and node name (e.g. `pve`) | `live/env.hcl` |
| Cloud-init template | Debian 12 cloud image as a template (recipe below); note its VMID | `template_id` in the stack |
| Network | Bridge (usually `vmbr0`); a free static IP or DHCP | stack `ipv4_*` |
| SSH public key | `cat ~/.ssh/id_ed25519.pub` | `live/env.hcl` |
| GitHub PAT | Repo is PRIVATE → read-only fine-grained PAT (Contents: Read) | `GITHUB_TOKEN` env |

**Create the cloud-init template (one-time, on the Proxmox host):**

```bash
cd /var/lib/vz/template
wget https://cloud.debian.org/images/cloud/bookworm/latest/debian-12-genericcloud-amd64.qcow2
qm create 9000 --name debian12-cloud --memory 2048 --cores 2 \
  --net0 virtio,bridge=vmbr0 --scsihw virtio-scsi-pci
qm set 9000 --scsi0 local-lvm:0,import-from=/var/lib/vz/template/debian-12-genericcloud-amd64.qcow2
qm set 9000 --ide2 local-lvm:cloudinit --boot order=scsi0 \
  --serial0 socket --vga serial0 --agent enabled=1
qm template 9000
```

(The cloud-init installs `qemu-guest-agent` itself so Terraform can read the
VM's IP back after boot.)

---

## Step 2 — Install tooling (Arch Linux)

```bash
sudo pacman -S opentofu ansible      # OpenTofu is in the official repos
yay -S terragrunt                    # AUR (or download the release binary)
export TERRAGRUNT_TFPATH=tofu        # make terragrunt drive OpenTofu
```

---

## Step 3 — Configure

1. `live/env.hcl` → `proxmox_endpoint`, `node_name`, `ssh_public_keys`.
2. `live/homelab/chronus/terragrunt.hcl` → `template_id`,
   `ipv4_address`/`ipv4_gateway` (or DHCP), `thoth_ws_url`.
3. The repo URL and Chronus quirks are already wired.

---

## Step 4 — Secrets (env vars; never committed)

```bash
export PROXMOX_API_TOKEN='terraform@pve!tf=xxxxxxxx-...'
export GITHUB_TOKEN='github_pat_...'                 # read-only PAT for the private repo
export CHRONUS_JWT_SECRET="$(openssl rand -hex 32)"
export CHRONUS_COOKIE_KEY="$(openssl rand -hex 32)"
```

---

## Step 5 — Provision

```bash
cd live/homelab/chronus
terragrunt init
terragrunt plan          # first real validation against your Proxmox
terragrunt apply
terragrunt output ipv4_addresses
```

---

## Step 6 — Verify

```bash
ssh deploy@<vm-ip>
systemctl status chronus-backend
journalctl -u chronus-backend -n 50
# from your workstation:
curl -i http://<vm-ip>/api/        # any HTTP response = backend up behind nginx
# open http://<vm-ip>/ in a browser for the SPA
```

First boot takes a few minutes (apt upgrade + two `npm ci` + builds). Watch:

```bash
cloud-init status --wait
journalctl -u cloud-final          # cloud-init runcmd output (build logs)
```

---

## Step 7 — Day-2 ops (Ansible)

```bash
cd ~/Nextcloud/nebechaunezzer/homelab-infra/ansible
# set inventory IP (hosts.ini) + export the same CHRONUS_*/GITHUB_TOKEN env vars
ansible-playbook playbooks/os-update.yml                  # patch + reboot-if-needed
ansible-playbook playbooks/deploy.yml --limit chronus-1   # redeploy latest
ansible-playbook playbooks/deploy.yml --check --diff      # dry run
```

---

## Troubleshooting

| Symptom | Likely cause | Check |
|---|---|---|
| Nothing built on the VM | private-repo clone failed (bad/absent PAT) | `journalctl -u cloud-final` for the `git clone` line |
| `terragrunt output ipv4_addresses` empty | guest agent not up yet / template missing it | wait 1–2 min; confirm template has `--agent enabled=1` |
| Backend crash-loops | missing required Joi env | `journalctl -u chronus-backend` (it names the missing key) |
| `/api/...` returns 404 for real routes | prefix stripped by proxy | ensure `nginx_strip_prefix = false` |
| `plan` errors on a provider field | bpg/proxmox vs your PVE version | adjust the field; first apply is the integration test |
| sqlite3 build error | template missing compiler | cloud-init installs `build-essential` + `python3`; check apt logs |

---

## Status / caveats

- The IaC was **not yet validated against a live Proxmox** — first `terragrunt
  apply` is the integration test.
- State is **local** by default; for many apps move it to an S3-compatible
  backend (e.g. a MinIO VM) in `live/terragrunt.hcl`.
- Builds run **on the VM**; fine at homelab scale, move to CI artifacts if heavy.
- Secrets are injected via env vars and land in TF state + the cloud-init
  snippet — acceptable for a private homelab; add SOPS/a vault before sharing.

## See also
- `homelab-infra/README.md` — repo structure and the generalise-don't-duplicate model.
- `homelab-infra/ansible/README.md` — day-2 ops detail (if present).
