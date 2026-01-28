# Task-29: API Specification Spike

**Phase:** PHASE 9 - API Specification
**Status:** Complete
**Dependencies:** None
**Decision:** [api-specification-decision.md](../api-specification-decision.md)

---

## Objective

Research and decide on the API specification approach for the project. Evaluate design-first methodology where API changes start at the spec level before implementation.

---

## Definition of Done

- [x] Evaluate at least 3 specification approaches
- [x] Document pros/cons for each approach
- [ ] Prototype one approach with a single endpoint (deferred to Task-30)
- [x] Decision documented with rationale
- [x] Implementation plan outlined for chosen approach

---

## Research Areas

### Options to Evaluate

| Approach | Description |
|----------|-------------|
| **Zod + zod-to-openapi** | Zod schemas generate both types and OpenAPI spec |
| **Manual OpenAPI YAML** | Hand-written openapi.yaml, separate from code |
| **TypeSpec** | Microsoft DSL that compiles to OpenAPI |

### Questions to Answer

1. **Migration effort:** How much work to convert existing types to schemas?
2. **Validation:** Does the approach provide runtime request validation?
3. **Drift prevention:** How does it prevent spec/code divergence?
4. **Tooling:** What documentation UI options exist (Swagger, Redoc)?
5. **Maintenance:** What's the ongoing overhead for new endpoints?

### Current API Inventory

| Method | Endpoint | Notes |
|--------|----------|-------|
| GET | /api/metrics/system | Current metrics |
| GET | /api/metrics/system/history | Historical with query params |
| GET | /api/services | List services |
| GET | /api/services/:name | Service details |
| POST | /api/services/:name/start | Control endpoint |
| POST | /api/services/:name/stop | Control endpoint |
| POST | /api/services/:name/restart | Control endpoint |

---

## Prototype Task

Pick **one endpoint** (suggested: `GET /api/metrics/system`) and:

1. Define its schema using the candidate approach
2. Generate or write the OpenAPI spec fragment
3. Serve documentation at `/api/docs` (or generate static)
4. Evaluate developer experience

---

## Deliverables

1. **Decision document** (`docs/api-specification-decision.md`)
   - Chosen approach with rationale
   - Trade-offs accepted
   - Migration strategy for existing endpoints

2. **Implementation outline** for Task-30+ (not executed in this spike)
   - Files to create
   - Dependencies to install
   - Estimated scope

---

## Validation Steps

1. Prototype serves OpenAPI spec
2. Documentation UI is accessible
3. Schema matches actual API behavior
4. Decision documented and committed

---

## Commit Message

[claude] Task-29: API specification spike - research and decision
