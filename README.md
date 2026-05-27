If i update my env outside and i want to update all env of my project then run cmd sh setup.sh
describe adds human readable description in the zod schema

1. Model in .../packages/services/user/model.ts
2. Make service in .../packages/services/user/index.ts
3.

## Vercel Env Vars

For deployment, set these values in Vercel:

- API project: `DATABASE_URL`, `JWT_SECRET`, `CLIENT_URL`, `BASE_URL`
- Web project: `NEXT_PUBLIC_API_URL`

What each one means:

- `BASE_URL`: public URL of the API deployment, for example `https://your-api.vercel.app`
- `CLIENT_URL`: public URL of the frontend deployment, for example `https://your-web.vercel.app`
- `NEXT_PUBLIC_API_URL`: API URL used by the frontend, for example `https://your-api.vercel.app/trpc`

For the web deployment, set the Vercel project Root Directory to `apps/web`.
Do not point it at `apps/web/app`; that path makes Vercel look for `.next` in the wrong place.

The web app builds to `apps/web/.next`, and the local Vercel config lives in [apps/web/vercel.json](apps/web/vercel.json).

DOCS: https://chai-forms-api.vercel.app/docs
