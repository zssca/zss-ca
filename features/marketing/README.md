# Marketing Feature Conventions

This directory houses all marketing portal features. Every feature follows the same structure:

1. `*-page.tsx` composes section components, stays < 15 lines, and is exported via `index.ts`.
2. `sections/` contains leaf UI. Each section bundles `*.tsx`, `*.data.ts`, `*.types.ts`, and an `index.ts` barrel.
3. `api/` (when needed) groups network logic:
   - `queries/` for read operations
   - `mutations/` for write operations and server actions
   - `schema.ts` for zod validation + derived types
   - `index.ts` re-exports everything so consumers import from `./api`

Current features with API needs (Pricing + Contact) already follow this pattern. New features should mirror the same layout so all imports look like `import { getFoo } from './api'` or `import type { FooInput } from './api'`.
