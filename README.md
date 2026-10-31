# Discover Jesus Web

A lightweight admin UI for managing page definitions in the Discover Jesus
backend.

## Requirements

- Node.js 18 or newer
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

To build the static UI:

```sh
npm run build
npm run preview
```

Run the dependency-free preview and navigation tests with:

```sh
npm test
```

These tests cover supported nested content, button action forwarding and UUID
destination resolution, plus visible failure handling for invalid or unresolved
content.

For deployments where the API is not served from the same origin, set
`VITE_API_BASE_URL` to the API origin when building and configure the backend
to allow the UI origin through CORS.
