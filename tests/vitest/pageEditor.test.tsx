import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "../../src/App";
import { installFakeApi, type FakeResponse } from "./fakeApi";

afterEach(() => {
  vi.unstubAllGlobals();
});

const summary = {
  id: 7,
  publicId: "77777777-7777-7777-7777-777777777777",
  slug: "welcome",
  title: "Welcome",
  isPublished: false,
};
const page = { ...summary, components: [] };
const managementPath = `/api/pages/by-public-id/${summary.publicId}`;

function baseRoutes(extra: Record<string, FakeResponse | (() => FakeResponse)> = {}) {
  return {
    "GET /health": { body: { status: "ok" } },
    "GET /api/pages/": { body: [summary] },
    [`GET ${managementPath}`]: { body: page },
    "GET /api/reusable-components": { body: [] },
    [`GET /api/content/pages/${summary.publicId}`]: { status: 404, body: { title: "Not found" } },
    [`GET /api/content/pages/${summary.publicId}/draft`]: {
      status: 404,
      body: { title: "Not found" },
    },
    ...extra,
  };
}

describe("page editor", () => {
  it("loads an unpublished management page by UUID without requesting slug detail", async () => {
    const { requests } = installFakeApi(baseRoutes());
    render(<App />);

    expect(await screen.findByRole("heading", { name: "Welcome", level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Edit page" })).toBeInTheDocument();
    expect(requests.some((r) => r.method === "GET" && r.path === managementPath)).toBe(true);
    expect(requests.some((r) => r.path === "/api/pages/welcome")).toBe(false);
  });

  it("keeps the selected UUID when its slug is renamed", async () => {
    let current = { ...summary };
    const other = {
      ...summary,
      id: 8,
      publicId: "88888888-8888-8888-8888-888888888888",
      slug: "other",
      title: "Other",
    };
    const { requests } = installFakeApi(
      baseRoutes({
        "GET /api/pages/": () => ({ body: [other, current] }),
        [`GET /api/pages/by-public-id/${other.publicId}`]: { body: { ...other, components: [] } },
        [`GET /api/content/pages/${other.publicId}`]: { status: 404 },
        [`GET /api/content/pages/${other.publicId}/draft`]: { status: 404 },
        [`GET ${managementPath}`]: () => ({ body: { ...current, components: [] } }),
        "PUT /api/pages/7": () => {
          current = { ...current, slug: "renamed", title: "Renamed" };
          return { body: current };
        },
      }),
    );
    const user = userEvent.setup();
    render(<App />);
    await screen.findByRole("heading", { name: "Other", level: 1 });
    await user.click(screen.getByRole("button", { name: "Welcome" }));
    await screen.findByRole("heading", { name: "Welcome", level: 1 });
    await user.click(await screen.findByRole("button", { name: "Edit page" }));
    const dialog = await screen.findByRole("dialog");
    const slug = within(dialog).getByLabelText("URL slug");
    await user.clear(slug);
    await user.type(slug, "renamed");
    await user.click(within(dialog).getByRole("button", { name: "Save changes" }));

    expect(await screen.findByRole("heading", { name: "Renamed", level: 1 })).toBeInTheDocument();
    expect(screen.getByText("/renamed", { selector: ".page-slug" })).toBeInTheDocument();
    expect(requests.filter((r) => r.path === managementPath).length).toBeGreaterThanOrEqual(2);
    expect(
      requests.some((r) => ["/api/pages/welcome", "/api/pages/renamed"].includes(r.path)),
    ).toBe(false);
  });

  it("surfaces UUID lookup errors without silently retrying the slug route", async () => {
    const { requests } = installFakeApi(
      baseRoutes({
        [`GET ${managementPath}`]: { status: 404, body: { title: "Management page unavailable." } },
      }),
    );
    render(<App />);

    expect(await screen.findByText("Management page unavailable.")).toBeInTheDocument();
    expect(requests.some((r) => r.path === "/api/pages/welcome")).toBe(false);
  });

  it("creates a page", async () => {
    let created = false;
    const { requests } = installFakeApi(
      baseRoutes({
        "GET /api/pages/": () => ({ body: created ? [summary] : [] }),
        "POST /api/pages/": () => {
          created = true;
          return { status: 201, body: summary };
        },
      }),
    );
    const user = userEvent.setup();
    render(<App />);

    await user.click(await screen.findByRole("button", { name: "Create your first page" }));
    const dialog = await screen.findByRole("dialog");
    await user.type(within(dialog).getByLabelText("Page title"), "Welcome");
    await user.type(within(dialog).getByLabelText("URL slug"), "welcome");
    await user.click(within(dialog).getByLabelText(/Published/));
    await user.click(within(dialog).getByRole("button", { name: "Save changes" }));

    expect(await screen.findByText(/page saved\./)).toBeInTheDocument();
    expect(requests.find((r) => r.method === "POST")?.body).toEqual({
      slug: "welcome",
      title: "Welcome",
      isPublished: true,
    });
    expect(await screen.findByRole("heading", { name: "Welcome", level: 1 })).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows the server error and keeps the dialog open when creating fails", async () => {
    installFakeApi(
      baseRoutes({
        "GET /api/pages/": { body: [] },
        "POST /api/pages/": { status: 409, body: { error: "Slug already exists." } },
      }),
    );
    const user = userEvent.setup();
    render(<App />);

    await user.click(await screen.findByRole("button", { name: "Create your first page" }));
    const dialog = await screen.findByRole("dialog");
    await user.type(within(dialog).getByLabelText("Page title"), "Welcome");
    await user.type(within(dialog).getByLabelText("URL slug"), "welcome");
    await user.click(within(dialog).getByRole("button", { name: "Save changes" }));

    expect(await screen.findByText("Slug already exists.")).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("edits an existing page", async () => {
    const { requests } = installFakeApi(
      baseRoutes({ "PUT /api/pages/7": { body: { ...summary, title: "Renamed" } } }),
    );
    const user = userEvent.setup();
    render(<App />);

    await user.click(await screen.findByRole("button", { name: "Edit page" }));
    const dialog = await screen.findByRole("dialog");
    const title = within(dialog).getByLabelText("Page title");
    await user.clear(title);
    await user.type(title, "Renamed");
    await user.click(within(dialog).getByRole("button", { name: "Save changes" }));

    expect(await screen.findByText("page saved.")).toBeInTheDocument();
    expect(requests.find((r) => r.method === "PUT")?.body).toEqual({
      slug: "welcome",
      title: "Renamed",
      isPublished: false,
    });
  });

  it("shows the server error when editing fails", async () => {
    installFakeApi(
      baseRoutes({ "PUT /api/pages/7": { status: 400, body: { title: "Title is invalid." } } }),
    );
    const user = userEvent.setup();
    render(<App />);

    await user.click(await screen.findByRole("button", { name: "Edit page" }));
    await user.click(
      within(await screen.findByRole("dialog")).getByRole("button", { name: "Save changes" }),
    );

    expect(await screen.findByText("Title is invalid.")).toBeInTheDocument();
  });

  it("deletes a page after confirmation", async () => {
    let deleted = false;
    const { requests } = installFakeApi(
      baseRoutes({
        "GET /api/pages/": () => ({ body: deleted ? [] : [summary] }),
        "DELETE /api/pages/7": () => {
          deleted = true;
          return { status: 204 };
        },
      }),
    );
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const user = userEvent.setup();
    render(<App />);

    await user.click(await screen.findByRole("button", { name: "Delete" }));

    expect(await screen.findByText("Page deleted.")).toBeInTheDocument();
    expect(requests.some((r) => r.method === "DELETE" && r.path === "/api/pages/7")).toBe(true);
    expect(await screen.findByText("No pages yet. Create one to begin.")).toBeInTheDocument();
  });

  it("does not delete when the confirmation is declined", async () => {
    const { requests } = installFakeApi(baseRoutes());
    vi.spyOn(window, "confirm").mockReturnValue(false);
    const user = userEvent.setup();
    render(<App />);

    await user.click(await screen.findByRole("button", { name: "Delete" }));

    expect(requests.some((r) => r.method === "DELETE")).toBe(false);
  });

  it("shows the server error when deleting fails", async () => {
    installFakeApi(
      baseRoutes({ "DELETE /api/pages/7": { status: 500, body: { title: "Delete failed." } } }),
    );
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const user = userEvent.setup();
    render(<App />);

    await user.click(await screen.findByRole("button", { name: "Delete" }));

    expect(await screen.findByText("Delete failed.")).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByRole("heading", { name: "Welcome", level: 1 })).toBeInTheDocument(),
    );
  });
});
