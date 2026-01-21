# Task-25: Create Systemd Service Unit File for Production

**Phase:** PHASE 8 - Production Deployment
**Status:** Complete
**Dependencies:** Task-01 (project must exist)

---

## Objective

Create a systemd service unit file that runs the Next.js application in production mode, with automatic startup on boot and restart on failure.

---

## Definition of Done

- [x] Systemd service unit file created (`homelab-observability.service`)
- [x] Service runs the production build (`npm start`)
- [x] Service starts automatically on system boot
- [x] Service restarts automatically on failure (with backoff)
- [x] Service runs as appropriate user (not root)
- [x] Environment variables configurable via environment file
- [x] Service can be managed with standard systemctl commands

---

## Implementation Details

### Step 1: Create Environment File

Create `/home/steven/code/homelab-observability/.env.production`:

```bash
NODE_ENV=production
PORT=3000
METRICS_COLLECTION_INTERVAL_MS=60000
METRICS_RETENTION_HOURS=168
```

### Step 2: Create Systemd Service Unit

Create `homelab-observability.service` in the project root:

```ini
[Unit]
Description=Homelab Observability Service
Documentation=https://github.com/your-repo/homelab-observability
After=network.target

[Service]
Type=simple
User=steven
Group=steven
WorkingDirectory=/home/steven/code/homelab-observability
EnvironmentFile=/home/steven/code/homelab-observability/.env.production
ExecStart=/usr/bin/npm start
Restart=on-failure
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=homelab-obs

# Security hardening
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=read-only
ReadWritePaths=/home/steven/code/homelab-observability/data

[Install]
WantedBy=multi-user.target
```

### Step 3: Install Service

```bash
# Copy service file to systemd directory
sudo cp homelab-observability.service /etc/systemd/system/

# Reload systemd daemon
sudo systemctl daemon-reload

# Enable service to start on boot
sudo systemctl enable homelab-observability

# Start the service
sudo systemctl start homelab-observability
```

### Step 4: Create Helper Scripts

Create `scripts/service-install.sh`:

```bash
#!/bin/bash
set -e

SERVICE_NAME="homelab-observability"
SERVICE_FILE="${SERVICE_NAME}.service"
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "Installing ${SERVICE_NAME} systemd service..."

# Copy service file
sudo cp "${PROJECT_DIR}/${SERVICE_FILE}" /etc/systemd/system/

# Reload systemd
sudo systemctl daemon-reload

# Enable service
sudo systemctl enable ${SERVICE_NAME}

echo "Service installed. Use 'sudo systemctl start ${SERVICE_NAME}' to start."
```

---

## Files Created/Modified

- `homelab-observability.service` - Systemd unit file
- `.env.production` - Production environment variables
- `scripts/service-install.sh` - Installation helper script

---

## Validation Steps

1. Install the service: `./scripts/service-install.sh`
2. Start the service: `sudo systemctl start homelab-observability`
3. Check status: `sudo systemctl status homelab-observability`
4. Verify app is running: `curl http://localhost:3000/api/metrics/system`
5. Check logs: `journalctl -u homelab-observability -f`
6. Test restart on failure: `sudo systemctl kill homelab-observability` (should auto-restart)
7. Test boot startup: reboot and verify service starts

---

## Notes

- Service runs as user `steven` to avoid permission issues with the codebase
- `ProtectHome=read-only` allows reading the codebase but prevents writes outside `data/`
- Uses `journal` for logging - view with `journalctl -u homelab-observability`
- RestartSec=10 prevents rapid restart loops on persistent failures
- The service expects a production build to exist (run `npm run build` first)

---

## Commit Message

```
[claude] Task-25: Create systemd service for production deployment

- Added systemd unit file with auto-restart and boot startup
- Created production environment file template
- Added service installation helper script
- Configured security hardening options
```
