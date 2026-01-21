#!/bin/bash

SERVICE_NAME="homelab-observability"

echo "=== Service Status ==="
systemctl status ${SERVICE_NAME} --no-pager -l

echo ""
echo "=== Recent Logs ==="
journalctl -u ${SERVICE_NAME} -n 20 --no-pager
