import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderPreviewNode, resolvePageNavigation } from "../../src/preview";

describe("preview renderer", () => {
  it("renders supported nested text and image content", () => {
    render(
      renderPreviewNode(
        {
          type: "stack",
          children: [
            { type: "text", value: "Hello from a reusable component" },
            { type: "image", src: "https://example.test/cover.jpg", alt: "Cover" },
          ],
        },
        "content",
        () => {},
      ),
    );

    expect(screen.getByText("Hello from a reusable component")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Cover" })).toHaveAttribute(
      "src",
      "https://example.test/cover.jpg",
    );
  });

  it("passes a button navigation action to the preview handler", () => {
    const action = { type: "navigate", pageId: "page-uuid" };
    const onAction = vi.fn();
    render(
      renderPreviewNode(
        {
          type: "button",
          value: "Continue",
          action,
        },
        "button",
        onAction,
      ),
    );
    const button = screen.getByRole("button", { name: "Continue" });

    fireEvent.click(button);
    expect(onAction).toHaveBeenCalledWith(action);
    expect(button).not.toBeDisabled();
  });

  it("resolves UUID destinations case-insensitively and rejects unavailable pages", () => {
    const pages = [
      { publicId: "AABB-CCDD", slug: "available", isPublished: true },
      { publicId: "EEFF-0011", slug: "draft", isPublished: false },
    ];

    expect(resolvePageNavigation(pages, "aabb-ccdd")).toEqual({
      status: "available",
      page: pages[0],
    });
    expect(resolvePageNavigation(pages, "EEFF-0011")).toEqual({
      status: "unavailable",
    });
    expect(resolvePageNavigation(pages, "missing")).toEqual({ status: "invalid" });
    expect(resolvePageNavigation(pages, null)).toEqual({ status: "invalid" });
  });

  it("reports invalid or unresolved references instead of silently omitting them", () => {
    render(
      <>
        {renderPreviewNode(
          {
            type: "componentReference",
            componentId: "missing-component",
          },
          "reference",
          () => {},
        )}
        {renderPreviewNode(null, "invalid", () => {})}
      </>,
    );

    expect(
      screen.getByText(/reusable component reference was not expanded by the backend/i),
    ).toHaveAttribute("role", "status");
    expect(screen.getByText(/content node is invalid and could not be rendered/i)).toHaveAttribute(
      "role",
      "status",
    );
  });

  it("rejects unsafe image sources and indicates buttons without actions", () => {
    render(
      <>
        {renderPreviewNode(
          {
            type: "image",
            src: "javascript:alert(1)",
          },
          "image",
          () => {},
        )}
        {renderPreviewNode(
          {
            type: "button",
            value: "Disabled",
          },
          "button",
          () => {},
        )}
      </>,
    );

    expect(screen.getByText(/image has no valid HTTP or HTTPS source/i)).toHaveAttribute(
      "role",
      "status",
    );
    expect(screen.getByRole("button", { name: "Disabled" })).toBeDisabled();
  });
});
