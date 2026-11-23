import { useEffect, useState } from "react";
import {
  browserSupportsWebAuthn,
  startAuthentication,
  startRegistration,
} from "@simplewebauthn/browser";
import {
  ApiRequestError,
  apiRequest,
  type ApiRequestBody,
  type ApiResponse,
  type AuthorPasskey,
  type AuthorSession,
} from "./api";
import {
  toAssertionCredential,
  toAssertionOptions,
  toAttestationCredential,
  toCreationOptions,
} from "./webauthn";

interface AuthorAccessProps {
  invitationToken: string;
  message: string;
  onAuthenticated: (session: AuthorSession) => void;
}

function getAuthError(error: unknown, fallback: string): string {
  if (error instanceof ApiRequestError) {
    if (error.status === 401) {
      return "The passkey response or invitation could not be verified. Check it and try again.";
    }
    if (error.status === 403) {
      return "This account does not have an active authoring grant. Contact an operator.";
    }
  }
  return error instanceof Error ? error.message : fallback;
}

export function AuthorAccess({ invitationToken, message, onAuthenticated }: AuthorAccessProps) {
  const [enrolling, setEnrolling] = useState(Boolean(invitationToken));
  const [token, setToken] = useState(invitationToken);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const webAuthnSupported = browserSupportsWebAuthn();

  async function signIn() {
    setBusy(true);
    setError("");
    try {
      const { challengeId, options } = await apiRequest<ApiResponse<"CreatePasskeySignInOptions">>(
        "/api/auth/sign-in/options",
        { method: "POST" },
      );
      const credential = toAssertionCredential(
        await startAuthentication({ optionsJSON: toAssertionOptions(options) }),
      );
      const session = await apiRequest<ApiResponse<"CompletePasskeySignIn">>("/api/auth/sign-in", {
        method: "POST",
        body: JSON.stringify({
          challengeId,
          credential,
        } satisfies ApiRequestBody<"CompletePasskeySignIn">),
      });
      onAuthenticated(session);
    } catch (requestError) {
      setError(getAuthError(requestError, "Unable to sign in with a passkey."));
    } finally {
      setBusy(false);
    }
  }

  async function enroll(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { challengeId, options } = await apiRequest<
        ApiResponse<"CreateInvitationPasskeyOptions">
      >("/api/auth/invitations/registration-options", {
        method: "POST",
        body: JSON.stringify({
          invitationToken: token.trim(),
        } satisfies ApiRequestBody<"CreateInvitationPasskeyOptions">),
      });
      const credential = toAttestationCredential(
        await startRegistration({ optionsJSON: toCreationOptions(options) }),
      );
      const session = await apiRequest<ApiResponse<"CompleteInvitationPasskeyRegistration">>(
        "/api/auth/invitations/registration",
        {
          method: "POST",
          body: JSON.stringify({
            challengeId,
            invitationToken: token.trim(),
            name: name.trim(),
            credential,
          } satisfies ApiRequestBody<"CompleteInvitationPasskeyRegistration">),
        },
      );
      onAuthenticated(session);
    } catch (requestError) {
      setError(getAuthError(requestError, "Unable to enroll this passkey."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="author-access-shell">
      <section className="author-access-card" aria-labelledby="author-access-title">
        <a
          className="brand author-access-brand"
          href="/"
          aria-label="Discover Jesus Content Studio"
        >
          <span className="brand-mark">D</span>
          <span>
            <strong>Discover Jesus</strong>
            <small>Content Studio</small>
          </span>
        </a>
        <div>
          <div className="eyebrow">AUTHOR ACCESS</div>
          <h1 id="author-access-title">{enrolling ? "Set up your passkey" : "Welcome back"}</h1>
          <p className="panel-description">
            {enrolling
              ? "Use the one-time invitation from your operator to create a passkey for Content Studio."
              : "Sign in with a passkey issued for your author account."}
          </p>
        </div>

        {(message || error) && (
          <div className="alert alert-error" role="alert">
            {error || message}
          </div>
        )}

        {!webAuthnSupported && (
          <div className="alert alert-error" role="alert">
            This browser does not support passkeys. Open Content Studio in a supported browser.
          </div>
        )}

        {enrolling ? (
          <form className="author-access-form" onSubmit={(event) => void enroll(event)}>
            <label className="form-field">
              <span>Invitation token</span>
              <input
                autoComplete="off"
                required
                value={token}
                onChange={(event) => setToken(event.target.value)}
              />
            </label>
            <label className="form-field">
              <span>Name this passkey</span>
              <input
                autoComplete="off"
                maxLength={100}
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. MacBook Touch ID"
              />
            </label>
            <button
              className="button button-primary"
              type="submit"
              disabled={busy || !webAuthnSupported}
            >
              {busy ? "Waiting for passkey…" : "Create passkey"}
            </button>
            <button
              className="text-button author-access-switch"
              type="button"
              disabled={busy}
              onClick={() => {
                setEnrolling(false);
                setError("");
              }}
            >
              Return to sign in
            </button>
          </form>
        ) : (
          <div className="author-access-form">
            <button
              className="button button-primary"
              type="button"
              disabled={busy || !webAuthnSupported}
              onClick={() => void signIn()}
            >
              {busy ? "Waiting for passkey…" : "Sign in with a passkey"}
            </button>
            <button
              className="text-button author-access-switch"
              type="button"
              disabled={busy}
              onClick={() => {
                setEnrolling(true);
                setError("");
              }}
            >
              I have an invitation
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

interface PasskeyManagerProps {
  onClose: () => void;
}

export function PasskeyManager({ onClose }: PasskeyManagerProps) {
  const [passkeys, setPasskeys] = useState<AuthorPasskey[]>([]);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const webAuthnSupported = browserSupportsWebAuthn();

  async function refreshPasskeys() {
    const result = await apiRequest<ApiResponse<"GetAuthorPasskeys">>("/api/auth/passkeys");
    setPasskeys(result);
  }

  useEffect(() => {
    void refreshPasskeys().catch((requestError: unknown) => {
      setError(requestError instanceof Error ? requestError.message : "Unable to load passkeys.");
    });
  }, []);

  async function addPasskey(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const { challengeId, options } = await apiRequest<
        ApiResponse<"CreateAdditionalPasskeyOptions">
      >("/api/auth/passkeys/registration-options", { method: "POST" });
      const credential = toAttestationCredential(
        await startRegistration({ optionsJSON: toCreationOptions(options) }),
      );
      await apiRequest<ApiResponse<"CompleteAdditionalPasskeyRegistration">>("/api/auth/passkeys", {
        method: "POST",
        body: JSON.stringify({
          challengeId,
          name: name.trim(),
          credential,
        } satisfies ApiRequestBody<"CompleteAdditionalPasskeyRegistration">),
      });
      setName("");
      await refreshPasskeys();
      setNotice("Passkey added.");
    } catch (requestError) {
      setError(getAuthError(requestError, "Unable to add this passkey."));
    } finally {
      setBusy(false);
    }
  }

  async function revokePasskey(passkey: AuthorPasskey) {
    if (!window.confirm(`Revoke “${passkey.name}”? This passkey will no longer sign in.`)) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await apiRequest<ApiResponse<"RevokeAuthorPasskey">>(
        `/api/auth/passkeys/${encodeURIComponent(passkey.id)}`,
        { method: "DELETE" },
      );
      await refreshPasskeys();
      setNotice(`Passkey “${passkey.name}” revoked.`);
    } catch (requestError) {
      setError(getAuthError(requestError, "Unable to revoke this passkey."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal-backdrop">
      <button
        className="modal-backdrop-dismiss"
        type="button"
        aria-label="Close passkey manager"
        onClick={onClose}
      />
      <section
        className="author-passkey-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="passkey-manager-title"
      >
        <div className="dialog-heading">
          <div>
            <div className="eyebrow">ACCOUNT SECURITY</div>
            <h2 id="passkey-manager-title">Manage passkeys</h2>
          </div>
          <button className="icon-button" type="button" aria-label="Close" onClick={onClose}>
            ×
          </button>
        </div>
        {(error || notice) && (
          <div className={`alert ${error ? "alert-error" : "alert-success"}`} role="status">
            {error || notice}
          </div>
        )}
        <ul className="author-passkey-list" aria-label="Active passkeys">
          {passkeys.map((passkey) => (
            <li key={passkey.id}>
              <div>
                <strong>{passkey.name}</strong>
                <span>
                  Added {new Date(passkey.createdAt).toLocaleDateString()}
                  {passkey.lastUsedAt
                    ? ` · Last used ${new Date(passkey.lastUsedAt).toLocaleDateString()}`
                    : ""}
                </span>
              </div>
              <button
                className="button button-danger-quiet"
                type="button"
                disabled={busy}
                onClick={() => void revokePasskey(passkey)}
              >
                Revoke
              </button>
            </li>
          ))}
          {passkeys.length === 0 && <li>No active passkeys found.</li>}
        </ul>
        <form className="author-access-form" onSubmit={(event) => void addPasskey(event)}>
          <label className="form-field">
            <span>Name the new passkey</span>
            <input
              autoComplete="off"
              maxLength={100}
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. iPhone"
            />
          </label>
          <div className="author-access-actions">
            <button
              className="button button-primary"
              type="submit"
              disabled={busy || !webAuthnSupported}
            >
              {busy ? "Waiting for passkey…" : "Add passkey"}
            </button>
            <button
              className="button button-secondary"
              type="button"
              disabled={busy}
              onClick={onClose}
            >
              Done
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
