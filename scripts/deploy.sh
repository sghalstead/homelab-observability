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
