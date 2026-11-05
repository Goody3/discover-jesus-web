import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "../../src/App";
import { installFakeApi, type FakeResponse } from "./fakeApi";

afterEach(() => {
  vi.unstubAllGlobals();
});

const component = { componentId: "c-1", name: "Hero", isWithdrawn: false, createdAt: "2025-01-01" };
const draft = {
  componentId: "c-1",
  name: "Hero",
  locale: "en",
  content: { type: "text", value: "Draft body" },
  updatedAt: "2025-01-02",
};

function routes(extra: Record<string, FakeResponse> = {}) {
  return {
    "GET /health": { body: { status: "ok" } },
    "GET /api/pages/": { body: [] },
    "GET /api/reusable-components": { body: [component] },
    "GET /api/reusable-components/c-1/draft": { body: draft },
    ...extra,
  };
}

async function openManager(user: ReturnType<typeof userEvent.setup>) {
  await user.click(await screen.findByRole("button", { name: "Reusable components" }));
  return screen.findByRole("heading", { name: "Hero", level: 2 });
}

async function loadDraft(user: ReturnType<typeof userEvent.setup>) {
  await openManager(user);
  await user.click(screen.getByRole("button", { name: "Load draft" }));
  await screen.findByText("Loaded en draft.");
}

describe("reusable component manager", () => {
  it("creates a component with a draft", async () => {
    const banner = { ...component, componentId: "c-2", name: "Banner" };
    let created = false;
    const { requests } = installFakeApi({
      ...routes(),
      "GET /api/reusable-components": () => ({ body: created ? [component, banner] : [component] }),
      "POST /api/reusable-components": () => {
        created = true;
        return { status: 201, body: { ...draft, componentId: "c-2", name: "Banner" } };
      },
    });
    const user = userEvent.setup();
    render(<App />);
    await openManager(user);

    const createCard = screen.getByRole("heading", { name: "Create a component" }).parentElement!;
    await user.type(within(createCard).getByLabelText("Friendly name"), "Banner");
    await user.click(screen.getByRole("button", { name: "Create draft" }));

    expect(await screen.findByRole("button", { name: /Banner/ })).toBeInTheDocument();
    const post = requests.find((r) => r.method === "POST");
    expect(post?.body).toMatchObject({ name: "Banner", locale: "en" });
  });

  it("loads the draft for the selected locale", async () => {
    const { requests } = installFakeApi(routes());
    const user = userEvent.setup();
    render(<App />);

    await loadDraft(user);

    expect(requests.some((r) => r.path === "/api/reusable-components/c-1/draft")).toBe(true);
    expect(screen.getByLabelText(/Component content/)).toHaveValue(
      JSON.stringify(draft.content, null, 2),
    );
  });

  it("saves the draft with the edited content", async () => {
    const { requests } = installFakeApi(
      routes({ "PUT /api/reusable-components/c-1/draft": { body: draft } }),
    );
    const user = userEvent.setup();
    render(<App />);
    await loadDraft(user);

    const editor = screen.getByLabelText(/Component content/);
    await user.clear(editor);
    await user.click(editor);
    await user.paste('{"type":"text","value":"Edited"}');
    await user.click(screen.getByRole("button", { name: "Save draft" }));

    expect(await screen.findByText("Saved en draft.")).toBeInTheDocument();
    expect(requests.find((r) => r.method === "PUT")?.body).toEqual({
      content: { type: "text", value: "Edited" },
    });
  });

  it("shows an error and skips the request when draft content is not valid JSON", async () => {
    const { requests } = installFakeApi(routes());
    const user = userEvent.setup();
    render(<App />);
    await loadDraft(user);

    const editor = screen.getByLabelText(/Component content/);
    await user.clear(editor);
    await user.click(editor);
    await user.paste("not json");
    await user.click(screen.getByRole("button", { name: "Save draft" }));

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(requests.some((r) => r.method === "PUT")).toBe(false);
  });

  it("publishes the draft and shows the revision", async () => {
    installFakeApi(
      routes({
        "POST /api/reusable-components/c-1/publish": {
          body: {
            componentId: "c-1",
            name: "Hero",
            locale: "en",
            revision: 4,
            content: {},
            publishedAt: "x",
          },
        },
      }),
    );
    const user = userEvent.setup();
    render(<App />);
    await loadDraft(user);

    await user.click(screen.getByRole("button", { name: "Publish revision" }));

    expect(await screen.findByText("Published en revision 4.")).toBeInTheDocument();
    expect(screen.getByText("Published revision 4")).toBeInTheDocument();
  });

  it("shows the server error when publishing fails", async () => {
    installFakeApi(
      routes({
        "POST /api/reusable-components/c-1/publish": {
          status: 409,
          body: { title: "Draft has no changes." },
        },
      }),
    );
    const user = userEvent.setup();
    render(<App />);
    await loadDraft(user);

    await user.click(screen.getByRole("button", { name: "Publish revision" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Draft has no changes.");
  });

  it("shows the server error when the draft cannot be loaded", async () => {
    installFakeApi(
      routes({
        "GET /api/reusable-components/c-1/draft": {
          status: 404,
          body: { error: "No draft for this locale." },
        },
      }),
    );
    const user = userEvent.setup();
    render(<App />);
    await openManager(user);

    await user.click(screen.getByRole("button", { name: "Load draft" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("No draft for this locale.");
  });

  it("loads published content for a changed locale", async () => {
    const { requests } = installFakeApi(
      routes({
        "GET /api/reusable-components/c-1": {
          body: {
            componentId: "c-1",
            name: "Hero",
            locale: "es",
            revision: 2,
            content: { type: "text", value: "Hola" },
            publishedAt: "x",
          },
        },
      }),
    );
    const user = userEvent.setup();
    render(<App />);
    await openManager(user);

    const locale = screen.getAllByLabelText("Locale").find((el) => el.closest(".locale-field"))!;
    await user.clear(locale);
    await user.type(locale, "es");
    await user.click(screen.getByRole("button", { name: "Load published" }));

    expect(await screen.findByText("Loaded published es revision 2.")).toBeInTheDocument();
    expect(requests.find((r) => r.path === "/api/reusable-components/c-1")?.search).toBe(
      "?locale=es",
    );
  });

  it("clears loaded content when the locale changes", async () => {
    installFakeApi(routes());
    const user = userEvent.setup();
    render(<App />);
    await loadDraft(user);

    const locale = screen.getAllByLabelText("Locale").find((el) => el.closest(".locale-field"))!;
    await user.type(locale, "x");

    expect(screen.queryByLabelText(/Component content/)).not.toBeInTheDocument();
  });
});
