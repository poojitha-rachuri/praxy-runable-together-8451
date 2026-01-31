# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview
React + Vite + Hono + Tailwind + Cloudflare Workers application for an educational finance simulator platform ("Praxy"). Uses Clerk for authentication and Cloudflare D1 (SQLite) for data persistence.

## Development Commands

### Setup
```bash
bun install                 # Install dependencies
bun cf-typegen             # Generate Cloudflare Worker types
bun db:generate            # Generate Drizzle migrations from schema
bun db:migrate             # Apply migrations to local D1 database
```

### Development
```bash
bun dev                    # Start Vite dev server with Cloudflare Workers
bun run check              # Pre-commit checks: types + build + deployment config
bun run lint               # Run ESLint
```

### Database
```bash
bun db:generate            # Generate new migration from schema changes
bun db:migrate             # Apply migrations locally
bun db:studio              # Open Drizzle Studio (database GUI)
```

### Build & Deploy
```bash
bun run build              # Build for production
bun run preview            # Build and preview production build locally
bun run deploy             # Deploy to Cloudflare Workers
```

### Adding UI Components
```bash
bun x shadcn@latest add button card dialog    # Add shadcn/ui components
```

## Architecture

### Client-Server Split
- **Client (React)**: `src/web/` - React app built with Vite, served as static assets
- **Server (Hono)**: `src/api/` - API routes running on Cloudflare Workers at `/api/*`
- **Unified Runtime**: Cloudflare Workers serves both the React SPA and API endpoints

### Routing
- **Client routing**: wouter (lightweight React Router alternative) in `src/web/app.tsx`
- **Server routing**: Hono router with base path `/api` in `src/api/index.ts`
- **Request flow**: Worker-first for `/api/*` paths, otherwise serve static React app

### Database Architecture
- **ORM**: Drizzle ORM with Cloudflare D1 (serverless SQLite)
- **Schema**: `src/api/database/schema.ts` defines 4 tables:
  - `users`: Clerk-synced user profiles with XP and streaks
  - `progress`: Per-simulator progress tracking (levels, badges, scores)
  - `sessions`: Individual quiz session logs
  - `badges`: Earned badge records
- **Migrations**: Auto-generated in `src/api/migrations/` via Drizzle Kit
- **Key pattern**: All user operations keyed by `clerkId` (Clerk user ID)

### Authentication
Uses Clerk (`@clerk/clerk-react`). User identity flows through:
1. Client authenticates with Clerk
2. Client sends `clerkId` in API requests (query params or body)
3. API routes validate and use `clerkId` for database operations

### API Design Patterns
- **REST-like**: GET for reads, POST for writes
- **Auto-create**: Missing records (user, progress) are created on-demand
- **JSON responses**: All responses follow `{ success: boolean, data/error }` pattern
- **Streak logic**: `/api/user` endpoint auto-updates daily streaks based on `lastActiveDate`

### Path Aliases
`@/` maps to `src/web/` (configured in vite.config.ts)

### Environment Variables
See `.env.example`. Key bindings:
- `BETTER_AUTH_SECRET`: Authentication secret
- `VITE_BASE_URL`: Base URL for the app
- Cloudflare bindings (DB, BUCKET) configured in `wrangler.json`

## Coding Conventions (from README)
- Functional programming preferred (use `const`, avoid `let`)
- Extract types into separate interfaces
- No explicit return types unless necessary
- Prefer early returns to reduce nesting
- Use switch statements or key-value maps instead of nested if statements
- Write tests for complex functionality

## Common Workflows

### Adding a New Simulator
1. Add route in `src/web/app.tsx`
2. Create page component in `src/web/pages/`
3. Add content/questions in `src/web/content/[simulator]/`
4. Ensure API routes handle new simulator name (already generic in most cases)

### Database Schema Changes
1. Modify `src/api/database/schema.ts`
2. Run `bun db:generate` to create migration
3. Run `bun db:migrate` to apply locally
4. Deploy will automatically apply migrations in production

### Running After Cloudflare Binding Changes
After modifying bindings in `wrangler.json` (D1, R2, KV, etc.):
```bash
bun cf-typegen    # Regenerate worker-configuration.d.ts
```
