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

Management page selection and loading use each page's public UUID through
`GET /api/pages/by-public-id/{pageId}`. This returns the same inline management
content, including unpublished pages, as the retained backend slug lookup;
it is separate from localized published-content delivery. Slugs remain editable
display fields, and create/update/delete operations still use their existing
request shapes and integer mutation IDs. There is no silent retry through the
slug route if UUID loading fails. Deploy the backend UUID lookup before this
client update; legacy route removal and iOS fallback retirement are not included.

## Quality checks

The [CI workflow](.github/workflows/ci.yml) runs on pull requests to `dev` or
`main` and on pushes to those branches. It installs from the lockfile with
`npm ci`, then checks formatting, lints, type-checks, builds, and runs the
tests. It also verifies the pinned backend contract and generated API types.
A separate job runs `npm audit`, reports every finding, and fails only
on High or Critical vulnerabilities. Run the same checks locally:

```sh
npm ci
npm run api:check
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

`npm test` runs the Vitest suite in `tests/vitest/`, including preview renderer
tests, with React Testing Library and jsdom. The tests mock `fetch` through
`tests/vitest/fakeApi.ts`, so no backend is needed, and assert user-visible
behavior rather than component structure. Vitest measures coverage for `src/`,
prints a summary in the test output, and writes LCOV and Cobertura reports to
`coverage/`; CI uploads these reports as an artifact. Coverage thresholds are
not enforced until the platform owner approves them. Run `npx vitest` for watch
mode.

## Backend API types

[api/backend.openapi.json](api/backend.openapi.json) is a byte-for-byte copy of
the owning backend HTTP contract, not the separate shared OpenAPI or content
schemas. [api/backend-revision.json](api/backend-revision.json) records the full
backend commit SHA and SHA-256 digest. The generated
[types](src/generated/backend-api.ts) come from pinned `openapi-typescript`
and Prettier versions in the lockfile. CI uses these checked-in files offline;
it needs no sibling backend checkout, running API, or cross-repository token.

To consume an intentional backend contract update, select a reviewed backend
commit and run:

```sh
npm run api:update -- <full-backend-commit-sha>
npm run api:check
npm run typecheck
```

Retrieval uses GitHub's contents API for
`Goody3/discover-jesus-backend/api/openapi.json` at that exact commit. For a private
repository, provide `GITHUB_TOKEN` with read access to that backend repository
through your shell environment; do not check it in. Alternatively, retrieve the
same committed file from a local backend checkout:

```sh
npm run api:update -- <full-backend-commit-sha> /path/to/discover-jesus-backend
```

Review the contract, revision/digest, generated types, and client changes
together. `npm run api:generate` regenerates types from the already pinned
input; it does not fetch the latest backend. `npm run api:check` rejects a
digest mismatch or stale generated output without rewriting files. A backend
update is adopted explicitly, not automatically on every web build.

[src/api.ts](src/api.ts) exports schema aliases and operation-derived response
and request-body types. All app response annotations reference their operations;
JSON request literals use `satisfies ApiRequestBody<...>` before serialization.
The shared management editor checks both create and update request bodies and
uses the union of their actual responses rather than assuming every response
is a page. Existing error parsing, fetch behavior, and 204 handling are unchanged.
These are compile-time checks, not runtime response validation or verification
that a constructed URL targets the annotated operation.

`props`, `config`, `content`, and `sections` remain `unknown` where the backend
document leaves their JSON shape opaque. The backend now documents the presence
of its successful response fields; optional request properties remain optional
as specified. No shared-content-schema mapping or legacy retirement is implied.

To build the static UI:

```sh
npm run build
npm run preview
```

For deployments where the API is not served from the same origin, set
`VITE_API_BASE_URL` to the API origin when building and configure the backend
to allow the UI origin through CORS.
