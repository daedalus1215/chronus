# Chronus

Personal knowledge management with time tracking.

## Overview

Chronus is a full-stack personal knowledge management app built around the idea that time is first-class.

- **Notes** — Markdown notes with search, tags, and folders
- **Checklists** — Task lists within notes
- **Time tracking** — Track time on notes, view streaks, daily/weekly trends, and most active notes
- **Yearly notes** — Timeline view organized by year
- **Audio** — Voice memos
- **AI-powered wiki** — LLM-powered knowledge management

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React + Vite + MUI + React Query |
| Backend | NestJS + TypeORM + Postgres |
| Styling | CSS Modules + MUI `sx` prop |
| Auth | OIDC / JWT |

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Backend

```bash
cd backend
npm install
npm run start:dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Development

- Backend dev server: `npm run start:dev` (hot reload)
- Frontend dev server: `npm run dev` (Vite)
- Run tests: `npm test`
- Generate DB migration: `npm run migration:generate`

## License

MIT

