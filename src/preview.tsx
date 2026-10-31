import type { ReactNode } from "react";

export interface PreviewAction {
  type?: unknown;
  pageId?: unknown;
  condition?: unknown;
  url?: unknown;
  modalId?: unknown;
}

export interface PreviewNode {
  type: string;
  value?: unknown;
  src?: unknown;
  alt?: unknown;
  action?: unknown;
  children?: unknown;
  true?: unknown;
  false?: unknown;
  sourceComponentId?: unknown;
}

export interface PreviewPageSummary {
  publicId: string;
  isPublished: boolean;
}

export type PageNavigationResolution =
  | { status: "available"; page: PreviewPageSummary }
  | { status: "invalid" }
  | { status: "unavailable" };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isPreviewNode(value: unknown): value is PreviewNode {
  return isRecord(value) && typeof value.type === "string";
}

export function parseJsonNode(value: string, label: string): PreviewNode {
  const parsed: unknown = JSON.parse(value);
  if (!isPreviewNode(parsed)) {
    throw new Error(`${label} must be a JSON object with a string "type".`);
  }
  return parsed;
}

function isPreviewAction(value: unknown): value is PreviewAction {
  return isRecord(value) && typeof value.type === "string";
}

export function resolvePageNavigation(
  pages: PreviewPageSummary[],
  pageId: unknown,
): PageNavigationResolution {
  if (typeof pageId !== "string") return { status: "invalid" };
  const page = pages.find(
    (page) =>
      typeof page.publicId === "string"
      && page.publicId.toLowerCase() === pageId.toLowerCase(),
  );
  if (!page) return { status: "invalid" };
  if (!page.isPublished) return { status: "unavailable" };
  return { status: "available", page };
}

function safeExternalUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function safeImageUrl(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const baseUrl = typeof window === "undefined" ? "http://localhost" : window.location.origin;
    const url = new URL(value, baseUrl);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export function renderPreviewNode(
  value: unknown,
  key: string,
  onAction: (action: PreviewAction) => void,
): ReactNode {
  if (!isPreviewNode(value)) {
    return (
      <p className="preview-notice" key={key} role="status">
        This content node is invalid and could not be rendered.
      </p>
    );
  }

  const children = Array.isArray(value.children) ? value.children : [];
  const renderChildren = (nodes: unknown[]) =>
    nodes.map((child, index) => renderPreviewNode(child, `${key}-${index}`, onAction));

  switch (value.type) {
    case "text":
      return typeof value.value === "string" ? (
        <p className="preview-text" key={key}>{value.value}</p>
      ) : (
        <p className="preview-notice" key={key} role="status">
          Text content is missing its value.
        </p>
      );
    case "image": {
      const src = safeImageUrl(value.src);
      return src ? (
        <img className="preview-image" key={key} src={src}
          alt={typeof value.alt === "string" ? value.alt : ""} />
      ) : (
        <p className="preview-notice" key={key} role="status">
          This image has no valid HTTP or HTTPS source.
        </p>
      );
    }
    case "button": {
      const action = isPreviewAction(value.action) ? value.action : null;
      const externalUrl = action?.type === "openExternalUrl"
        ? safeExternalUrl(action.url)
        : null;
      const label = typeof value.value === "string" && value.value
        ? value.value
        : "Button";
      if (externalUrl) {
        return (
          <a className="button button-primary preview-button" key={key}
            href={externalUrl} target="_blank" rel="noopener noreferrer">
            {label}
          </a>
        );
      }
      return (
        <button
          className="button button-primary preview-button"
          key={key}
          type="button"
          disabled={!action}
          title={!action ? "No action is configured for this button." : undefined}
          onClick={() => action && onAction(action)}
        >
          {label}
        </button>
      );
    }
    case "stack":
    case "column":
      return <div className="preview-layout preview-column" key={key}>{renderChildren(children)}</div>;
    case "row":
      return <div className="preview-layout preview-row" key={key}>{renderChildren(children)}</div>;
    case "divider":
      return <hr className="preview-divider" key={key} />;
    case "spacer":
      return <div className="preview-spacer" key={key} aria-hidden="true" />;
    case "conditional":
    case "loop":
      return (
        <p className="preview-notice" key={key} role="status">
          {value.type === "conditional"
            ? "Conditional content is not evaluated in preview."
            : "Loop content cannot be resolved without runtime binding data."}
        </p>
      );
    case "modal":
      return (
        <p className="preview-notice" key={key} role="status">
          Modal content is not available in the published page response.
        </p>
      );
    case "componentReference":
      return (
        <p className="preview-notice" key={key} role="status">
          This reusable component reference was not expanded by the backend.
        </p>
      );
    default:
      return (
        <p className="preview-notice" key={key} role="status">
          Component type “{value.type}” is not supported in preview.
        </p>
      );
  }
}
