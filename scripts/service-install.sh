#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

SERVICE_NAME="homelab-observability"
SERVICE_FILE="${SERVICE_NAME}.service"
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo -e "${YELLOW}=== Installing ${SERVICE_NAME} systemd service ===${NC}"
echo "Project directory: ${PROJECT_DIR}"
echo ""

# Check if service file exists
if [ ! -f "${PROJECT_DIR}/${SERVICE_FILE}" ]; then
    echo -e "${RED}Error: Service file not found at ${PROJECT_DIR}/${SERVICE_FILE}${NC}"
    exit 1
fi

# Check if .env.production exists
if [ ! -f "${PROJECT_DIR}/.env.production" ]; then
    echo -e "${YELLOW}Warning: .env.production not found. Creating from example...${NC}"
    if [ -f "${PROJECT_DIR}/.env.production.example" ]; then
        cp "${PROJECT_DIR}/.env.production.example" "${PROJECT_DIR}/.env.production"
        echo -e "${GREEN}Created .env.production from example.${NC}"
    else
        echo -e "${RED}Error: .env.production.example not found either.${NC}"
        exit 1
    fi
fi

# Check if production build exists
if [ ! -d "${PROJECT_DIR}/.next" ]; then
    echo -e "${YELLOW}Warning: Production build not found. Run 'npm run build' first.${NC}"
fi

# Ensure data directory exists with correct permissions
echo "Ensuring data directory exists..."
mkdir -p "${PROJECT_DIR}/data"

# Copy service file to systemd directory
echo "Copying service file to /etc/systemd/system/..."
sudo cp "${PROJECT_DIR}/${SERVICE_FILE}" /etc/systemd/system/

# Reload systemd daemon
echo "Reloading systemd daemon..."
sudo systemctl daemon-reload

# Enable service to start on boot
echo "Enabling service to start on boot..."
sudo systemctl enable ${SERVICE_NAME}

echo ""
echo -e "${GREEN}=== Installation complete ===${NC}"
echo ""
echo "Next steps:"
echo "  1. Build the production app:  npm run build"
echo "  2. Start the service:         sudo systemctl start ${SERVICE_NAME}"
echo "  3. Check status:              sudo systemctl status ${SERVICE_NAME}"
echo "  4. View logs:                 journalctl -u ${SERVICE_NAME} -f"
echo ""
