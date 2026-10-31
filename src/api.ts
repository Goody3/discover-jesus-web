export interface PageSummary {
  id: number;
  slug: string;
  title: string;
  isPublished: boolean;
}

export interface Page extends PageSummary {
  components: Component[];
}

export interface Component {
  id: number;
  key: string;
  type: string;
  props: unknown;
  sortOrder: number;
  bindings: Binding[];
  actions: ActionDefinition[];
}

export interface Binding {
  id: number;
  name: string;
  source: string;
  config: unknown;
}

export interface ActionDefinition {
  id: number;
  name: string;
  type: string;
  config: unknown;
}

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body: unknown = await response.json();
      if (typeof body === "object" && body !== null && "error" in body) {
        const error = body.error;
        if (typeof error === "string") message = error;
      } else if (
        typeof body === "object" &&
        body !== null &&
        "title" in body &&
        typeof body.title === "string"
      ) {
        message = body.title;
      }
    } catch {
      // Some error responses have no JSON body.
    }
    throw new Error(message);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
