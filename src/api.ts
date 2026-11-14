import type { components, operations } from "./generated/backend-api";

type JsonResponse<Response> = Response extends {
  content: { "application/json": infer Body };
}
  ? Body
  : void;

export type ApiResponse<Operation extends keyof operations> = Operation extends keyof operations
  ? {
      [
        Status in keyof operations[Operation]["responses"]
      ]: `${Status & (string | number)}` extends `2${string}`
        ? JsonResponse<operations[Operation]["responses"][Status]>
        : never;
    }[keyof operations[Operation]["responses"]]
  : never;

export type ApiRequestBody<Operation extends keyof operations> = operations[Operation] extends {
  requestBody: { content: { "application/json": infer Body } };
}
  ? Body
  : never;

export type PageSummary = components["schemas"]["PageSummary"];
export type Page = components["schemas"]["PageResponse"];
export type Component = components["schemas"]["ComponentResponse"];
export type Binding = components["schemas"]["BindingResponse"];
export type ActionDefinition = components["schemas"]["ActionResponse"];
export type PageContentResponse = components["schemas"]["PageContentResponse"];
export type PageContentDraftResponse = components["schemas"]["PageContentDraftResponse"];
export type ReusableComponentSummary = components["schemas"]["ReusableComponentSummary"];
export type ReusableComponentDraftResponse =
  components["schemas"]["ReusableComponentDraftResponse"];
export type ReusableComponentResponse = components["schemas"]["ReusableComponentResponse"];

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

export class ApiRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
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
    throw new ApiRequestError(message, response.status);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
