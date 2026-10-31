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
`http://localhost:5000`. Set `VITE_API_PROXY_TARGET` in `.env.local` if the
backend runs at a different address. The backend must be running with its
database configured.

The UI supports creating, editing, and deleting pages, components, bindings,
and action definitions. JSON properties and configurations are edited as JSON.
Action definitions are stored by the backend and are not executed.

To build the static UI:

```sh
npm run build
npm run preview
```

For deployments where the API is not served from the same origin, set
`VITE_API_BASE_URL` to the API origin when building and configure the backend
to allow the UI origin through CORS.
