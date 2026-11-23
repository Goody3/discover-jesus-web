import type {
  AuthenticationResponseJSON,
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  RegistrationResponseJSON,
} from "@simplewebauthn/browser";
import type {
  AssertionOptions,
  AuthorAssertionCredential,
  AuthorAttestationCredential,
  CredentialCreateOptions,
} from "./api";

function requiredString(value: string | null | undefined, field: string): string {
  if (!value) {
    throw new Error(`The server returned invalid passkey options: ${field} is missing.`);
  }
  return value;
}

function publicKeyType(type: "public-key" | "invalid" | undefined): "public-key" {
  if (type !== "public-key") {
    throw new Error("The server returned an unsupported passkey credential type.");
  }
  return type;
}

export function toAssertionOptions(
  options: AssertionOptions,
): PublicKeyCredentialRequestOptionsJSON {
  const allowCredentials = options.allowCredentials?.map((credential) => ({
    id: requiredString(credential.id, "credential id"),
    type: publicKeyType(credential.type),
    transports: credential.transports ?? undefined,
  }));
  return {
    challenge: requiredString(options.challenge, "challenge"),
    timeout: options.timeout,
    rpId: options.rpId ?? undefined,
    allowCredentials,
    userVerification: options.userVerification,
  };
}

export function toCreationOptions(
  options: CredentialCreateOptions,
): PublicKeyCredentialCreationOptionsJSON {
  const rpName = requiredString(options.rp.name, "relying party name");
  const user = {
    id: requiredString(options.user.id, "user id"),
    name: requiredString(options.user.name, "user name"),
    displayName: requiredString(options.user.displayName, "user display name"),
  };
  const pubKeyCredParams = options.pubKeyCredParams.map((parameter) => {
    if (parameter.alg === undefined) {
      throw new Error("The server returned invalid passkey options: algorithm is missing.");
    }
    return {
      alg: parameter.alg,
      type: publicKeyType(parameter.type),
    };
  });
  if (pubKeyCredParams.length === 0) {
    throw new Error("The server returned invalid passkey options: no algorithms are available.");
  }

  const excludeCredentials = options.excludeCredentials?.map((credential) => ({
    id: requiredString(credential.id, "excluded credential id"),
    type: publicKeyType(credential.type),
    transports: credential.transports ?? undefined,
  }));

  return {
    rp: {
      id: options.rp.id ?? undefined,
      name: rpName,
    },
    user,
    challenge: requiredString(options.challenge, "challenge"),
    pubKeyCredParams,
    timeout: options.timeout,
    excludeCredentials,
    authenticatorSelection: options.authenticatorSelection,
    attestation: options.attestation,
  };
}

function requirePublicKeyCredentialType(type: string): "public-key" {
  if (type !== "public-key") {
    throw new Error("The browser returned an unsupported passkey credential type.");
  }
  return type;
}

export function toAssertionCredential(
  credential: AuthenticationResponseJSON,
): AuthorAssertionCredential {
  return {
    id: credential.id,
    rawId: credential.rawId,
    type: requirePublicKeyCredentialType(credential.type),
    response: {
      authenticatorData: credential.response.authenticatorData,
      signature: credential.response.signature,
      clientDataJSON: credential.response.clientDataJSON,
      userHandle: credential.response.userHandle ?? null,
    },
    clientExtensionResults: {},
  };
}

function isAuthenticatorTransport(
  value: string,
): value is "usb" | "nfc" | "ble" | "smart-card" | "hybrid" | "internal" {
  switch (value) {
    case "usb":
    case "nfc":
    case "ble":
    case "smart-card":
    case "hybrid":
    case "internal":
      return true;
    default:
      return false;
  }
}

export function toAttestationCredential(
  credential: RegistrationResponseJSON,
): AuthorAttestationCredential {
  return {
    id: credential.id,
    rawId: credential.rawId,
    type: requirePublicKeyCredentialType(credential.type),
    response: {
      attestationObject: credential.response.attestationObject,
      clientDataJSON: credential.response.clientDataJSON,
      transports: (credential.response.transports ?? []).filter(isAuthenticatorTransport),
    },
    clientExtensionResults: {},
  };
}
