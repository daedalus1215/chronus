# Chronus → Proxmox: Deployment Progress Log

Living status of bringing Chronus up on the homelab Proxmox via the
`homelab-infra` repo. Companion to the how-to in
[deploy-chronus-to-proxmox.md](./deploy-chronus-to-proxmox.md) — that's the
generic guide; this is the running record of *our* actual setup and decisions.

_Last updated: 2026-06-21._

---

## Where we are right now

**Status: config complete, about to run the first `terragrunt plan`.**

Blocked only on creating `secrets.env` (Proxmox API token + GitHub PAT). Once
that exists, the next action is:

```bash
source secrets.env && export TERRAGRUNT_TFPATH=tofu TG_TF_PATH=tofu \
  && cd live/homelab/chronus && terragrunt init && terragrunt plan
```

---

## Our environment (the concrete facts)

| Thing | Value |
|---|---|
| Proxmox node | `milkyway` |
| API endpoint | `https://172.16.0.156:8006/` (reachable from workstation ✅) |
| Storage (VM disks) | `local-zfs` (ZFS — **not** the default `local-lvm`) |
| Storage (cloud-init snippets) | `local` (dir storage; snippets require dir) |
| Template | VMID **9000**, `debian12-cloud` (genericcloud bookworm), verified ✅ |
| Network | LAN `172.16.0.x`; VM uses **DHCP** for the first test |
| SSH | ed25519 key `homelab`; provider auths to host via agent, key also lets us log into VMs |
| Tooling | `tofu`, `terragrunt`, `ansible` installed (no `terraform`; terragrunt driven via `TERRAGRUNT_TFPATH=tofu`) |
| IaC repo | `~/Nextcloud/nebechaunezzer/homelab-infra` (committed) |
| App repo | `github.com/daedalus1215/chronus-react-nestjs` (**private**, `main`) |

---

## What's done

1. **Built the `homelab-infra` repo** — generic `proxmox-vm` module + parameterised
   `node-app` module (composes the VM), Terragrunt `live/homelab/chronus/` stack,
   and an Ansible layer (`os_update` + generic `node_app` role) for day-2 ops.
2. **Validated the deploy logic offline** — `scripts/smoke-test-chronus.sh` clones
   Chronus fresh in a `node:20` container and runs the exact deploy steps. **Passed
   end-to-end:** backend installs (905 pkgs) + builds, all 39 migrations run against
   the symlinked db, frontend `dist` is produced, backend boots and maps routes
   under `/api/...`.
3. **Created the Proxmox template** (VMID 9000) on `local-zfs`.
4. **Wired the stack to our environment** — node `milkyway`, endpoint
   `172.16.0.156`, `datastore_id = local-zfs`, DHCP, real SSH public key.

## Issues hit & how we solved them (so we don't repeat them)

- **Storage name:** template create failed with `storage 'local-lvm' does not
  exist`. This node is ZFS → use **`local-zfs`** for disks (and the stack's
  `datastore_id`). Snippets must stay on a **dir** storage (`local`).
- **Smoke-test `npm ci` crash** (`Exit handler never called!`): red herring — the
  real error was `EAI_AGAIN`, i.e. the container couldn't resolve the npm registry
  via Docker's default DNS forwarder on this host. Fixed by `--dns 1.1.1.1` in the
  smoke script. Local-only; real VMs use LAN DNS.
- **SSH private key pasted into chat:** rotated immediately — regenerated the
  keypair, replaced `authorized_keys` on `milkyway`. Reminder: only ever share the
  `.pub`. Provider/host auth + VM login both use this one key.
- **`qm` line-wrap mangling:** multi-line `\` commands got corrupted on paste; use
  single-line `qm` commands.

---

## Next steps

**Immediate (current session):**
1. Create `secrets.env` (gitignored): `PROXMOX_API_TOKEN`, `GITHUB_TOKEN`,
   `CHRONUS_JWT_SECRET`, `CHRONUS_COOKIE_KEY`.
2. `terragrunt init && plan` — review; expect possible bpg provider field tweaks.
3. `terragrunt apply` → `terragrunt output ipv4_addresses`.
4. Verify: `ssh deploy@<ip>`, `systemctl status chronus-backend`, browse
   `http://<ip>/`, `curl http://<ip>/api/...`. First boot is slow (apt upgrade +
   two `npm ci` + builds) — watch `journalctl -u cloud-final`.

**Soon after it works:**
- Switch the VM from DHCP to a **static IP** once we pick a free one on `172.16.0.x`.
- Put **real SMTP** values in (currently placeholders that only satisfy Joi).
- Front it with the existing **Cloudflare** tunnel.

**Future (the broader homelab plan):**
- Add a **Postgres** stack (own module beside `node-app`) — the "real database"
  goal; migrate Chronus off SQLite when ready.
- Add a **RabbitMQ** stack — the message-broker goal.
- Move Terraform **state to a remote backend** (a small MinIO VM) once there are
  several stacks.
- Lean on the **Ansible** layer for OS patching + redeploys; consider scheduling
  `os-update.yml`.

---

## Open questions / decisions pending

- Static IP to reserve for the Chronus VM (vs. staying on DHCP).
- Whether Postgres lives in-cluster/VM vs. a dedicated DB host (stateful-data risk).
- GitHub PAT: confirm a read-only fine-grained token scoped to the Chronus repo.
