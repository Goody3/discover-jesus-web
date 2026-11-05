import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "../../src/App";
import { installFakeApi, type FakeResponse } from "./fakeApi";

afterEach(() => {
  vi.unstubAllGlobals();
});

const summary = { id: 7, publicId: "p-7", slug: "welcome", title: "Welcome", isPublished: false };
const page = { ...summary, components: [] };

function baseRoutes(extra: Record<string, FakeResponse | (() => FakeResponse)> = {}) {
  return {
    "GET /health": { body: { status: "ok" } },
    "GET /api/pages/": { body: [summary] },
    "GET /api/pages/welcome": { body: page },
    "GET /api/reusable-components": { body: [] },
    "GET /api/content/pages/p-7": { status: 404, body: { title: "Not found" } },
    "GET /api/content/pages/p-7/draft": { status: 404, body: { title: "Not found" } },
    ...extra,
  };
}

describe("page editor", () => {
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
