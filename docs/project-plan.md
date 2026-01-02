# Homelab Observability Service - Project Plan

**Project:** homelab-observability
**Purpose:** Monitor homelab services, AI workloads, and system metrics with a TypeScript full-stack application
**Created:** 2025-12-30

---

## Executive Summary

This project builds a comprehensive observability service for a homelab environment. The service monitors system metrics (CPU, memory, temperature, disk), Docker containers, systemd services, and AI workloads (Ollama). Built with Next.js and TypeScript, it provides a real-time dashboard with historical data visualization.

**Current State:** Project initialization

**Target State:**
- Real-time monitoring dashboard
- System metrics collection and display
- Docker container monitoring
- Systemd service management
- Ollama/AI workload monitoring
- Historical metrics storage and visualization
- Basic alerting on thresholds

**Key Strategy:**
- Spec-Driven Development: Document behavior, write tests, implement
- Incremental delivery: Each phase delivers working functionality
- Type-safe: TypeScript strict mode throughout

---

## Quick Reference

- **Total Tasks:** 24
- **Completed:** 7/24
- **In Progress:** None
- **Current Phase:** PHASE 1 (System Metrics Collection)

---

## Tech Stack

| Category | Technology | Purpose |
|----------|------------|---------|
| Framework | Next.js 14 (App Router) | Full-stack React framework |
| Language | TypeScript (strict) | Type-safe development |
| Database | SQLite + Drizzle ORM | Metrics storage |
| Testing | Vitest + RTL + Playwright | Unit, integration, E2E tests |
| UI | Tailwind CSS + shadcn/ui | Styling and components |
| Charts | Recharts | Data visualization |
| State | React Query | Server state management |

---

## Task Tracker

### PHASE 0: Project Setup

| Status | Task | Description | Dependencies |
|--------|------|-------------|--------------|
| [x] | **Task-01** | Initialize Next.js project with TypeScript | None |
| [x] | **Task-02** | Set up testing infrastructure (Vitest, RTL, Playwright) | Task-01 |
| [x] | **Task-03** | Configure linting and formatting (ESLint, Prettier) | Task-01 |
| [x] | **Task-04** | Set up database (SQLite + Drizzle ORM) | Task-01 |
| [x] | **Task-05** | Add UI dependencies (Tailwind, shadcn/ui, Recharts) | Task-01 |

### PHASE 1: System Metrics Collection

| Status | Task | Description | Dependencies |
|--------|------|-------------|--------------|
| [x] | **Task-06** | Implement system metrics collector (CPU, memory, temp, disk) | Task-04 |
| [x] | **Task-07** | Create API routes for system metrics | Task-06 |
| [ ] | **Task-08** | Add metrics persistence to database | Task-06, Task-04 |

### PHASE 2: Docker Integration

| Status | Task | Description | Dependencies |
|--------|------|-------------|--------------|
| [ ] | **Task-09** | Implement Docker API client | Task-04 |
| [ ] | **Task-10** | Create API routes for Docker containers | Task-09 |
| [ ] | **Task-11** | Add container metrics persistence | Task-09, Task-08 |

### PHASE 3: Systemd Integration

| Status | Task | Description | Dependencies |
|--------|------|-------------|--------------|
| [ ] | **Task-12** | Implement systemd service client | Task-04 |
| [ ] | **Task-13** | Create API routes for systemd services | Task-12 |
| [ ] | **Task-14** | Add service control endpoints (start/stop/restart) | Task-13 |

### PHASE 4: AI Workload Monitoring

| Status | Task | Description | Dependencies |
|--------|------|-------------|--------------|
| [ ] | **Task-15** | Implement Ollama API client | Task-04 |
| [ ] | **Task-16** | Create API routes for Ollama status and models | Task-15 |
| [ ] | **Task-17** | Add inference monitoring and metrics | Task-16 |

### PHASE 5: Dashboard UI

| Status | Task | Description | Dependencies |
|--------|------|-------------|--------------|
| [ ] | **Task-18** | Create dashboard layout and navigation | Task-05 |
| [ ] | **Task-19** | Build system metrics dashboard components | Task-07, Task-18 |
| [ ] | **Task-20** | Build Docker monitoring components | Task-10, Task-18 |
| [ ] | **Task-21** | Build systemd service management components | Task-13, Task-18 |
| [ ] | **Task-22** | Build AI workload monitoring components | Task-16, Task-18 |

### PHASE 6: Historical Data & Charts

| Status | Task | Description | Dependencies |
|--------|------|-------------|--------------|
| [ ] | **Task-23** | Implement historical metrics queries and charts | Task-08, Task-19 |

### PHASE 7: Polish & Documentation

| Status | Task | Description | Dependencies |
|--------|------|-------------|--------------|
| [ ] | **Task-24** | Final polish, error handling, and documentation | All tasks |

---

## Dependencies Matrix

### Critical Path
```
Task-01 → Task-02,03,04,05 → Task-06 → Task-07,08 → Task-19 → Task-23 → Task-24
```

### Parallel Execution Opportunities
- **After Task-01:** Tasks 02, 03, 04, 05 can run in parallel
- **After Task-04:** Tasks 06, 09, 12, 15 can start (different collectors)
- **After Task-18:** Tasks 19, 20, 21, 22 can run in parallel (UI components)

### Blocking Relationships
- **Task-01 blocks:** All subsequent tasks (foundation)
- **Task-04 blocks:** All data collection tasks (database required)
- **Task-18 blocks:** All UI component tasks (layout required)
- **Task-24 blocks:** Project completion

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js Application                      │
├─────────────────────────────────────────────────────────────┤
│  Frontend (React)                                            │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│  │   System    │ │   Docker    │ │  Services   │            │
│  │   Metrics   │ │  Containers │ │  (systemd)  │            │
│  └─────────────┘ └─────────────┘ └─────────────┘            │
│  ┌─────────────┐ ┌─────────────┐                            │
│  │  AI/Ollama  │ │   Charts    │                            │
│  │  Workloads  │ │  (History)  │                            │
│  └─────────────┘ └─────────────┘                            │
├─────────────────────────────────────────────────────────────┤
│  API Routes (/api/*)                                         │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│  │  /metrics   │ │  /docker    │ │  /services  │            │
│  └─────────────┘ └─────────────┘ └─────────────┘            │
│  ┌─────────────┐                                            │
│  │  /ollama    │                                            │
│  └─────────────┘                                            │
├─────────────────────────────────────────────────────────────┤
│  Data Layer                                                  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│  │   Drizzle   │ │   SQLite    │ │  Collectors │            │
│  │     ORM     │ │   Database  │ │  (systeminformation, │   │
│  └─────────────┘ └─────────────┘ │   dockerode, etc.)  │    │
│                                  └─────────────┘            │
└─────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
    ┌──────────┐       ┌──────────┐       ┌──────────┐
    │  Docker  │       │ Systemd  │       │  Ollama  │
    │  Daemon  │       │  D-Bus   │       │   API    │
    └──────────┘       └──────────┘       └──────────┘
```

---

## Data Models

### System Metrics
```typescript
interface SystemMetrics {
  id: number;
  timestamp: Date;
  cpuUsage: number;        // percentage
  cpuTemperature: number;  // celsius
  memoryTotal: number;     // bytes
  memoryUsed: number;      // bytes
  memoryPercent: number;   // percentage
  diskTotal: number;       // bytes
  diskUsed: number;        // bytes
  diskPercent: number;     // percentage
}
```

### Container Metrics
```typescript
interface ContainerMetrics {
  id: number;
  timestamp: Date;
  containerId: string;
  containerName: string;
  status: string;
  cpuPercent: number;
  memoryUsed: number;
  memoryLimit: number;
  networkRx: number;
  networkTx: number;
}
```

### Service Status
```typescript
interface ServiceStatus {
  name: string;
  description: string;
  loadState: string;
  activeState: string;
  subState: string;
  unitFileState: string;
}
```

### Ollama Status
```typescript
interface OllamaStatus {
  running: boolean;
  models: OllamaModel[];
  activeInferences: OllamaInference[];
}
```

---

## API Endpoints

### System Metrics
- `GET /api/metrics/system` - Current system metrics
- `GET /api/metrics/system/history?hours=24` - Historical metrics

### Docker
- `GET /api/docker/containers` - List all containers
- `GET /api/docker/containers/:id/stats` - Container stats
- `POST /api/docker/containers/:id/start` - Start container
- `POST /api/docker/containers/:id/stop` - Stop container

### Systemd Services
- `GET /api/services` - List monitored services
- `GET /api/services/:name` - Service details
- `POST /api/services/:name/start` - Start service
- `POST /api/services/:name/stop` - Stop service
- `POST /api/services/:name/restart` - Restart service

### Ollama
- `GET /api/ollama/status` - Ollama server status
- `GET /api/ollama/models` - Available models
- `GET /api/ollama/running` - Currently running inferences

---

## Success Criteria

### Technical Criteria
- [ ] All 24 tasks complete
- [ ] TypeScript strict mode with no errors
- [ ] All tests pass (unit, integration, E2E)
- [ ] Production build succeeds
- [ ] Application runs without console errors

### Functional Criteria
- [ ] Dashboard displays real-time system metrics
- [ ] Docker containers listed with live stats
- [ ] Systemd services can be viewed and controlled
- [ ] Ollama status and models visible
- [ ] Historical charts display correctly
- [ ] Data persists across restarts

### Quality Criteria
- [ ] Response times < 500ms for all API calls
- [ ] UI updates at reasonable intervals (5-10s)
- [ ] Error states handled gracefully
- [ ] Mobile-responsive design

---

## Risk Assessment

### High Risk
| Risk | Impact | Mitigation |
|------|--------|------------|
| Docker socket permissions | Blocks container monitoring | Document socket access setup |
| Systemd D-Bus access | Blocks service monitoring | Provide alternative polling approach |
| Raspberry Pi resource constraints | Performance issues | Optimize polling intervals, efficient queries |

### Medium Risk
| Risk | Impact | Mitigation |
|------|--------|------------|
| SQLite concurrency | Data corruption | Use WAL mode, proper locking |
| Ollama not installed | Feature unavailable | Graceful degradation, show disabled state |

### Low Risk
| Risk | Impact | Mitigation |
|------|--------|------------|
| CPU temp sensor unavailable | Missing metric | Return null, show "N/A" in UI |

---

## Future Enhancements (Post-MVP)

These features are out of scope for the initial implementation but documented for future work:

1. **Mastra AI Integration**
   - Natural language queries about metrics
   - Anomaly detection
   - Intelligent alerting

2. **Advanced Alerting**
   - Email/webhook notifications
   - Alert rules configuration
   - Alert history

3. **Multi-host Monitoring**
   - Agent-based collection from multiple machines
   - Centralized dashboard

4. **GPU Monitoring**
   - NVIDIA GPU stats (if available)
   - GPU temperature and utilization

---

## Progress Tracking

```
Progress: 7/24 tasks complete (29%)

PHASE 0: [#####] 5/5 complete (100%)
PHASE 1: [##-] 2/3 complete (67%)
PHASE 2: [---] 0/3 complete (0%)
PHASE 3: [---] 0/3 complete (0%)
PHASE 4: [---] 0/3 complete (0%)
PHASE 5: [-----] 0/5 complete (0%)
PHASE 6: [-] 0/1 complete (0%)
PHASE 7: [-] 0/1 complete (0%)
```

---

## References

- **Task Approach:** [task-approach.md](task-approach.md)
- **Task Files:** [tasks/](tasks/) directory
- **Project Prompt:** [../homelab-obs-project-promt.md](../homelab-obs-project-promt.md)

---

*Last Updated: 2026-01-02*
