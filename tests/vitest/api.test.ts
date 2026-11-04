import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiRequestError, apiRequest } from "../../src/api";
import { installFakeApi } from "./fakeApi";

afterEach(() => {
  vi.unstubAllGlobals();
});

async function failure(promise: Promise<unknown>): Promise<ApiRequestError> {
  const error: unknown = await promise.then(
    () => {
      throw new Error("Expected the request to fail.");
    },
    (reason: unknown) => reason,
  );
  expect(error).toBeInstanceOf(ApiRequestError);
  return error as ApiRequestError;
}

describe("apiRequest", () => {
  it("returns the parsed JSON body on success", async () => {
    installFakeApi({ "GET /api/pages/": { body: [{ id: 1 }] } });
    await expect(apiRequest("/api/pages/")).resolves.toEqual([{ id: 1 }]);
  });

  it("sends a JSON content type only when a body is present", async () => {
    const { fetchMock } = installFakeApi({
      "GET /a": { body: {} },
      "POST /a": { body: {} },
    });
    await apiRequest("/a");
    await apiRequest("/a", { method: "POST", body: "{}" });
    const [, getInit] = fetchMock.mock.calls[0];
    const [, postInit] = fetchMock.mock.calls[1];
    expect(getInit?.headers).toEqual({});
    expect(postInit?.headers).toEqual({ "Content-Type": "application/json" });
  });

  it("returns undefined for 204 responses", async () => {
    installFakeApi({ "DELETE /api/pages/1": { status: 204 } });
    await expect(apiRequest("/api/pages/1", { method: "DELETE" })).resolves.toBeUndefined();
  });

  it("uses the legacy error property as the message", async () => {
    installFakeApi({ "GET /x": { status: 400, body: { error: "Slug already exists." } } });
    const error = await failure(apiRequest("/x"));
    expect(error.message).toBe("Slug already exists.");
    expect(error.status).toBe(400);
  });

  it("uses the Problem Details title as the message", async () => {
    installFakeApi({
      "GET /x": { status: 422, body: { type: "about:blank", title: "Validation failed." } },
    });
    const error = await failure(apiRequest("/x"));
    expect(error.message).toBe("Validation failed.");
    expect(error.status).toBe(422);
  });

  it("falls back to a status message when the error body is not JSON", async () => {
    installFakeApi({ "GET /x": { status: 502, rawBody: "<html>Bad gateway</html>" } });
    const error = await failure(apiRequest("/x"));
    expect(error.message).toBe("Request failed (502)");
    expect(error.status).toBe(502);
  });

  it("falls back to a status message when the JSON body has no usable message", async () => {
    installFakeApi({ "GET /x": { status: 500, body: { error: 42 } } });
    const error = await failure(apiRequest("/x"));
    expect(error.message).toBe("Request failed (500)");
  });

  it("propagates network failures", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    await expect(apiRequest("/x")).rejects.toThrow("Failed to fetch");
  });
});
