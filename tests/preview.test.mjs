import assert from "node:assert/strict";
import { test } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { renderPreviewNode, resolvePageNavigation } from "../.test-build/src/preview.js";

test("renders supported nested text and image content", () => {
  const html = renderToStaticMarkup(renderPreviewNode({
    type: "stack",
    children: [
      { type: "text", value: "Hello from a reusable component" },
      { type: "image", src: "https://example.test/cover.jpg", alt: "Cover" },
    ],
  }, "content", () => {}));

  assert.match(html, /Hello from a reusable component/);
  assert.match(html, /src="https:\/\/example\.test\/cover\.jpg"/);
  assert.match(html, /alt="Cover"/);
});

test("passes a button navigation action to the preview handler", () => {
  const action = { type: "navigate", pageId: "page-uuid" };
  let received;
  const button = renderPreviewNode({
    type: "button",
    value: "Continue",
    action,
  }, "button", (value) => { received = value; });

  button.props.onClick();
  assert.equal(received, action);
  assert.equal(button.props.disabled, false);
});

test("resolves UUID destinations case-insensitively and rejects unavailable pages", () => {
  const pages = [
    { publicId: "AABB-CCDD", slug: "available", isPublished: true },
    { publicId: "EEFF-0011", slug: "draft", isPublished: false },
  ];

  assert.deepEqual(resolvePageNavigation(pages, "aabb-ccdd"), {
    status: "available",
    page: pages[0],
  });
  assert.deepEqual(resolvePageNavigation(pages, "EEFF-0011"), {
    status: "unavailable",
  });
  assert.deepEqual(resolvePageNavigation(pages, "missing"), {
    status: "invalid",
  });
  assert.deepEqual(resolvePageNavigation(pages, null), {
    status: "invalid",
  });
});

test("reports invalid or unresolved references instead of silently omitting them", () => {
  const unresolved = renderToStaticMarkup(renderPreviewNode({
    type: "componentReference",
    componentId: "missing-component",
  }, "reference", () => {}));
  const invalid = renderToStaticMarkup(renderPreviewNode(null, "invalid", () => {}));

  assert.match(unresolved, /component reference was not expanded by the backend/);
  assert.match(unresolved, /role="status"/);
  assert.match(invalid, /content node is invalid and could not be rendered/);
});

test("rejects unsafe image sources and indicates buttons without actions", () => {
  const image = renderToStaticMarkup(renderPreviewNode({
    type: "image",
    src: "javascript:alert(1)",
  }, "image", () => {}));
  const button = renderPreviewNode({
    type: "button",
    value: "Disabled",
  }, "button", () => {});

  assert.match(image, /no valid HTTP or HTTPS source/);
  assert.equal(button.props.disabled, true);
});
