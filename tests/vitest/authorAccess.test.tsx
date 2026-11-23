import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "../../src/App";
import { installFakeApi } from "./fakeApi";

const webAuthn = vi.hoisted(() => ({
  startAuthentication: vi.fn(),
  startRegistration: vi.fn(),
}));

vi.mock("@simplewebauthn/browser", () => ({
  browserSupportsWebAuthn: () => true,
  startAuthentication: webAuthn.startAuthentication,
  startRegistration: webAuthn.startRegistration,
}));

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  webAuthn.startAuthentication.mockReset();
  webAuthn.startRegistration.mockReset();
});

const session = {
  accountId: "11111111-1111-1111-1111-111111111111",
  roles: ["Publisher"],
  csrfToken: "session-csrf-token",
};
const assertionOptions = {
  challenge: "challenge-bytes",
  userVerification: "required",
};
const creationOptions = {
  rp: { id: "studio-dev.onebreathpeople.com", name: "Discover Jesus Content Studio" },
  user: { id: "author-handle", name: "author", displayName: "Discover Jesus Author" },
  challenge: "challenge-bytes",
  pubKeyCredParams: [{ alg: -7, type: "public-key" }],
};
const assertionCredential = {
  id: "credential-id",
  rawId: "credential-id",
  type: "public-key",
  response: {
    authenticatorData: "authenticator-data",
    signature: "signature",
    clientDataJSON: "client-data",
    userHandle: "user-handle",
  },
  clientExtensionResults: {},
};
const attestationCredential = {
  id: "credential-id",
  rawId: "credential-id",
  type: "public-key",
  response: {
    attestationObject: "attestation",
    clientDataJSON: "client-data",
    transports: ["internal"],
  },
  clientExtensionResults: {},
};

function loggedOutRoutes() {
  return {
    "GET /api/auth/session": { status: 401, body: { title: "Not signed in." } },
    "GET /health": { body: { status: "healthy" } },
    "GET /api/pages/": { body: [] },
    "GET /api/reusable-components": { body: [] },
  };
}

describe("author passkey access", () => {
  it("signs in with a discoverable passkey and opens the authoring workspace", async () => {
    const { requests } = installFakeApi({
      ...loggedOutRoutes(),
      "POST /api/auth/sign-in/options": {
        body: { challengeId: "challenge-1", options: assertionOptions },
      },
      "POST /api/auth/sign-in": { body: session },
    });
    webAuthn.startAuthentication.mockResolvedValue(assertionCredential);
    const user = userEvent.setup();
    render(<App />);

    await user.click(await screen.findByRole("button", { name: "Sign in with a passkey" }));

    expect(await screen.findByRole("button", { name: "Passkeys" })).toBeInTheDocument();
    expect(webAuthn.startAuthentication).toHaveBeenCalledWith({
      optionsJSON: assertionOptions,
    });
    expect(requests.find((request) => request.path === "/api/auth/sign-in")?.body).toEqual({
      challengeId: "challenge-1",
      credential: {
        id: "credential-id",
        rawId: "credential-id",
        type: "public-key",
        response: {
          authenticatorData: "authenticator-data",
          signature: "signature",
          clientDataJSON: "client-data",
          userHandle: "user-handle",
        },
        clientExtensionResults: {},
      },
    });
  });

  it("uses a fragment invitation for first enrollment and removes it after success", async () => {
    window.history.replaceState(null, "", "/#invite=one-time-token");
    const { requests } = installFakeApi({
      ...loggedOutRoutes(),
      "POST /api/auth/invitations/registration-options": {
        body: { challengeId: "enrollment-1", options: creationOptions },
      },
      "POST /api/auth/invitations/registration": { body: session },
    });
    webAuthn.startRegistration.mockResolvedValue(attestationCredential);
    const user = userEvent.setup();
    render(<App />);

    expect(await screen.findByRole("heading", { name: "Set up your passkey" })).toBeInTheDocument();
    await user.type(screen.getByLabelText("Name this passkey"), "MacBook Touch ID");
    await user.click(screen.getByRole("button", { name: "Create passkey" }));

    expect(await screen.findByRole("button", { name: "Passkeys" })).toBeInTheDocument();
    expect(window.location.hash).toBe("");
    expect(
      requests.find((request) => request.path === "/api/auth/invitations/registration")?.body,
    ).toMatchObject({
      challengeId: "enrollment-1",
      invitationToken: "one-time-token",
      name: "MacBook Touch ID",
    });
  });

  it("adds and revokes passkeys with CSRF protection", async () => {
    const existing = {
      id: "passkey-1",
      name: "MacBook",
      createdAt: "2026-11-20T12:00:00Z",
      lastUsedAt: null,
      revokedAt: null,
    };
    let activePasskeys = [existing];
    const { requests } = installFakeApi({
      "GET /api/auth/passkeys": () => ({ body: activePasskeys }),
      "POST /api/auth/passkeys/registration-options": {
        body: { challengeId: "extra-1", options: creationOptions },
      },
      "POST /api/auth/passkeys": () => {
        activePasskeys = [...activePasskeys, { ...existing, id: "passkey-2", name: "iPhone" }];
        return { status: 204 };
      },
      "DELETE /api/auth/passkeys/passkey-1": () => {
        activePasskeys = activePasskeys.filter((passkey) => passkey.id !== "passkey-1");
        return { status: 204 };
      },
    });
    webAuthn.startRegistration.mockResolvedValue(attestationCredential);
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const user = userEvent.setup();
    render(<App />);

    await user.click(await screen.findByRole("button", { name: "Passkeys" }));
    const dialog = await screen.findByRole("dialog", { name: "Manage passkeys" });
    expect(within(dialog).getByText("MacBook")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Close passkey manager" })).toBeInTheDocument();
    await user.type(within(dialog).getByLabelText("Name the new passkey"), "iPhone");
    await user.click(within(dialog).getByRole("button", { name: "Add passkey" }));
    expect(await within(dialog).findByText("iPhone")).toBeInTheDocument();

    const macBookRow = within(dialog).getByText("MacBook").closest("li");
    expect(macBookRow).not.toBeNull();
    const deleteButton = within(macBookRow!).getByRole("button", { name: "Revoke" });
    await user.click(deleteButton);
    await waitFor(() => expect(within(dialog).queryByText("MacBook")).not.toBeInTheDocument());

    const mutationRequests = requests.filter((request) =>
      ["POST", "DELETE"].includes(request.method),
    );
    expect(mutationRequests.length).toBe(3);
    expect(
      mutationRequests.every(
        (request) => request.headers.get("X-CSRF-Token") === "test-csrf-token",
      ),
    ).toBe(true);
    await user.click(screen.getByRole("button", { name: "Close passkey manager" }));
    await waitFor(() =>
      expect(screen.queryByRole("dialog", { name: "Manage passkeys" })).not.toBeInTheDocument(),
    );
  });

  it("returns to passkey sign-in when a protected session expires", async () => {
    installFakeApi({
      "GET /api/pages/": { status: 401, body: { title: "Session expired." } },
      "GET /api/reusable-components": { body: [] },
      "GET /health": { body: { status: "healthy" } },
    });
    render(<App />);

    expect(
      await screen.findByRole("button", { name: "Sign in with a passkey" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Your author session expired. Sign in again.")).toBeInTheDocument();
  });

  it("keeps a valid session and surfaces forbidden authoring access separately", async () => {
    installFakeApi({
      "GET /api/pages/": { status: 403, body: { title: "Publisher access is required." } },
      "GET /api/reusable-components": { body: [] },
      "GET /health": { body: { status: "healthy" } },
    });
    render(<App />);

    expect(await screen.findByRole("button", { name: "Passkeys" })).toBeInTheDocument();
    expect(await screen.findByText("Publisher access is required.")).toBeInTheDocument();
  });

  it("sends the CSRF token when signing out", async () => {
    const { requests } = installFakeApi({
      "POST /api/auth/sign-out": { status: 204 },
    });
    const user = userEvent.setup();
    render(<App />);
    await user.click(await screen.findByRole("button", { name: "Sign out" }));

    expect(
      await screen.findByRole("button", { name: "Sign in with a passkey" }),
    ).toBeInTheDocument();
    const signOut = requests.find((request) => request.path === "/api/auth/sign-out");
    expect(signOut?.headers.get("X-CSRF-Token")).toBe("test-csrf-token");
  });
});
