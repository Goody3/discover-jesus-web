# Discover Jesus Web

A lightweight admin UI for managing page definitions in the Discover Jesus
backend.

## Requirements

- Node.js 20.9 or newer; CI and [.nvmrc](.nvmrc) use Node 22
- The Discover Jesus backend and its SQL Server database

## Run locally

```sh
npm install
cp .env.example .env.local
npm run dev
```

By default, Vite forwards `/api` and `/health` requests to
`http://localhost:5187`. Set `VITE_API_PROXY_TARGET` in `.env.local` if the
backend runs at a different address. The backend must be running with its
database configured.

The UI supports creating, editing, and deleting pages, components, bindings,
and action definitions. JSON properties and configurations are edited as JSON.
Action definitions are stored by the backend and are not executed by the
management UI. The Reusable components workspace lists components by globally
unique friendly name, supports renaming, and creates and edits locale-specific
drafts with publishing, withdrawal, and deletion. Component UUIDs remain
internal identifiers; the page editor inserts references through a friendly-name
picker. Advanced page-section JSON remains available for direct editing.
If a page has published content but no draft for the selected locale, start a
draft from the published content before adding references so existing sections
and component links are preserved.
Published pages can be previewed using the backend-managed page-content API;
previews expand reusable component references and support page UUID navigation.
Conditional actions and content requiring runtime bindings are deliberately not
evaluated in preview.

## Quality checks

The [CI workflow](.github/workflows/ci.yml) runs on pull requests to `dev` or
`main` and on pushes to those branches. It installs from the lockfile with
`npm ci`, then checks formatting, lints, type-checks, builds, and runs the
tests. A separate job runs `npm audit`, reports every finding, and fails only
on High or Critical vulnerabilities. Run the same checks locally:

```sh
npm ci
npm run format:check
npm run lint
npm run typecheck
npm run build
npm test
npm run audit:ci
```

Use `npm run format` to apply Prettier formatting. ESLint includes React hooks
and accessibility (`jsx-a11y`) rules; suppress a finding only with an inline
comment that states the reason.

`npm test` runs two suites: the Node test runner for the preview renderer
(`tests/*.test.mjs`) and Vitest with React Testing Library and jsdom
(`tests/vitest/`) for `apiRequest` and the UI flows. The Vitest tests mock
`fetch` through `tests/vitest/fakeApi.ts`, so no backend is needed, and they
assert user-visible behavior rather than component structure. Run
`npx vitest` for watch mode.

To build the static UI:

```sh
npm run build
npm run preview
```

For deployments where the API is not served from the same origin, set
`VITE_API_BASE_URL` to the API origin when building and configure the backend
to allow the UI origin through CORS.
