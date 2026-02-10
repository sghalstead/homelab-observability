# Production Deployment

Production deployment and validation procedures for the homelab-observability project.

For complete deployment instructions and troubleshooting, see `docs/production.md`.

## Quick Reference

```bash
# Standard deploy (lint, build, restart)
npm run deploy

# Quick deploy (skip lint)
npm run deploy:quick

# Manual restart only
sudo systemctl restart homelab-observability
```

## When to Skip Deployment

Skip deployment only when:
- Changes are documentation-only (no code changes)
- Changes only affect test files
- The production service is intentionally stopped for maintenance

## Production Validation

After deploying, validate that changes have taken effect.

### Quick Validation

```bash
# Check service is running
npm run service:status

# Verify API responds correctly
curl -s http://localhost:3001/api/metrics/system | jq '.success'
```

### Full Validation Checklist

1. **Service Status:** `sudo systemctl status homelab-observability` (should be `active (running)`)
2. **API Health:** `curl -s http://localhost:3001/api/metrics/system` (should have `"success": true`)
3. **UI Verification:** Open http://localhost:3001, check browser console for errors
4. **Logs Check:** `npm run service:logs` (look for errors, verify metrics collection)

## Rollback Procedure

If validation fails, see `docs/production.md` for detailed troubleshooting and rollback steps.
