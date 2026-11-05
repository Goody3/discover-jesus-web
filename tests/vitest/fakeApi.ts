import { vi } from "vitest";

export interface FakeResponse {
  status?: number;
  body?: unknown;
  rawBody?: string;
}

export interface RecordedRequest {
  method: string;
  path: string;
  search: string;
  body: unknown;
}

type Handler = FakeResponse | ((request: RecordedRequest) => FakeResponse);

// Mocks fetch at the network boundary; routes are keyed by "METHOD /path" (query string ignored).
export function installFakeApi(routes: Record<string, Handler>) {
  const requests: RecordedRequest[] = [];
  const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(String(input), "http://localhost");
    const method = (init?.method ?? "GET").toUpperCase();
    const request: RecordedRequest = {
      method,
      path: url.pathname,
      search: url.search,
      body: typeof init?.body === "string" ? (JSON.parse(init.body) as unknown) : undefined,
    };
    requests.push(request);
    const route = routes[`${method} ${url.pathname}`];
    if (!route) return Promise.reject(new TypeError(`Unmocked request: ${method} ${url.pathname}`));
    const response = typeof route === "function" ? route(request) : route;
    const status = response.status ?? 200;
    const text =
      response.rawBody ?? (response.body === undefined ? "" : JSON.stringify(response.body));
    return Promise.resolve(new Response(status === 204 ? null : text, { status }));
  });
  vi.stubGlobal("fetch", fetchMock);
  return { requests, fetchMock };
}
