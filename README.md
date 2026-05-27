# ChaiForms

ChaiForms is a Next.js + tRPC monorepo for building and publishing forms.

Tech stack

- Next.js (app router)
- React 19
- tRPC, Zod, Drizzle (database layer)
- PNPM workspaces + Turborepo
- Tailwind, Radix UI

Documentation

- Live API docs: https://chai-forms-api.vercel.app/docs

Repository layout (top-level)

- `apps/web` — frontend (Next.js)
- `apps/api` — backend service
- `packages/services` — domain services (form, user, etc.)
- `packages/database` — DB config & migrations
- `packages/trpc` — shared trpc configuration

Getting started (local)

1. Prerequisites
   - Node >= 18
   - pnpm (recommended)

2. Install dependencies

```
pnpm install
```

3. Update environment variables

- If you update environment variables externally, run the repository helper to propagate them:

```
sh setup.sh
```

4. Run development servers

- Full workspace (recommended):

```
pnpm dev
```

- Frontend only (apps/web):

```
pnpm --filter web dev
```

Build & production

- Workspace build (runs builds for packages):

```
pnpm build
```

- Build frontend only:

```
pnpm --filter web build
```

Useful scripts (root)

- `pnpm dev` — start development (turbo)
- `pnpm build` — production build (turbo)
- `pnpm db:migrate` — run DB migrations
- `pnpm lint` — run linters
- `pnpm format` — run Prettier
- `pnpm run check-types` — run TypeScript checks

Environment / Deployment notes

- Vercel env vars (set in Vercel dashboard):
  - API project: `DATABASE_URL`, `JWT_SECRET`, `CLIENT_URL`, `BASE_URL`
  - Web project: `NEXT_PUBLIC_API_URL`
  - `BASE_URL`: public URL of the API (e.g. `https://your-api.vercel.app`)
  - `CLIENT_URL`: public URL of the frontend (e.g. `https://your-web.vercel.app`)
  - `NEXT_PUBLIC_API_URL`: API URL used by the frontend (e.g. `https://your-api.vercel.app/trpc`)

- For Vercel: set the project Root Directory for the web deployment to `apps/web` (do not point at `apps/web/app`). The web build outputs to `apps/web/.next`.

Docs

- API docs (if deployed): https://chai-forms-api.vercel.app/docs

Contributing

- Fork the repo, create a feature branch, open a PR with a clear description.

Contact

- Open an issue in this repository or contact the maintainers listed in the project.

---

_This README was generated/updated to provide a concise onboarding and developer reference for the ChaiForms monorepo._
