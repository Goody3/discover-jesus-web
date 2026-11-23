// Generated from Goody3/discover-jesus-backend@5722e2d077b50ef1201c12135bfa166ca9616ada:api/openapi.json.
// Do not edit; run npm run api:generate.
export interface paths {
  "/api/components/{componentId}/actions": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List component actions */
    get: operations["GetActions"];
    put?: never;
    /** Add a component action */
    post: operations["CreateAction"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/actions/{id}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get an action definition */
    get: operations["GetAction"];
    /** Update an action definition */
    put: operations["UpdateAction"];
    post?: never;
    /** Delete an action definition */
    delete: operations["DeleteAction"];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/auth/invitations/registration-options": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Start passkey enrollment with a one-time operator invitation */
    post: operations["CreateInvitationPasskeyOptions"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/auth/invitations/registration": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Complete first passkey enrollment for an invited author */
    post: operations["CompleteInvitationPasskeyRegistration"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/auth/sign-in/options": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Start username-less passkey sign-in */
    post: operations["CreatePasskeySignInOptions"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/auth/sign-in": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Complete username-less passkey sign-in */
    post: operations["CompletePasskeySignIn"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/auth/session": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get the current author session and a fresh CSRF token */
    get: operations["GetAuthorSession"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/auth/sign-out": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Revoke the current author session */
    post: operations["SignOutAuthor"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/auth/passkeys": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List active passkeys for the current author */
    get: operations["GetAuthorPasskeys"];
    put?: never;
    /** Complete registration of an additional passkey */
    post: operations["CompleteAdditionalPasskeyRegistration"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/auth/passkeys/registration-options": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Start registration of an additional passkey */
    post: operations["CreateAdditionalPasskeyOptions"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/auth/passkeys/{passkeyId}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    /** Revoke one active passkey without changing the author account */
    delete: operations["RevokeAuthorPasskey"];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/components/{componentId}/bindings": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List component bindings */
    get: operations["GetBindings"];
    put?: never;
    /** Add a component binding */
    post: operations["CreateBinding"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/bindings/{id}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get a binding */
    get: operations["GetBinding"];
    /** Update a binding */
    put: operations["UpdateBinding"];
    post?: never;
    /** Delete a binding */
    delete: operations["DeleteBinding"];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/components/{id}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get a component */
    get: operations["GetComponent"];
    /** Update a component */
    put: operations["UpdateComponent"];
    post?: never;
    /** Delete a component */
    delete: operations["DeleteComponent"];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/health": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Check API availability */
    get: operations["GetHealth"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/content/pages": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * List published pages for a locale
     * @description Returns reader-facing metadata for pages with a published revision in the requested locale.
     */
    get: operations["GetPublishedPages"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/content/pages/{pageId}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get a published page with reusable components expanded */
    get: operations["GetPageContent"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/content/pages/{pageId}/draft": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get a page content draft for a locale */
    get: operations["GetPageContentDraft"];
    /** Create or replace a page content draft */
    put: operations["UpdatePageContentDraft"];
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/content/pages/{pageId}/draft/from-published": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Start a page draft by copying its latest published sections */
    post: operations["StartPageDraftFromPublished"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/content/pages/{pageId}/publish": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Validate references and publish a page content revision */
    post: operations["PublishPageContent"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/pages": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List pages */
    get: operations["GetPages"];
    put?: never;
    /** Create a page */
    post: operations["CreatePage"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/pages/by-public-id/{pageId}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get a management page by public UUID, including unpublished pages */
    get: operations["GetPageByPublicId"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/pages/{id}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    /** Update a page */
    put: operations["UpdatePage"];
    post?: never;
    /** Delete a page */
    delete: operations["DeletePage"];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/pages/{pageId}/components": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List a page's components */
    get: operations["GetComponents"];
    put?: never;
    /** Add a component to a page */
    post: operations["CreateComponent"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/reusable-components": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List reusable components by friendly name */
    get: operations["GetReusableComponents"];
    put?: never;
    /** Create a named reusable component and locale draft */
    post: operations["CreateReusableComponent"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/reusable-components/{componentId}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get the latest published reusable component revision for a locale */
    get: operations["GetReusableComponent"];
    /** Change a reusable component's friendly name */
    put: operations["UpdateReusableComponentName"];
    post?: never;
    /** Delete a reusable component when no page versions reference it */
    delete: operations["DeleteReusableComponent"];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/reusable-components/{componentId}/draft": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get a reusable component draft for a locale */
    get: operations["GetReusableComponentDraft"];
    /** Create or replace a reusable component locale draft */
    put: operations["UpdateReusableComponentDraft"];
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/reusable-components/{componentId}/publish": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Publish a validated locale draft as an immutable revision */
    post: operations["PublishReusableComponent"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/reusable-components/{componentId}/withdraw": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Withdraw a reusable component when no page versions reference it */
    post: operations["WithdrawReusableComponent"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
}
export type webhooks = Record<string, never>;
export interface components {
  schemas: {
    ActionRequest: {
      name: string;
      type: string;
      config: {
        [key: string]: unknown;
      };
    };
    ActionResponse: {
      /** Format: int32 */
      id: number;
      name: string;
      type: string;
      config: unknown;
    };
    /**
     * Format: int32
     * @enum {integer}
     */
    Algorithm: -65535 | -259 | -258 | -257 | -47 | -39 | -38 | -37 | -36 | -35 | -8 | -7;
    AssertionOptions: {
      /** Format: byte */
      challenge?: string | null;
      /** Format: int64 */
      timeout?: number;
      rpId?: string | null;
      allowCredentials?: components["schemas"]["PublicKeyCredentialDescriptor"][];
      userVerification?: components["schemas"]["UserVerificationRequirement"];
      hints?: components["schemas"]["PublicKeyCredentialHint"][];
      extensions?: components["schemas"]["AuthenticationExtensionsClientInputs"];
    };
    AssertionOptionsPasskeyOptionsResponse: {
      /** Format: uuid */
      challengeId: string;
      options: components["schemas"]["AssertionOptions"];
    };
    AssertionResponse: {
      /** Format: byte */
      authenticatorData: string;
      /** Format: byte */
      signature: string;
      /** Format: byte */
      clientDataJSON: string;
      /** Format: byte */
      userHandle?: string | null;
    };
    /** @enum {string} */
    AttestationConveyancePreference: "none" | "indirect" | "direct" | "enterprise";
    AttestationResponse: {
      /** Format: byte */
      attestationObject: string | null;
      /** Format: byte */
      clientDataJSON: string | null;
      transports: components["schemas"]["AuthenticatorTransport"][];
    };
    /** @enum {string} */
    AttestationStatementFormatIdentifier:
      "packed" | "tpm" | "android-key" | "android-safetynet" | "fido-u2f" | "apple" | "none";
    AuthenticationExtensionsClientInputs: {
      "example.extension.bool"?: boolean | null;
      appid?: string | null;
      exts?: boolean | null;
      uvm?: boolean | null;
      credProps?: boolean | null;
      prf?: components["schemas"]["AuthenticationExtensionsPRFInputs"];
      largeBlob?: components["schemas"]["AuthenticationExtensionsLargeBlobInputs"];
      credentialProtectionPolicy?: components["schemas"]["CredentialProtectionPolicy"];
      enforceCredentialProtectionPolicy?: boolean | null;
    };
    AuthenticationExtensionsClientOutputs: {
      "example.extension.bool"?: boolean | null;
      appid?: boolean;
      exts?: string[] | null;
      uvm?: number[][] | null;
      credProps?: components["schemas"]["CredentialPropertiesOutput"];
      prf?: components["schemas"]["AuthenticationExtensionsPRFOutputs"];
      largeBlob?: components["schemas"]["AuthenticationExtensionsLargeBlobOutputs"];
      credProtect?: components["schemas"]["CredentialProtectionPolicy"];
    };
    AuthenticationExtensionsLargeBlobInputs: {
      support?: components["schemas"]["LargeBlobSupport"];
      read?: boolean;
      /** Format: byte */
      write?: string | null;
    };
    AuthenticationExtensionsLargeBlobOutputs: {
      supported?: boolean;
      /** Format: byte */
      blob?: string | null;
      written?: boolean;
    };
    AuthenticationExtensionsPRFInputs: {
      eval?: components["schemas"]["AuthenticationExtensionsPRFValues"];
      evalByCredential?: components["schemas"]["StringAuthenticationExtensionsPRFValuesKeyValuePair"];
    };
    AuthenticationExtensionsPRFOutputs: {
      enabled?: boolean;
      results?: components["schemas"]["AuthenticationExtensionsPRFValues"];
    };
    AuthenticationExtensionsPRFValues: {
      /** Format: byte */
      first: string;
      /** Format: byte */
      second?: string | null;
    };
    AuthenticatorAssertionRawResponse: {
      id: string;
      /** Format: byte */
      rawId: string;
      response?: components["schemas"]["AssertionResponse"];
      type: components["schemas"]["PublicKeyCredentialType"];
      extensions?: components["schemas"]["AuthenticationExtensionsClientOutputs"];
      clientExtensionResults: components["schemas"]["AuthenticationExtensionsClientOutputs"];
    };
    /** @enum {string} */
    AuthenticatorAttachment: "platform" | "cross-platform";
    AuthenticatorAttestationRawResponse: {
      id: string;
      /** Format: byte */
      rawId: string;
      type: components["schemas"]["PublicKeyCredentialType"];
      response: components["schemas"]["AttestationResponse"];
      extensions?: components["schemas"]["AuthenticationExtensionsClientOutputs"];
      clientExtensionResults: components["schemas"]["AuthenticationExtensionsClientOutputs"];
    };
    AuthenticatorSelection: {
      authenticatorAttachment?: components["schemas"]["AuthenticatorAttachment"];
      residentKey?: components["schemas"]["ResidentKeyRequirement"];
      /** @deprecated */
      requireResidentKey?: boolean;
      userVerification?: components["schemas"]["UserVerificationRequirement"];
    };
    /** @enum {string} */
    AuthenticatorTransport: "usb" | "nfc" | "ble" | "smart-card" | "hybrid" | "internal";
    AuthorPasskeyResponse: {
      /** Format: uuid */
      id: string;
      name: string;
      /** Format: date-time */
      createdAt: string;
      /** Format: date-time */
      lastUsedAt: string | null;
      /** Format: date-time */
      revokedAt: string | null;
    };
    AuthorSessionResponse: {
      /** Format: uuid */
      accountId: string;
      roles: string[];
      csrfToken: string;
    };
    BindingRequest: {
      name: string;
      source: string;
      config: {
        [key: string]: unknown;
      };
    };
    BindingResponse: {
      /** Format: int32 */
      id: number;
      name: string;
      source: string;
      config: unknown;
    };
    CompleteAuthenticatedRegistrationRequest: {
      /** Format: uuid */
      challengeId?: string;
      name?: string;
      credential?: components["schemas"]["AuthenticatorAttestationRawResponse"];
    };
    CompleteInvitationRegistrationRequest: {
      /** Format: uuid */
      challengeId?: string;
      invitationToken?: string;
      name?: string;
      credential?: components["schemas"]["AuthenticatorAttestationRawResponse"];
    };
    CompleteSignInRequest: {
      /** Format: uuid */
      challengeId?: string;
      credential?: components["schemas"]["AuthenticatorAssertionRawResponse"];
    };
    ComponentRequest: {
      key: string;
      /** @enum {string} */
      type:
        | "text"
        | "image"
        | "button"
        | "stack"
        | "row"
        | "column"
        | "conditional"
        | "loop"
        | "spacer"
        | "divider"
        | "modal"
        | "Button"
        | "NBButton"
        | "Text"
        | "Header"
        | "BibleVerse"
        | "title"
        | "List"
        | "NavBar"
        | "Media";
      props: {
        [key: string]: unknown;
      };
      /** Format: int32 */
      sortOrder: number;
    };
    ComponentResponse: {
      /** Format: int32 */
      id: number;
      key: string;
      type: string;
      props: unknown;
      /** Format: int32 */
      sortOrder: number;
      bindings: components["schemas"]["BindingResponse"][];
      actions: components["schemas"]["ActionResponse"][];
    };
    CreateReusableComponentRequest: {
      name?: string;
      locale?: string;
      content?: {
        [key: string]: unknown;
      };
    };
    CredentialCreateOptions: {
      rp: components["schemas"]["PublicKeyCredentialRpEntity"];
      user: components["schemas"]["Fido2User"];
      /** Format: byte */
      challenge: string;
      pubKeyCredParams: components["schemas"]["PubKeyCredParam"][];
      /** Format: int64 */
      timeout?: number;
      attestation?: components["schemas"]["AttestationConveyancePreference"];
      attestationFormats?: components["schemas"]["AttestationStatementFormatIdentifier"][];
      authenticatorSelection?: components["schemas"]["AuthenticatorSelection"];
      hints?: components["schemas"]["PublicKeyCredentialHint"][];
      excludeCredentials?: components["schemas"]["PublicKeyCredentialDescriptor"][];
      extensions?: components["schemas"]["AuthenticationExtensionsClientInputs"];
    };
    CredentialCreateOptionsPasskeyOptionsResponse: {
      /** Format: uuid */
      challengeId: string;
      options: components["schemas"]["CredentialCreateOptions"];
    };
    CredentialPropertiesOutput: {
      rk?: boolean;
      authenticatorDisplayName?: string | null;
    };
    /** @enum {string} */
    CredentialProtectionPolicy:
      | "userVerificationOptional"
      | "userVerificationOptionalWithCredentialIDList"
      | "userVerificationRequired";
    Fido2User: {
      name?: string | null;
      /** Format: byte */
      id?: string | null;
      displayName?: string | null;
    };
    HealthResponse: {
      status: string;
    };
    HttpValidationProblemDetails: {
      type?: string | null;
      title?: string | null;
      /** Format: int32 */
      status?: number | null;
      detail?: string | null;
      instance?: string | null;
      errors?: {
        [key: string]: string[];
      };
    } & {
      [key: string]: unknown;
    };
    InvitationRegistrationOptionsRequest: {
      invitationToken?: string;
    };
    /** @enum {string} */
    LargeBlobSupport: "required" | "preferred";
    PageContentDraftResponse: {
      /** Format: uuid */
      pageId: string;
      locale: string;
      sections: unknown;
      /** Format: date-time */
      updatedAt: string;
    };
    PageContentResponse: {
      /** Format: uuid */
      id: string;
      title: string;
      locale: string;
      /** Format: int32 */
      version: number;
      sections: unknown;
    };
    PageRequest: {
      slug: string;
      title: string;
      isPublished: boolean;
    };
    PageResponse: {
      /** Format: int32 */
      id: number;
      /** Format: uuid */
      publicId: string;
      slug: string;
      title: string;
      isPublished: boolean;
      components: components["schemas"]["ComponentResponse"][];
    };
    PageSummary: {
      /** Format: int32 */
      id: number;
      /** Format: uuid */
      publicId: string;
      slug: string;
      title: string;
      isPublished: boolean;
    };
    ProblemDetails: {
      type?: string | null;
      title?: string | null;
      /** Format: int32 */
      status?: number | null;
      detail?: string | null;
      instance?: string | null;
    } & {
      [key: string]: unknown;
    };
    PubKeyCredParam: {
      type?: components["schemas"]["PublicKeyCredentialType"];
      alg?: components["schemas"]["Algorithm"];
    };
    PublicKeyCredentialDescriptor: {
      type?: components["schemas"]["PublicKeyCredentialType"];
      /** Format: byte */
      id?: string;
      transports?: components["schemas"]["AuthenticatorTransport"][] | null;
    };
    /** @enum {string} */
    PublicKeyCredentialHint: "security-key" | "client-device" | "hybrid";
    PublicKeyCredentialRpEntity: {
      id?: string;
      name?: string;
      icon?: string | null;
    };
    /** @enum {string} */
    PublicKeyCredentialType: "public-key" | "invalid";
    PublishedPageSummary: {
      /** Format: uuid */
      publicId: string;
      slug: string;
      title: string;
    };
    /** @enum {string} */
    ResidentKeyRequirement: "required" | "preferred" | "discouraged";
    ReusableComponentDraftResponse: {
      /** Format: uuid */
      componentId: string;
      name: string;
      locale: string;
      content: unknown;
      /** Format: date-time */
      updatedAt: string;
    };
    ReusableComponentResponse: {
      /** Format: uuid */
      componentId: string;
      name: string;
      locale: string;
      /** Format: int32 */
      revision: number;
      content: unknown;
      /** Format: date-time */
      publishedAt: string;
    };
    ReusableComponentSummary: {
      /** Format: uuid */
      componentId: string;
      name: string;
      isWithdrawn: boolean;
      /** Format: date-time */
      createdAt: string;
    };
    StringAuthenticationExtensionsPRFValuesKeyValuePair: {
      key?: string | null;
      value?: components["schemas"]["AuthenticationExtensionsPRFValues"];
    };
    UpdatePageContentDraftRequest: {
      sections?: {
        [key: string]: unknown;
      }[];
    };
    UpdateReusableComponentDraftRequest: {
      content?: {
        [key: string]: unknown;
      };
    };
    UpdateReusableComponentNameRequest: {
      name?: string;
    };
    /** @enum {string} */
    UserVerificationRequirement: "required" | "preferred" | "discouraged";
  };
  responses: never;
  parameters: never;
  requestBodies: never;
  headers: never;
  pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
  GetActions: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        componentId: number;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ActionResponse"][];
        };
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  CreateAction: {
    parameters: {
      query?: never;
      header: {
        /** @description Session-bound CSRF token returned by GET /api/auth/session. */
        "X-CSRF-Token": string;
      };
      path: {
        componentId: number;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["ActionRequest"];
      };
    };
    responses: {
      /** @description Created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ActionResponse"];
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["HttpValidationProblemDetails"];
        };
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Conflict */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  GetAction: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: number;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ActionResponse"];
        };
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  UpdateAction: {
    parameters: {
      query?: never;
      header: {
        /** @description Session-bound CSRF token returned by GET /api/auth/session. */
        "X-CSRF-Token": string;
      };
      path: {
        id: number;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["ActionRequest"];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ActionResponse"];
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["HttpValidationProblemDetails"];
        };
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Conflict */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  DeleteAction: {
    parameters: {
      query?: never;
      header: {
        /** @description Session-bound CSRF token returned by GET /api/auth/session. */
        "X-CSRF-Token": string;
      };
      path: {
        id: number;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description No Content */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  CreateInvitationPasskeyOptions: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["InvitationRegistrationOptionsRequest"];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["CredentialCreateOptionsPasskeyOptionsResponse"];
        };
      };
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      /** @description Forbidden */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      /** @description Conflict */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
    };
  };
  CompleteInvitationPasskeyRegistration: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["CompleteInvitationRegistrationRequest"];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["AuthorSessionResponse"];
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      /** @description Conflict */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
    };
  };
  CreatePasskeySignInOptions: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["AssertionOptionsPasskeyOptionsResponse"];
        };
      };
    };
  };
  CompletePasskeySignIn: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["CompleteSignInRequest"];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["AuthorSessionResponse"];
        };
      };
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      /** @description Forbidden */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
    };
  };
  GetAuthorSession: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["AuthorSessionResponse"];
        };
      };
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      /** @description Forbidden */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
    };
  };
  SignOutAuthor: {
    parameters: {
      query?: never;
      header: {
        /** @description Session-bound CSRF token returned by GET /api/auth/session. */
        "X-CSRF-Token": string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description No Content */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      /** @description Forbidden */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
    };
  };
  GetAuthorPasskeys: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["AuthorPasskeyResponse"][];
        };
      };
    };
  };
  CompleteAdditionalPasskeyRegistration: {
    parameters: {
      query?: never;
      header: {
        /** @description Session-bound CSRF token returned by GET /api/auth/session. */
        "X-CSRF-Token": string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["CompleteAuthenticatedRegistrationRequest"];
      };
    };
    responses: {
      /** @description No Content */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      /** @description Conflict */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
    };
  };
  CreateAdditionalPasskeyOptions: {
    parameters: {
      query?: never;
      header: {
        /** @description Session-bound CSRF token returned by GET /api/auth/session. */
        "X-CSRF-Token": string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["CredentialCreateOptionsPasskeyOptionsResponse"];
        };
      };
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      /** @description Forbidden */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
    };
  };
  RevokeAuthorPasskey: {
    parameters: {
      query?: never;
      header: {
        /** @description Session-bound CSRF token returned by GET /api/auth/session. */
        "X-CSRF-Token": string;
      };
      path: {
        passkeyId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description No Content */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      /** @description Forbidden */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      /** @description Conflict */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
    };
  };
  GetBindings: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        componentId: number;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["BindingResponse"][];
        };
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  CreateBinding: {
    parameters: {
      query?: never;
      header: {
        /** @description Session-bound CSRF token returned by GET /api/auth/session. */
        "X-CSRF-Token": string;
      };
      path: {
        componentId: number;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["BindingRequest"];
      };
    };
    responses: {
      /** @description Created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["BindingResponse"];
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["HttpValidationProblemDetails"];
        };
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Conflict */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  GetBinding: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: number;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["BindingResponse"];
        };
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  UpdateBinding: {
    parameters: {
      query?: never;
      header: {
        /** @description Session-bound CSRF token returned by GET /api/auth/session. */
        "X-CSRF-Token": string;
      };
      path: {
        id: number;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["BindingRequest"];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["BindingResponse"];
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["HttpValidationProblemDetails"];
        };
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Conflict */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  DeleteBinding: {
    parameters: {
      query?: never;
      header: {
        /** @description Session-bound CSRF token returned by GET /api/auth/session. */
        "X-CSRF-Token": string;
      };
      path: {
        id: number;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description No Content */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  GetComponent: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: number;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ComponentResponse"];
        };
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  UpdateComponent: {
    parameters: {
      query?: never;
      header: {
        /** @description Session-bound CSRF token returned by GET /api/auth/session. */
        "X-CSRF-Token": string;
      };
      path: {
        id: number;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["ComponentRequest"];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ComponentResponse"];
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["HttpValidationProblemDetails"];
        };
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Conflict */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  DeleteComponent: {
    parameters: {
      query?: never;
      header: {
        /** @description Session-bound CSRF token returned by GET /api/auth/session. */
        "X-CSRF-Token": string;
      };
      path: {
        id: number;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description No Content */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  GetHealth: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HealthResponse"];
        };
      };
    };
  };
  GetPublishedPages: {
    parameters: {
      query: {
        locale: string;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["PublishedPageSummary"][];
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["HttpValidationProblemDetails"];
        };
      };
    };
  };
  GetPageContent: {
    parameters: {
      query: {
        locale: string;
      };
      header?: never;
      path: {
        pageId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["PageContentResponse"];
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["HttpValidationProblemDetails"];
        };
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Unprocessable Content */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  GetPageContentDraft: {
    parameters: {
      query: {
        locale: string;
      };
      header?: never;
      path: {
        pageId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["PageContentDraftResponse"];
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["HttpValidationProblemDetails"];
        };
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  UpdatePageContentDraft: {
    parameters: {
      query: {
        locale: string;
      };
      header: {
        /** @description Session-bound CSRF token returned by GET /api/auth/session. */
        "X-CSRF-Token": string;
      };
      path: {
        pageId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["UpdatePageContentDraftRequest"];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["PageContentDraftResponse"];
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["HttpValidationProblemDetails"];
        };
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Unprocessable Content */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  StartPageDraftFromPublished: {
    parameters: {
      query: {
        locale: string;
      };
      header: {
        /** @description Session-bound CSRF token returned by GET /api/auth/session. */
        "X-CSRF-Token": string;
      };
      path: {
        pageId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["PageContentDraftResponse"];
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["HttpValidationProblemDetails"];
        };
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Conflict */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  PublishPageContent: {
    parameters: {
      query: {
        locale: string;
      };
      header: {
        /** @description Session-bound CSRF token returned by GET /api/auth/session. */
        "X-CSRF-Token": string;
      };
      path: {
        pageId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["PageContentResponse"];
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["HttpValidationProblemDetails"];
        };
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Conflict */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Unprocessable Content */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  GetPages: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["PageSummary"][];
        };
      };
    };
  };
  CreatePage: {
    parameters: {
      query?: never;
      header: {
        /** @description Session-bound CSRF token returned by GET /api/auth/session. */
        "X-CSRF-Token": string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["PageRequest"];
      };
    };
    responses: {
      /** @description Created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["PageSummary"];
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["HttpValidationProblemDetails"];
        };
      };
      /** @description Conflict */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  GetPageByPublicId: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        pageId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["PageResponse"];
        };
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  UpdatePage: {
    parameters: {
      query?: never;
      header: {
        /** @description Session-bound CSRF token returned by GET /api/auth/session. */
        "X-CSRF-Token": string;
      };
      path: {
        id: number;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["PageRequest"];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["PageSummary"];
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["HttpValidationProblemDetails"];
        };
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Conflict */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  DeletePage: {
    parameters: {
      query?: never;
      header: {
        /** @description Session-bound CSRF token returned by GET /api/auth/session. */
        "X-CSRF-Token": string;
      };
      path: {
        id: number;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description No Content */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  GetComponents: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        pageId: number;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ComponentResponse"][];
        };
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  CreateComponent: {
    parameters: {
      query?: never;
      header: {
        /** @description Session-bound CSRF token returned by GET /api/auth/session. */
        "X-CSRF-Token": string;
      };
      path: {
        pageId: number;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["ComponentRequest"];
      };
    };
    responses: {
      /** @description Created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ComponentResponse"];
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["HttpValidationProblemDetails"];
        };
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Conflict */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  GetReusableComponents: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ReusableComponentSummary"][];
        };
      };
    };
  };
  CreateReusableComponent: {
    parameters: {
      query?: never;
      header: {
        /** @description Session-bound CSRF token returned by GET /api/auth/session. */
        "X-CSRF-Token": string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["CreateReusableComponentRequest"];
      };
    };
    responses: {
      /** @description Created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ReusableComponentDraftResponse"];
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["HttpValidationProblemDetails"];
        };
      };
      /** @description Conflict */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Unprocessable Content */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  GetReusableComponent: {
    parameters: {
      query: {
        locale: string;
      };
      header?: never;
      path: {
        componentId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ReusableComponentResponse"];
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["HttpValidationProblemDetails"];
        };
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  UpdateReusableComponentName: {
    parameters: {
      query?: never;
      header: {
        /** @description Session-bound CSRF token returned by GET /api/auth/session. */
        "X-CSRF-Token": string;
      };
      path: {
        componentId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["UpdateReusableComponentNameRequest"];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ReusableComponentSummary"];
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["HttpValidationProblemDetails"];
        };
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Conflict */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  DeleteReusableComponent: {
    parameters: {
      query?: never;
      header: {
        /** @description Session-bound CSRF token returned by GET /api/auth/session. */
        "X-CSRF-Token": string;
      };
      path: {
        componentId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description No Content */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Conflict */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  GetReusableComponentDraft: {
    parameters: {
      query: {
        locale: string;
      };
      header?: never;
      path: {
        componentId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ReusableComponentDraftResponse"];
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["HttpValidationProblemDetails"];
        };
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  UpdateReusableComponentDraft: {
    parameters: {
      query: {
        locale: string;
      };
      header: {
        /** @description Session-bound CSRF token returned by GET /api/auth/session. */
        "X-CSRF-Token": string;
      };
      path: {
        componentId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["UpdateReusableComponentDraftRequest"];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ReusableComponentDraftResponse"];
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["HttpValidationProblemDetails"];
        };
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Unprocessable Content */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  PublishReusableComponent: {
    parameters: {
      query: {
        locale: string;
      };
      header: {
        /** @description Session-bound CSRF token returned by GET /api/auth/session. */
        "X-CSRF-Token": string;
      };
      path: {
        componentId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ReusableComponentResponse"];
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["HttpValidationProblemDetails"];
        };
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Conflict */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Unprocessable Content */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  WithdrawReusableComponent: {
    parameters: {
      query?: never;
      header: {
        /** @description Session-bound CSRF token returned by GET /api/auth/session. */
        "X-CSRF-Token": string;
      };
      path: {
        componentId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description No Content */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Conflict */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
}
