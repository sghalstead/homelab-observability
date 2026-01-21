# Task-27: Document Production Setup and Deployment

**Phase:** PHASE 8 - Production Deployment
**Status:** Complete
**Dependencies:** Task-26 (deployment scripts must exist)

---

## Objective

Create comprehensive documentation for setting up and running the application in production, including initial setup, deployment workflow, troubleshooting, and maintenance procedures.

---

## Definition of Done

- [x] Production setup guide created in README or dedicated doc
- [x] Prerequisites documented (Node.js version, permissions, etc.)
- [x] Initial setup steps documented
- [x] Deployment workflow documented
- [x] Service management commands documented
- [x] Troubleshooting section with common issues
- [x] Log access and monitoring documented

---

## Implementation Details

### Step 1: Create Production Documentation

Create `docs/production.md`:

```markdown
# Production Deployment Guide

This guide covers deploying and running homelab-observability in production on a Raspberry Pi or similar Linux system.

## Prerequisites

- **Node.js 18+** (LTS recommended)
- **npm 9+**
- **systemd** (standard on most Linux distributions)
- **sudo access** (for service management)

### Verify Prerequisites

```bash
node --version  # Should be 18.x or higher
npm --version   # Should be 9.x or higher
systemctl --version  # Should show systemd version
```

## Initial Setup

### 1. Clone and Install

```bash
cd /home/steven/code
git clone <repository-url> homelab-observability
cd homelab-observability
npm ci
```

### 2. Configure Environment

Copy and edit the production environment file:

```bash
cp .env.production.example .env.production
nano .env.production
```

Available settings:

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | HTTP server port |
| `METRICS_COLLECTION_INTERVAL_MS` | `60000` | How often to collect metrics (ms) |
| `METRICS_RETENTION_HOURS` | `168` | How long to keep historical data (7 days) |

### 3. Build the Application

```bash
npm run build
```

### 4. Initialize Database

The SQLite database is created automatically on first run at `./data/observability.db`.

### 5. Install Systemd Service

```bash
./scripts/service-install.sh
```

### 6. Start the Service

```bash
sudo systemctl start homelab-observability
```

### 7. Verify Installation

```bash
# Check service status
sudo systemctl status homelab-observability

# Test the API
curl http://localhost:3000/api/metrics/system

# View in browser
open http://localhost:3000
```

## Deployment Workflow

After making changes to the codebase, deploy with:

```bash
npm run deploy
```

This will:
1. Check dependencies
2. Run lint checks
3. Build production bundle
4. Restart the service

For faster deploys (skip lint):

```bash
npm run deploy:quick
```

## Service Management

### Common Commands

```bash
# Start service
sudo systemctl start homelab-observability

# Stop service
sudo systemctl stop homelab-observability

# Restart service
sudo systemctl restart homelab-observability
# Or use: npm run service:restart

# Check status
sudo systemctl status homelab-observability
# Or use: npm run service:status

# Enable auto-start on boot
sudo systemctl enable homelab-observability

# Disable auto-start
sudo systemctl disable homelab-observability
```

### Viewing Logs

```bash
# Follow logs in real-time
journalctl -u homelab-observability -f
# Or use: npm run service:logs

# View last 100 lines
journalctl -u homelab-observability -n 100

# View logs since last boot
journalctl -u homelab-observability -b

# View logs from specific time
journalctl -u homelab-observability --since "2024-01-01 12:00:00"
```

## Development vs Production

| Aspect | Development | Production |
|--------|-------------|------------|
| Command | `npm run dev` | `npm start` (via systemd) |
| Port | 3000 | 3000 (configurable) |
| Hot reload | Yes | No |
| Source maps | Yes | No |
| Optimized | No | Yes |

You can run both simultaneously on different ports if needed.

## Troubleshooting

### Service Won't Start

1. Check logs for errors:
   ```bash
   journalctl -u homelab-observability -n 50
   ```

2. Verify build exists:
   ```bash
   ls -la .next/
   ```

3. Test manually:
   ```bash
   cd /home/steven/code/homelab-observability
   npm start
   ```

4. Check permissions:
   ```bash
   ls -la data/
   ```

### Port Already in Use

```bash
# Find what's using port 3000
sudo lsof -i :3000

# Kill the process or change PORT in .env.production
```

### Database Locked

If you see "database is locked" errors:

1. Stop the service: `sudo systemctl stop homelab-observability`
2. Check for stale processes: `pgrep -f "next start"`
3. Kill any stale processes
4. Restart: `sudo systemctl start homelab-observability`

### High Memory Usage

On Raspberry Pi, if memory is constrained:

1. Increase swap:
   ```bash
   sudo dphys-swapfile swapoff
   sudo nano /etc/dphys-swapfile  # Set CONF_SWAPSIZE=1024
   sudo dphys-swapfile setup
   sudo dphys-swapfile swapon
   ```

2. Reduce metrics retention in `.env.production`

### Service Keeps Restarting

Check for crash loops:

```bash
journalctl -u homelab-observability -n 100 | grep -i error
```

Common causes:
- Missing dependencies: run `npm ci`
- Build errors: run `npm run build` manually
- Port conflict: check if port is available

## Backup and Recovery

### Database Backup

```bash
# Stop service first for clean backup
sudo systemctl stop homelab-observability

# Backup database
cp data/observability.db data/observability.db.backup

# Restart service
sudo systemctl start homelab-observability
```

### Restore from Backup

```bash
sudo systemctl stop homelab-observability
cp data/observability.db.backup data/observability.db
sudo systemctl start homelab-observability
```

## Updating

```bash
# Pull latest changes
git pull

# Deploy (includes build and restart)
npm run deploy
```

If there are dependency changes:

```bash
npm ci
npm run deploy
```
```

### Step 2: Create Environment Example File

Create `.env.production.example`:

```bash
# Production Environment Configuration
# Copy to .env.production and adjust as needed

NODE_ENV=production
PORT=3000

# Metrics collection interval in milliseconds (default: 60 seconds)
METRICS_COLLECTION_INTERVAL_MS=60000

# How long to retain historical metrics in hours (default: 7 days)
METRICS_RETENTION_HOURS=168
```

### Step 3: Update Main README

Add a "Production Deployment" section to the main README.md with a link to the detailed guide.

---

## Files Created/Modified

- `docs/production.md` - Comprehensive production guide
- `.env.production.example` - Environment template
- `README.md` - Add production section with link to guide

---

## Validation Steps

1. Follow the guide from scratch on a clean system
2. Verify all commands work as documented
3. Test troubleshooting steps
4. Have someone else follow the guide and note any confusion

---

## Notes

- Documentation should be kept up to date as the deployment process evolves
- Include actual command output examples where helpful
- Link to relevant external documentation (systemd, Next.js, etc.)

---

## Commit Message

```
[claude] Task-27: Document production setup and deployment

- Created comprehensive production deployment guide
- Added environment configuration template
- Documented troubleshooting and maintenance procedures
- Added backup and recovery instructions
```
