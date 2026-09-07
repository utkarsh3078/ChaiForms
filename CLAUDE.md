# ChaiForms

A form builder + public form-filling app. Users sign up, create forms with typed fields, share a
public link (`/form/<formId>`), and read submissions from a dashboard.

Turborepo + pnpm workspaces monorepo (`apps/*`, `packages/*`). Root package name is
`trpc-monorepo`; the deployable apps are `web` (Next.js) and `@repo/api` (Express).

## Commands

Run from the repo root. Root scripts wrap turbo in `dotenv --`, so the root `.env` is loaded first.

- `pnpm dev` — all packages (web on :3000, api on :8000)
- `pnpm --filter web dev` / `pnpm --filter @repo/api dev` — one app
- `pnpm build`, `pnpm lint`, `pnpm check-types`, `pnpm format`
- `pnpm db:generate` then `pnpm db:migrate` — Drizzle migration generate/apply
- `pnpm --filter @repo/database dev` — Drizzle Studio
- `sh setup.sh` — copies `.env.example` → `.env` and hard-links it into every workspace package.
  Env vars live in ONE root `.env`; re-run this after adding a package or changing env vars.
- `docker compose up -d` — local Postgres 15 on :5432 (`postgres/postgres`, db `dev`)

There is no test suite and `.github/workflows/` is empty — verification is `pnpm check-types` +
`pnpm build`.

## Architecture

The whole API surface is one tRPC router shared through workspace packages. Nothing talks to the
database except `packages/services`.

```
apps/web (Next.js 16, React 19, app router)
   └─ trpc react-query client → HTTP → apps/api (Express 5)
                                          └─ @repo/trpc serverRouter
                                                └─ @repo/services (business logic)
                                                      └─ @repo/database (Drizzle + Postgres)
```

- `packages/trpc/server/index.ts` — `serverRouter` = `{ health, auth, form }`. Type-only import
  chain (`@repo/trpc/client`) is what gives the web app end-to-end types.
- `apps/api/src/server.ts` mounts the same router twice: `/trpc` (tRPC adapter, used by the web
  app) and `/api` (REST via `trpc-to-openapi`), plus `/openapi.json` and Scalar docs at `/docs`.
  Every procedure therefore needs `.meta({ openapi: { method, path, tags } })`, an `.input()` and
  an `.output()` — `trpc-to-openapi` requires all three.
- Workspace packages ship raw TypeScript with no `main`/`exports` field; imports address files
  directly (`@repo/database/models/user`, `@repo/services/user`, `@repo/trpc/server`).
  The API bundles them with tsup; Next.js compiles them in-process.

## Conventions

**Procedures.** Each route folder has `route.ts` (procedures) and `model.ts` (zod input/output
models, one exported `xInputModel`/`xOutputModel` pair per procedure). Paths are built with
`generatePath("/form")("/createForm")`. Use `publicProcedure` for anonymous access and
`authenticatedProcedure` (in `packages/trpc/server/trpc.ts`) when the caller must be logged in —
it reads the auth cookie, verifies the JWT, and puts `ctx.user.id` in context.

**Services.** `packages/services/*/index.ts` exports a default class; `packages/trpc/server/
services/index.ts` instantiates the singletons (`userService`, `formService`) that routes import.
Every public service method re-parses its payload with `await someInput.parseAsync(payload)` from
the sibling `model.ts`, and throws plain `Error`s on failure. Drizzle returns arrays, so results
are guarded with `if (!result || result.length === 0 || !result[0]?.id) throw ...`
(`noUncheckedIndexedAccess` is on).

**Dates over the wire.** DB columns are `timestamp`; tRPC outputs are ISO strings. Routes do the
`Date` → `.toISOString()` conversion (with `?? null` for nullable `createdAt`/`updatedAt`);
inputs use `z.coerce.date()`.

**Auth.** Cookie-based, not header-based. `authentication_token` is an httpOnly JWT signed with
`JWT_SECRET`; passwords are salted with `randomBytes(16)` and hashed with HMAC-SHA256. Cookie
helpers are in `packages/trpc/server/utils/cookie.ts` — `secure`/`sameSite: "none"` only in
production, which is what makes cross-origin web→api auth work on Vercel. The tRPC clients set
`credentials: "include"`. Sign-out is done by the Next.js route handler
`apps/web/app/api/logout/route.ts` (same-origin cookie clear), not by the tRPC procedure.

**Web data access.** Components never call tRPC directly — they use the wrapper hooks in
`apps/web/hooks/api/` (`useUser`, `useListForms`, `useCreateField`, …). Each hook renames
`mutateAsync` to something descriptive, re-exports the query/mutation status flags, and
invalidates the right `trpc.useUtils()` keys in `onSuccess`. Add a new hook there rather than
using `trpc.*` in a page. Note `staleTime: Infinity` in `providers/global.tsx` — cache
invalidation in the hook is the only thing that refreshes data.

**Web UI.** shadcn/ui (new-york style, neutral base) in `components/ui/`, feature components in
`components/dashboard/`. Imports use the `~/` alias. Tailwind v4 (`@tailwindcss/postcss`, no
tailwind config file — tokens live in `app/globals.css`). Dark mode is forced via `className="dark"`
on `<html>`. Forms use react-hook-form. Icons: `lucide-react` and `@tabler/icons-react`.

## Data model

`packages/database/models/`, all re-exported from `schema.ts` (drizzle-kit reads that file).

- `users` — `fullName`, unique `email`, `salt`, `password` (hash), `profileImageUrl`
- `forms` — `title` (≤60), `description` (≤500), `createdBy` → users, `expiryTime`, `expiryDate`
- `forms_fields` — `formId` → forms, `fieldLabel` (column `field_display_text`), `fieldKey`,
  `isRequired`, `type` (enum `TEXT | EMAIL | NUMBER | DATE | YES_NO | PASSWORD`),
  `index` (numeric, ordering), unique on `(formId, index)`
- `form_submissions` — `formId` → forms, `values` as a JSON array of `{ formFieldId, value }`

Note the naming mismatch: the DB/service field is `fieldLabel`, but tRPC and service inputs call
it `fieldDisplayText`. `index` is `numeric` so it round-trips as a **string** — services do
`String(parsed.index)` on write and callers do `Number(field.index)` to sort.

Submissions are gated on `expiryTime` in `FormService.createSubmission` — an expired form rejects
new submissions.

## Environment

Root `.env` (propagated by `setup.sh`): `DATABASE_URL`, `JWT_SECRET`, `BASE_URL`, `CLIENT_URL`,
`NEXT_PUBLIC_API_URL`, optional `PORT`, `NODE_ENV`, `LOGGER_LEVEL`, and the optional
`GOOGLE_OAUTH_*` trio (Google sign-in is only half-built: `getAuthenticationMethods` exists in
`UserService` but no procedure exposes it).

Each package validates its own slice with zod in an `env.ts` and throws at import time on a miss —
`@repo/database` needs `DATABASE_URL`, `@repo/services` needs `JWT_SECRET`, `apps/api` needs
`BASE_URL`/`CLIENT_URL`. `CLIENT_URL` is also the single allowed CORS origin.

Deployment is two Vercel projects. The web project's root directory must be `apps/web`.
`NEXT_PUBLIC_API_URL` must include the `/trpc` suffix. `apps/api/api/index.ts` is the Vercel
serverless entry; `apps/api/src/index.ts` skips `listen()` when `process.env.VERCEL === "1"`.
