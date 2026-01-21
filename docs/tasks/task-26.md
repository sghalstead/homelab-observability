# Task-26: Create Deployment Script

**Phase:** PHASE 8 - Production Deployment
**Status:** Complete
**Dependencies:** Task-25 (systemd service must exist)

---

## Objective

Create a deployment script that builds the application and restarts the production service, enabling simple one-command deployments from the development environment.

---

## Definition of Done

- [x] Deployment script created (`scripts/deploy.sh`)
- [x] Script builds the production application
- [x] Script restarts the systemd service
- [x] Script provides clear status output
- [x] Script handles errors gracefully
- [x] Script can be run from any directory
- [x] Optional: pre-deployment validation (lint, tests)

---

## Implementation Details

### Step 1: Create Deployment Script

Create `scripts/deploy.sh`:

```bash
#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

SERVICE_NAME="homelab-observability"
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo -e "${YELLOW}=== Homelab Observability Deployment ===${NC}"
echo "Project directory: ${PROJECT_DIR}"
echo ""

cd "${PROJECT_DIR}"

# Step 1: Check if service exists
echo -e "${YELLOW}[1/5] Checking service status...${NC}"
if ! systemctl list-unit-files | grep -q "${SERVICE_NAME}.service"; then
    echo -e "${RED}Error: Service not installed. Run ./scripts/service-install.sh first.${NC}"
    exit 1
fi
echo -e "${GREEN}Service found.${NC}"

# Step 2: Install dependencies (if needed)
echo -e "${YELLOW}[2/5] Checking dependencies...${NC}"
if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules" ]; then
    echo "Installing dependencies..."
    npm ci --production=false
else
    echo "Dependencies up to date."
fi
echo -e "${GREEN}Dependencies ready.${NC}"

# Step 3: Run linting (optional, can be skipped with --skip-checks)
if [[ "$1" != "--skip-checks" ]]; then
    echo -e "${YELLOW}[3/5] Running lint check...${NC}"
    npm run lint || {
        echo -e "${RED}Lint failed. Fix errors or use --skip-checks to bypass.${NC}"
        exit 1
    }
    echo -e "${GREEN}Lint passed.${NC}"
else
    echo -e "${YELLOW}[3/5] Skipping lint check (--skip-checks)${NC}"
fi

# Step 4: Build production
echo -e "${YELLOW}[4/5] Building production bundle...${NC}"
npm run build || {
    echo -e "${RED}Build failed!${NC}"
    exit 1
}
echo -e "${GREEN}Build complete.${NC}"

# Step 5: Restart service
echo -e "${YELLOW}[5/5] Restarting service...${NC}"
sudo systemctl restart ${SERVICE_NAME}

# Wait a moment for service to start
sleep 2

# Check service status
if systemctl is-active --quiet ${SERVICE_NAME}; then
    echo -e "${GREEN}=== Deployment successful! ===${NC}"
    echo ""
    echo "Service status:"
    systemctl status ${SERVICE_NAME} --no-pager -l | head -15
    echo ""
    echo -e "View logs: ${YELLOW}journalctl -u ${SERVICE_NAME} -f${NC}"
    echo -e "App URL:   ${YELLOW}http://localhost:3000${NC}"
else
    echo -e "${RED}=== Deployment failed! ===${NC}"
    echo "Service failed to start. Check logs:"
    echo "  journalctl -u ${SERVICE_NAME} -n 50"
    exit 1
fi
```

### Step 2: Create Quick Restart Script

Create `scripts/restart.sh` for quick restarts without rebuild:

```bash
#!/bin/bash
set -e

SERVICE_NAME="homelab-observability"

echo "Restarting ${SERVICE_NAME}..."
sudo systemctl restart ${SERVICE_NAME}

sleep 2

if systemctl is-active --quiet ${SERVICE_NAME}; then
    echo "Service restarted successfully."
    systemctl status ${SERVICE_NAME} --no-pager | head -10
else
    echo "Service failed to start!"
    journalctl -u ${SERVICE_NAME} -n 20 --no-pager
    exit 1
fi
```

### Step 3: Create Status Script

Create `scripts/status.sh`:

```bash
#!/bin/bash

SERVICE_NAME="homelab-observability"

echo "=== Service Status ==="
systemctl status ${SERVICE_NAME} --no-pager -l

echo ""
echo "=== Recent Logs ==="
journalctl -u ${SERVICE_NAME} -n 20 --no-pager
```

### Step 4: Update package.json

Add npm scripts for convenience:

```json
{
  "scripts": {
    "deploy": "./scripts/deploy.sh",
    "deploy:quick": "./scripts/deploy.sh --skip-checks",
    "service:restart": "./scripts/restart.sh",
    "service:status": "./scripts/status.sh",
    "service:logs": "journalctl -u homelab-observability -f"
  }
}
```

### Step 5: Make Scripts Executable

```bash
chmod +x scripts/deploy.sh
chmod +x scripts/restart.sh
chmod +x scripts/status.sh
chmod +x scripts/service-install.sh
```

---

## Files Created/Modified

- `scripts/deploy.sh` - Main deployment script
- `scripts/restart.sh` - Quick service restart
- `scripts/status.sh` - Service status check
- `package.json` - Added npm script shortcuts

---

## Validation Steps

1. Make scripts executable: `chmod +x scripts/*.sh`
2. Run deployment: `npm run deploy`
3. Verify build completed: check `.next/` directory timestamp
4. Verify service running: `npm run service:status`
5. Test quick deploy: `npm run deploy:quick`
6. Test restart: `npm run service:restart`
7. Test status: `npm run service:status`
8. Check logs: `npm run service:logs`

---

## Notes

- `npm ci` is used instead of `npm install` for reproducible builds
- The `--skip-checks` flag allows faster deploys when you're confident in the code
- Scripts use absolute paths so they can be run from any directory
- Color output makes it easy to spot errors
- The deploy script waits 2 seconds after restart to verify the service started

---

## Commit Message

```
[claude] Task-26: Create deployment and service management scripts

- Added deploy.sh for build and restart workflow
- Added restart.sh for quick service restarts
- Added status.sh for service health checks
- Added npm script shortcuts for convenience
```
