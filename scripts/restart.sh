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
