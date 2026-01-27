# Production Deployment Guide

This guide covers deploying and running homelab-observability in production on a Raspberry Pi or similar Linux system.

## Prerequisites

- **Node.js 18+** (LTS recommended)
- **npm 9+**
- **systemd** (standard on most Linux distributions)
- **sudo access** (for service management)

### Verify Prerequisites

```bash
node --version       # Should be 18.x or higher
npm --version        # Should be 9.x or higher
systemctl --version  # Should show systemd version
```

---

## Initial Setup

### 1. Clone and Install

```bash
cd /home/steven/code
git clone https://github.com/sghalstead/homelab-observability.git
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
| `PORT` | `3001` | HTTP server port (hardcoded in npm script) |
| `DATABASE_PATH` | `./data/prod.db` | SQLite database file path |
| `METRICS_COLLECTION_INTERVAL_MS` | `60000` | How often to collect metrics (ms) |
| `METRICS_RETENTION_HOURS` | `720` | How long to keep historical data (30 days) |

### 3. Build the Application

```bash
npm run build
```

### 4. Initialize Database

The SQLite database is created automatically on first run at `./data/prod.db` (production uses a separate database from development).

### 5. Install Systemd Service

```bash
./scripts/service-install.sh
```

This script:
- Copies the service unit file to `/etc/systemd/system/`
- Reloads the systemd daemon
- Enables the service to start on boot

### 6. Start the Service

```bash
sudo systemctl start homelab-observability
```

### 7. Verify Installation

```bash
# Check service status
sudo systemctl status homelab-observability

# Test the API
curl http://localhost:3001/api/metrics/system

# View in browser
open http://localhost:3001
```

---

## Deployment Workflow

After making changes to the codebase, deploy with:

```bash
npm run deploy
```

This will:
1. Check if service is installed
2. Verify/install dependencies
3. Run lint checks
4. Build production bundle
5. Restart the service

For faster deploys (skip lint):

```bash
npm run deploy:quick
```

---

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

# View only errors
journalctl -u homelab-observability -p err
```

### NPM Script Shortcuts

| Command | Description |
|---------|-------------|
| `npm run deploy` | Full deployment (lint, build, restart) |
| `npm run deploy:quick` | Deploy without lint checks |
| `npm run service:restart` | Restart service only |
| `npm run service:status` | Check service status and recent logs |
| `npm run service:logs` | Follow service logs in real-time |

---

## Development vs Production

| Aspect | Development | Production |
|--------|-------------|------------|
| Command | `npm run dev` | `npm start` (via systemd) |
| Port | 3000 | 3001 |
| Hot reload | Yes | No |
| Source maps | Yes | No |
| Optimized | No | Yes |

Both can run simultaneously since they use different ports:
- **Dev:** http://localhost:3000
- **Prod:** http://localhost:3001

---

## Troubleshooting

### Service Won't Start

1. **Check logs for errors:**
   ```bash
   journalctl -u homelab-observability -n 50
   ```

2. **Verify build exists:**
   ```bash
   ls -la .next/
   ```

3. **Test manually:**
   ```bash
   cd /home/steven/code/homelab-observability
   npm start
   ```

4. **Check permissions:**
   ```bash
   ls -la data/
   ```

### Port Already in Use

```bash
# Find what's using port 3001
sudo lsof -i :3001

# Kill the process if needed
sudo kill <PID>
```

### Database Locked

If you see "database is locked" errors:

1. Stop the service:
   ```bash
   sudo systemctl stop homelab-observability
   ```

2. Check for stale processes:
   ```bash
   pgrep -f "next start"
   ```

3. Kill any stale processes:
   ```bash
   pkill -f "next start"
   ```

4. Restart:
   ```bash
   sudo systemctl start homelab-observability
   ```

### High Memory Usage

On Raspberry Pi, if memory is constrained:

1. **Increase swap:**
   ```bash
   sudo dphys-swapfile swapoff
   sudo nano /etc/dphys-swapfile  # Set CONF_SWAPSIZE=1024
   sudo dphys-swapfile setup
   sudo dphys-swapfile swapon
   ```

2. **Reduce metrics retention** in `.env.production`:
   ```bash
   METRICS_RETENTION_HOURS=24  # Keep only 1 day
   ```

### Service Keeps Restarting

Check for crash loops:

```bash
journalctl -u homelab-observability -n 100 | grep -i error
```

Common causes:
- **Missing dependencies:** Run `npm ci`
- **Build errors:** Run `npm run build` manually
- **Port conflict:** Check if port 3001 is available
- **Node version mismatch:** Verify Node.js version

### Build Fails

```bash
# Clear Next.js cache and rebuild
rm -rf .next
npm run build
```

### Corrupted Build (500 Errors, Missing Modules)

If you see errors like:
- `Cannot find module './chunks/vendor-chunks/next.js'`
- `Cannot find module '.next/server/pages/_error.js'`
- 500 errors on pages that were working before

This indicates a corrupted build. The `.next` directory has invalid or missing files.

**Complete Clean Rebuild:**

```bash
# 1. Stop the service
sudo systemctl stop homelab-observability

# 2. Remove build artifacts AND node_modules
rm -rf .next node_modules

# 3. Reinstall dependencies
npm ci

# 4. Rebuild with explicit production environment
NODE_ENV=production npm run build

# 5. Restart service
sudo systemctl start homelab-observability

# 6. Verify
curl -s http://localhost:3001/api/metrics/system | jq '.success'
```

**Signs of a corrupted build:**
- `webpack-runtime.js` contains `eval-source-map` (development mode in production)
- Missing `pages/` directory in `.next/server/`
- Missing or incomplete `chunks/` directory
- `vendor-chunks/` exists instead of `chunks/` (development vs production structure)

---

## Backup and Recovery

### Database Backup

```bash
# Stop service first for clean backup
sudo systemctl stop homelab-observability

# Backup database
cp data/prod.db data/prod.db.backup

# Restart service
sudo systemctl start homelab-observability
```

### Automated Backup Script

Create a cron job for daily backups:

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * cp /home/steven/code/homelab-observability/data/prod.db /home/steven/code/homelab-observability/data/prod.db.$(date +\%Y\%m\%d)
```

### Restore from Backup

```bash
sudo systemctl stop homelab-observability
cp data/prod.db.backup data/prod.db
sudo systemctl start homelab-observability
```

---

## Updating

### Standard Update

```bash
# Pull latest changes
git pull

# Deploy (includes build and restart)
npm run deploy
```

### If Dependencies Changed

```bash
git pull
npm ci
npm run deploy
```

### Major Updates

For major version updates, check the changelog and:

```bash
git pull
npm ci
npm run db:push    # Apply any schema changes
npm run deploy
```

---

## Security Considerations

The systemd service includes security hardening:

- **NoNewPrivileges:** Prevents privilege escalation
- **ProtectSystem=strict:** Read-only access to system directories
- **ProtectHome=read-only:** Read-only access to home directories
- **ReadWritePaths:** Only allows writes to `data/` and `.next/`

### Network Access

By default, the service only listens on localhost. To expose externally:

1. Use a reverse proxy (nginx, caddy) for HTTPS
2. Or modify the Next.js config to bind to 0.0.0.0

---

## Monitoring the Monitor

### Check Resource Usage

```bash
# Memory and CPU usage
systemctl status homelab-observability

# Detailed process info
ps aux | grep next

# Database size
du -h data/prod.db
```

### Health Check Endpoint

```bash
# Quick health check
curl -s http://localhost:3001/api/metrics/system | jq '.success'
```

---

## Uninstalling

```bash
# Stop and disable service
sudo systemctl stop homelab-observability
sudo systemctl disable homelab-observability

# Remove service file
sudo rm /etc/systemd/system/homelab-observability.service
sudo systemctl daemon-reload

# Optionally remove data
rm -rf data/
```

---

## Quick Reference

| Task | Command |
|------|---------|
| Start service | `sudo systemctl start homelab-observability` |
| Stop service | `sudo systemctl stop homelab-observability` |
| View status | `npm run service:status` |
| View logs | `npm run service:logs` |
| Deploy changes | `npm run deploy` |
| Quick deploy | `npm run deploy:quick` |
| Backup database | `cp data/prod.db data/prod.db.backup` |

---

*Last Updated: 2026-01-27*
