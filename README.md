# Homelab Observability

A real-time monitoring dashboard for homelab environments, built with Next.js and TypeScript.

## Features (Planned)

- **System Metrics**: CPU, memory, temperature, and disk monitoring
- **Docker Monitoring**: Container status, stats, and control
- **Systemd Services**: View and control system services
- **Ollama Integration**: Monitor AI models and active inferences
- **Historical Data**: Time-series charts with configurable ranges
- **Dark Mode**: Full dark/light theme support

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Database**: SQLite + Drizzle ORM
- **UI**: Tailwind CSS + shadcn/ui
- **Charts**: Recharts
- **State**: React Query

## Project Status

In Development - See [docs/project-plan.md](docs/project-plan.md) for implementation progress.

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Documentation

- [Project Plan](docs/project-plan.md) - High-level plan with task tracker
- [Task Approach](docs/task-approach.md) - Development standards and workflow
- [Task Files](docs/tasks/) - Individual task specifications

## License

MIT
