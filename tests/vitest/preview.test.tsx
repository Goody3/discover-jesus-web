import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PublishedPagePreview } from "../../src/App";
import { installFakeApi } from "./fakeApi";

afterEach(() => {
  vi.unstubAllGlobals();
});

const pages = [{ id: 1, publicId: "p-1", slug: "home", title: "Home", isPublished: true }];

function renderPreview() {
  return render(<PublishedPagePreview initialPageId="p-1" pages={pages} onClose={() => {}} />);
}

describe("PublishedPagePreview", () => {
  it("shows a loading state until the published content arrives", async () => {
    let resolve: (value: Response) => void = () => {};
    vi.stubGlobal(
      "fetch",
      vi.fn(() => new Promise<Response>((r) => (resolve = r))),
    );
    renderPreview();

    expect(screen.getByText("Loading published content…")).toBeInTheDocument();

    resolve(
      new Response(
        JSON.stringify({
          id: "p-1",
          title: "Welcome",
          locale: "en",
          version: 3,
          sections: [{ type: "text", value: "Hello preview" }],
        }),
      ),
    );
    expect(await screen.findByText("Hello preview")).toBeInTheDocument();
    expect(screen.getByText("Locale en · Revision 3")).toBeInTheDocument();
    expect(screen.queryByText("Loading published content…")).not.toBeInTheDocument();
  });

  it("shows the server error when published content is unavailable", async () => {
    installFakeApi({
      "GET /api/content/pages/p-1": { status: 404, body: { title: "No published content." } },
    });
    renderPreview();

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Published content unavailable");
    expect(alert).toHaveTextContent("No published content.");
  });

  it("shows an error when the response has an invalid shape", async () => {
    installFakeApi({ "GET /api/content/pages/p-1": { body: { id: "p-1" } } });
    renderPreview();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "The published page response has an invalid shape.",
    );
  });

  it("shows an error when the network request fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    renderPreview();

    expect(await screen.findByRole("alert")).toHaveTextContent("Failed to fetch");
  });

  it("requests the entered locale", async () => {
    const { requests } = installFakeApi({
      "GET /api/content/pages/p-1": {
        body: { id: "p-1", title: "T", locale: "en", version: 1, sections: [] },
      },
    });
    const user = userEvent.setup();
    renderPreview();
    await screen.findByText("This page has no published sections.");

    const input = screen.getByLabelText("Locale");
    await user.clear(input);
    await user.type(input, "es");
    await user.click(screen.getByRole("button", { name: "Load" }));

    await screen.findByText("This page has no published sections.");
    expect(
      requests.filter((r) => r.path === "/api/content/pages/p-1").map((r) => r.search),
    ).toEqual(["?locale=en", "?locale=es"]);
  });
});
