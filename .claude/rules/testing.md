# Testing

- Follow TDD: write failing tests before implementation code
- Use Vitest for unit/integration tests, Playwright for E2E
- Test behavior, not implementation details
- Use meaningful test descriptions that read as specifications
- Tests must be deterministic — no flaky tests, no timing dependencies
- Prefer running single test files (`npm run test:run -- path/to/test`) over the full suite during development
- Run full validation before committing: `npm run test:run && npm run lint && npm run build`
