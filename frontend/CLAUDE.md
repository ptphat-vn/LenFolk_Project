# LenFolk Frontend Context

This is the frontend for LenFolk, a Next.js app with public user pages, admin dashboards, and instructor workflows.

## Tech Stack

- Next.js `16.2.4` with App Router under `src/app`
- React `19.2.4`
- TypeScript
- Tailwind CSS v4
- shadcn/radix-style UI components in `src/components/ui`
- Axios for API calls
- Zustand with persistence for auth state
- React Hook Form + Zod for forms
- Sonner for toast notifications
- Lucide React for icons
- Recharts for charts

Important: this project uses a newer Next.js version. Before changing Next-specific APIs, routing conventions, or config behavior, check the local docs in `node_modules/next/dist/docs/`.

## Commands

Run commands from the `frontend` directory:

```bash
npm run dev
npm run build
npm run start
npm run lint
```

The dev server defaults to `http://localhost:3000`.

## Environment

API base URL is read from:

```env
NEXT_PUBLIC_API_URL
```

If it is not set, the frontend falls back to:

```txt
http://localhost:5000/api
```

## Project Structure

- `src/app`: Next.js App Router routes and layouts
- `src/app/user`: public/user-facing pages
- `src/app/admin`: admin pages and nested management screens
- `src/app/instructor`: instructor pages and dashboards
- `src/app/(auth)`: auth routes such as login
- `src/components`: feature and shared React components
- `src/components/ui`: reusable UI primitives
- `src/common`: shared table, filter, pagination, tabs, and button components
- `src/layouts`: admin and instructor shell layouts
- `src/lib/api`: typed API service modules grouped by domain
- `src/types`: shared domain and API response types
- `src/schema`: Zod schemas for forms/auth
- `src/stores`: Zustand stores
- `public/images`: brand and landing page assets

## API Convention

Use the shared Axios instance from `src/lib/axios.ts`.

- API modules live in `src/lib/api/*.api.ts`
- Each domain exposes an object such as `authApi` or `courseApi`
- Methods return `res.data`, usually typed as `APIResponse<T>`
- Request and response types should live in `src/types`
- Query params should be passed through Axios `params`
- Keep endpoint strings close to the API module that owns them

The Axios instance automatically attaches the access token from `useAuthStore`. On a `401`, it tries `/auth/refresh-token`, updates the store, and retries the original request. If refresh fails, it clears auth and redirects to `/login`.

## Auth Convention

Auth state is stored in `src/stores/authStore.ts`.

- Persisted storage key: `auth-storage`
- State includes `token`, `refreshToken`, and `user`
- Use `setToken` after login/refresh
- Use `clearToken` on logout or failed refresh

Because the store uses `localStorage`, avoid calling auth-dependent client behavior from server-only code.

## UI And Styling

- Prefer existing components in `src/components/ui` and shared helpers in `src/common`
- Use `cn` from `src/lib/utils.ts` for class merging
- Use `formatCurrency` for VND formatting
- Prefer Lucide icons over custom SVG for common UI actions
- Keep admin/instructor screens dense, scannable, and consistent with current layouts
- Keep public user pages visually polished and aligned with existing LenFolk branding/assets
- Use Sonner toasts through the configured root `Toaster` in `src/app/layout.tsx`

## Routing Notes

Top-level app areas:

- `/user`: public landing and user pages
- `/admin`: admin dashboard and management modules
- `/instructor`: instructor dashboard and content/revenue workflows
- `/login`: auth login route under `(auth)`

Use nested route folders and colocated `page.tsx` files following the current App Router structure.

## Development Guidelines

- Preserve existing folder ownership and naming patterns.
- Keep types explicit for API boundaries and form data.
- Do not duplicate API logic inside components; add or extend a domain API module.
- Prefer existing form schemas before introducing new validation logic.
- Avoid broad refactors when making small feature or bug changes.
- Run `npm run lint` after code changes when practical.
- Run `npm run build` for changes touching routing, layouts, Next config, or shared types.

## Existing Agent Rule

`AGENTS.md` currently contains the Next.js warning below, and it still applies:

> This version has breaking changes. APIs, conventions, and file structure may differ from older Next.js versions. Read the relevant guide in `node_modules/next/dist/docs/` before writing Next-specific code.
