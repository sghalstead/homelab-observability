## Observability Service Project - Initial Prompt

I'd like to use this homelab to experiment with AI development and AI-powered
  apps. As a starting point, I'd like to build out an observability app/service
  that lets me easily monitor the services and AI workloads running on the server,
  alongside system metrics (cpu/memory usage, cpu temperature, etc)

  Key Points
  - I'd like to use Typescript for the full stack (as a learning opportunity)
    - In particular, use Mastra if/where it makes sense: https://mastra.ai/docs
  - I'd like to use modern open source tools/frameworks whenever possible
  - I'd like the code to be set up in a new repo under the ~/code directory
  
  Approach
  - Review the docs in ~/code/claude-specs/ before you start.
  - Work on this observability service in the same style as the example plan/task/approach docs.
  - Set up "approach" docs before you begin (ex: `task-approach.md`, etc) and commit those files to the repo
  - Create a high-level project plan that breaks down into tasks.
  - Create `task-##.md` files for each task with implementation details.
  - Commit work to the repo as you go, one commit per task (squash as needed)
  - Follow a Spec-Driven Development / Test-Driven Development approach:
    - Document the system behavior
    - Implement tests for that behavior
    - Implement the behavior
    - Validate with tests (unit, integration, and end-to-end)