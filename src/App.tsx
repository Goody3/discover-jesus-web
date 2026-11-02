import { useCallback, useEffect, useState } from "react";
import {
  ApiRequestError,
  apiRequest,
  type ActionDefinition,
  type Binding,
  type Component,
  type PageContentDraftResponse,
  type PageContentResponse,
  type Page,
  type PageSummary,
  type ReusableComponentDraftResponse,
  type ReusableComponentResponse,
  type ReusableComponentSummary,
} from "./api";
import {
  parseJsonNode,
  renderPreviewNode,
  resolvePageNavigation,
  type PreviewAction,
} from "./preview";

type EditorKind = "page" | "component" | "binding" | "action";

interface EditorModal {
  kind: EditorKind;
  title: string;
  id?: number;
  parentId?: number;
  values: Record<string, string>;
}

const emptyMessage = "Nothing here yet. Add your first item to get started.";
type WorkspaceMode = "pages" | "reusable-components";

function jsonText(value: unknown): string {
  return JSON.stringify(value === undefined ? {} : value, null, 2);
}

function collectSourceComponentIds(value: unknown, ids = new Set<string>()): Set<string> {
  if (Array.isArray(value)) {
    value.forEach((item) => collectSourceComponentIds(item, ids));
  } else if (typeof value === "object" && value !== null) {
    const sourceComponentId = Reflect.get(value, "sourceComponentId");
    if (typeof sourceComponentId === "string") {
      ids.add(sourceComponentId);
    }
    Object.values(value).forEach((item) => collectSourceComponentIds(item, ids));
  }
  return ids;
}

function App() {
  const [pages, setPages] = useState<PageSummary[]>([]);
  const [reusableComponents, setReusableComponents] = useState<ReusableComponentSummary[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [selectedReusableComponentId, setSelectedReusableComponentId] = useState<string | null>(null);
  const [page, setPage] = useState<Page | null>(null);
  const [previewPageId, setPreviewPageId] = useState<string | null>(null);
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>("pages");
  const [editor, setEditor] = useState<EditorModal | null>(null);
  const [busy, setBusy] = useState(false);
  const [loadingPages, setLoadingPages] = useState(true);
  const [loadingReusableComponents, setLoadingReusableComponents] = useState(false);
  const [loadingPage, setLoadingPage] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pageRefresh, setPageRefresh] = useState(0);
  const [connection, setConnection] = useState<"checking" | "online" | "offline">(
    "checking",
  );

  const refreshPages = useCallback(async () => {
    setLoadingPages(true);
    try {
      const results = await apiRequest<PageSummary[]>("/api/pages/");
      setPages(results);
      setSelectedSlug((current) =>
        current && results.some((item) => item.slug === current)
          ? current
          : (results[0]?.slug ?? null),
      );
      setError("");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load pages.",
      );
    } finally {
      setLoadingPages(false);
    }
  }, []);

  const refreshReusableComponents = useCallback(async () => {
    setLoadingReusableComponents(true);
    try {
      const results = await apiRequest<ReusableComponentSummary[]>("/api/reusable-components");
      setReusableComponents(results);
      setSelectedReusableComponentId((current) =>
        current && results.some((item) => item.componentId === current)
          ? current
          : (results.find((item) => !item.isWithdrawn)?.componentId
            ?? results[0]?.componentId
            ?? null),
      );
      setError("");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load reusable components.",
      );
    } finally {
      setLoadingReusableComponents(false);
    }
  }, []);

  useEffect(() => {
    void refreshPages();
  }, [refreshPages]);

  useEffect(() => {
    void refreshReusableComponents();
  }, [refreshReusableComponents]);

  useEffect(() => {
    let active = true;
    if (!selectedSlug) {
      setPage(null);
      return () => {
        active = false;
      };
    }

    setLoadingPage(true);
    apiRequest<Page>(`/api/pages/${encodeURIComponent(selectedSlug)}`)
      .then((result) => {
        if (active) {
          setPage(result);
          setError("");
        }
      })
      .catch((requestError: unknown) => {
        if (active) {
          setPage(null);
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Unable to load this page.",
          );
        }
      })
      .finally(() => {
        if (active) setLoadingPage(false);
      });

    return () => {
      active = false;
    };
  }, [selectedSlug, pageRefresh]);

  const checkConnection = useCallback(async () => {
    setConnection("checking");
    try {
      await apiRequest<{ status: string }>("/health");
      setConnection("online");
    } catch {
      setConnection("offline");
    }
  }, []);

  useEffect(() => {
    void checkConnection();
  }, [checkConnection]);

  function openPageEditor(existing?: PageSummary) {
    setEditor({
      kind: "page",
      title: existing ? "Edit page" : "Create a page",
      id: existing?.id,
      values: {
        slug: existing?.slug ?? "",
        title: existing?.title ?? "",
        isPublished: String(existing?.isPublished ?? false),
      },
    });
  }

  function openComponentEditor(existing?: Component, parentId?: number) {
    if (!existing && parentId === undefined) return;
    setEditor({
      kind: "component",
      title: existing ? "Edit component" : "Add a component",
      id: existing?.id,
      parentId: existing?.id ? undefined : parentId,
      values: {
        key: existing?.key ?? "",
        type: existing?.type ?? "",
        props: jsonText(existing?.props),
        sortOrder: String(existing?.sortOrder ?? 0),
      },
    });
  }

  function openBindingEditor(existing: Binding | undefined, parentId: number) {
    setEditor({
      kind: "binding",
      title: existing ? "Edit binding" : "Add a binding",
      id: existing?.id,
      parentId,
      values: {
        name: existing?.name ?? "",
        source: existing?.source ?? "",
        config: jsonText(existing?.config),
      },
    });
  }

  function openActionEditor(
    existing: ActionDefinition | undefined,
    parentId: number,
  ) {
    setEditor({
      kind: "action",
      title: existing ? "Edit action" : "Add an action",
      id: existing?.id,
      parentId,
      values: {
        name: existing?.name ?? "",
        type: existing?.type ?? "",
        config: jsonText(existing?.config),
      },
    });
  }

  async function saveEditor(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editor) return;

    const values = editor.values;
    let path = "";
    let method = editor.id ? "PUT" : "POST";
    let body: Record<string, unknown>;

    try {
      switch (editor.kind) {
        case "page":
          path = editor.id ? `/api/pages/${editor.id}` : "/api/pages/";
          body = {
            slug: values.slug,
            title: values.title,
            isPublished: values.isPublished === "true",
          };
          break;
        case "component":
          if (!editor.id && editor.parentId === undefined) return;
          path = editor.id
            ? `/api/components/${editor.id}`
            : `/api/pages/${editor.parentId}/components`;
          body = {
            key: values.key,
            type: values.type,
            props: JSON.parse(values.props || "{}") as unknown,
            sortOrder: Number(values.sortOrder),
          };
          break;
        case "binding":
          if (!editor.id && editor.parentId === undefined) return;
          path = editor.id
            ? `/api/bindings/${editor.id}`
            : `/api/components/${editor.parentId}/bindings`;
          body = {
            name: values.name,
            source: values.source,
            config: JSON.parse(values.config || "{}") as unknown,
          };
          break;
        case "action":
          if (!editor.id && editor.parentId === undefined) return;
          path = editor.id
            ? `/api/actions/${editor.id}`
            : `/api/components/${editor.parentId}/actions`;
          body = {
            name: values.name,
            type: values.type,
            config: JSON.parse(values.config || "{}") as unknown,
          };
          break;
      }

      setBusy(true);
      setError("");
      setNotice("");
      const saved = await apiRequest<PageSummary>(path, {
        method,
        body: JSON.stringify(body),
      });
      setEditor(null);
      if (editor.kind === "page" && "slug" in saved) {
        setSelectedSlug(saved.slug);
        setPageRefresh((count) => count + 1);
        await refreshPages();
      } else {
        setPageRefresh((count) => count + 1);
      }
      setNotice(`${editor.title.replace(/^(Add|Create|Edit) /, "")} saved.`);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to save changes.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function deleteResource(path: string, label: string, pageDeleted = false) {
    if (!window.confirm(`Delete this ${label}? This cannot be undone.`)) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await apiRequest<void>(path, { method: "DELETE" });
      if (pageDeleted) {
        setPage(null);
        setSelectedSlug(null);
        await refreshPages();
      } else {
        setPageRefresh((count) => count + 1);
      }
      setNotice(`${label[0].toUpperCase()}${label.slice(1)} deleted.`);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : `Unable to delete ${label}.`,
      );
    } finally {
      setBusy(false);
    }
  }

  const selectedSummary = pages.find((item) => item.slug === selectedSlug);
  const selectedReusableComponent = reusableComponents.find(
    (item) => item.componentId === selectedReusableComponentId,
  );

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="/" aria-label="Discover Jesus Content Studio">
          <span className="brand-mark">D</span>
          <span>
            <strong>Discover Jesus</strong>
            <small>Content Studio</small>
          </span>
        </a>

        <div className="sidebar-heading">
          <span>{workspaceMode === "reusable-components" ? "COMPONENT LIBRARY" : "YOUR PAGES"}</span>
          {workspaceMode === "pages" && <button
            className="icon-button"
            type="button"
            onClick={() => openPageEditor()}
            aria-label="Create a page"
            title="Create a page"
          >
            +
          </button>}
        </div>

        <nav className="page-nav" aria-label="Pages">
          <button
            type="button"
            className={`page-nav-item${workspaceMode === "reusable-components" ? " active" : ""}`}
            onClick={() => {
              setWorkspaceMode("reusable-components");
              setPreviewPageId(null);
              void refreshReusableComponents();
            }}
          >
            <span className="page-nav-title">Reusable components</span>
          </button>
          {workspaceMode === "reusable-components" && (
            loadingReusableComponents && reusableComponents.length === 0 ? (
              <p className="sidebar-empty">Loading components…</p>
            ) : reusableComponents.length === 0 ? (
              <p className="sidebar-empty">No reusable components yet.</p>
            ) : reusableComponents.map((item) => (
              <button
                type="button"
                key={item.componentId}
                className={`page-nav-item component-nav-item${item.componentId === selectedReusableComponentId ? " active" : ""}`}
                onClick={() => setSelectedReusableComponentId(item.componentId)}
              >
                <span className="page-nav-title">{item.name}</span>
                {item.isWithdrawn
                  ? <span className="component-withdrawn-label">Withdrawn</span>
                  : <span className="status-dot published" />}
              </button>
            )))}
          {loadingPages && pages.length === 0 ? (
            <p className="sidebar-empty">Loading pages…</p>
          ) : pages.length === 0 ? (
            <p className="sidebar-empty">No pages yet. Create one to begin.</p>
          ) : (
            pages.map((item) => (
              <button
                type="button"
                key={item.id}
                className={`page-nav-item${workspaceMode === "pages" && item.slug === selectedSlug ? " active" : ""}`}
                onClick={() => {
                  setWorkspaceMode("pages");
                  setPreviewPageId(null);
                  setSelectedSlug(item.slug);
                }}
              >
                <span className="page-nav-title">{item.title}</span>
                <span className={`status-dot${item.isPublished ? " published" : ""}`} />
              </button>
            ))
          )}
        </nav>

        <div className="sidebar-footer">
          <span className={`connection-dot ${connection}`} />
          <span>
            API {connection === "checking" ? "checking" : connection}
          </span>
          <button
            type="button"
            className="text-button"
            onClick={() => void checkConnection()}
          >
            Check
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">
            <span>Content</span>
            <span className="breadcrumb-divider">/</span>
            <strong>
              {workspaceMode === "reusable-components"
                ? "Reusable components"
                : previewPageId
                  ? "Published preview"
                  : page?.title ?? "Workspace"}
            </strong>
          </div>
          <span className="backend-label">BACKEND MANAGER</span>
        </header>

        <section className="workspace">
          {(error || notice) && (
            <div className={`alert ${error ? "alert-error" : "alert-success"}`} role="status">
              <span>{error || notice}</span>
              <button
                type="button"
                aria-label="Dismiss notification"
                onClick={() => {
                  setError("");
                  setNotice("");
                }}
              >
                ×
              </button>
            </div>
          )}

          {workspaceMode === "reusable-components" ? (
            <ReusableComponentManager
              selectedComponent={selectedReusableComponent}
              onSelectComponent={setSelectedReusableComponentId}
              onRefresh={() => void refreshReusableComponents()}
            />
          ) : previewPageId ? (
            <PublishedPagePreview
              key={previewPageId}
              initialPageId={previewPageId}
              pages={pages}
              onClose={() => setPreviewPageId(null)}
            />
          ) : loadingPage ? (
            <div className="empty-state"><p>Loading page…</p></div>
          ) : page ? (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">PAGE DEFINITION</div>
                  <h1>{page.title}</h1>
                  <p className="page-slug">/{page.slug}</p>
                </div>
                <div className="heading-actions">
                  <span className={`publish-badge${page.isPublished ? " is-published" : ""}`}>
                    {page.isPublished ? "Published" : "Draft"}
                  </span>
                  {selectedSummary?.isPublished && (
                    <button
                      className="button button-secondary"
                      type="button"
                      onClick={() => setPreviewPageId(selectedSummary.publicId)}
                    >
                      Preview published
                    </button>
                  )}
                  <button
                    className="button button-secondary"
                    type="button"
                    onClick={() => openPageEditor(page)}
                  >
                    Edit page
                  </button>
                  <button
                    className="button button-danger-quiet"
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      void deleteResource(`/api/pages/${page.id}`, "page", true)
                    }
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="summary-row">
                <div className="summary-card">
                  <span className="summary-number">{page.components.length}</span>
                  <span>Embedded components</span>
                </div>
                <div className="summary-card">
                  <span className="summary-number">
                    {page.components.reduce((total, item) => total + item.bindings.length, 0)}
                  </span>
                  <span>Data bindings</span>
                </div>
                <div className="summary-card">
                  <span className="summary-number">
                    {page.components.reduce((total, item) => total + item.actions.length, 0)}
                  </span>
                  <span>Actions</span>
                </div>
              </div>

              {selectedSummary?.publicId && (
                <PageContentEditor
                  key={selectedSummary.publicId}
                  page={selectedSummary}
                  components={reusableComponents}
                />
              )}

              <div className="section-heading">
                <div>
                  <div className="eyebrow">PAGE CONTENT</div>
                  <h2>Embedded components</h2>
                </div>
                <button
                  className="button button-primary"
                  type="button"
                  onClick={() => openComponentEditor(undefined, page.id)}
                >
                  <span aria-hidden="true">+</span> Add component
                </button>
              </div>

              {page.components.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">▤</div>
                  <h3>No embedded components yet</h3>
                  <p>
                    Reusable components linked to published page content are listed above.
                    Add an embedded component here only if this page needs page-owned content.
                  </p>
                  <button
                    className="button button-primary"
                    type="button"
                    onClick={() => openComponentEditor(undefined, page.id)}
                  >
                    Add an embedded component
                  </button>
                </div>
              ) : (
                <div className="component-list">
                  {page.components.map((component, index) => (
                    <ComponentCard
                      key={component.id}
                      component={component}
                      index={index}
                      busy={busy}
                      onEdit={() => openComponentEditor(component)}
                      onDelete={() =>
                        void deleteResource(
                          `/api/components/${component.id}`,
                          "component",
                        )
                      }
                      onAddBinding={() =>
                        openBindingEditor(undefined, component.id)
                      }
                      onEditBinding={(binding) =>
                        openBindingEditor(binding, component.id)
                      }
                      onDeleteBinding={(binding) =>
                        void deleteResource(
                          `/api/bindings/${binding.id}`,
                          "binding",
                        )
                      }
                      onAddAction={() =>
                        openActionEditor(undefined, component.id)
                      }
                      onEditAction={(action) =>
                        openActionEditor(action, component.id)
                      }
                      onDeleteAction={(action) =>
                        void deleteResource(
                          `/api/actions/${action.id}`,
                          "action",
                        )
                      }
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="welcome-state">
              <div className="welcome-mark">D</div>
              <div className="eyebrow">CONTENT MANAGEMENT</div>
              <h1>Build your pages.</h1>
              <p>
                Create and manage the page definitions served by your Discover
                Jesus backend.
              </p>
              <button
                className="button button-primary"
                type="button"
                onClick={() => openPageEditor()}
              >
                Create your first page
              </button>
              {selectedSummary && (
                <button
                  className="button button-secondary"
                  type="button"
                  onClick={() => setSelectedSlug(selectedSummary.slug)}
                >
                  Open {selectedSummary.title}
                </button>
              )}
            </div>
          )}
        </section>
      </main>

      {editor && (
        <EditorDialog
          editor={editor}
          busy={busy}
          onClose={() => setEditor(null)}
          onSave={saveEditor}
          onChange={(field, value) =>
            setEditor((current) =>
              current
                ? {
                    ...current,
                    values: { ...current.values, [field]: value },
                  }
                : null,
            )
          }
        />
      )}
    </div>
  );
}

interface ReusableComponentManagerProps {
  selectedComponent?: ReusableComponentSummary;
  onSelectComponent: (componentId: string | null) => void;
  onRefresh: () => void;
}

function ReusableComponentManager({
  selectedComponent,
  onSelectComponent,
  onRefresh,
}: ReusableComponentManagerProps) {
  const [locale, setLocale] = useState("en");
  const [newName, setNewName] = useState("");
  const [name, setName] = useState("");
  const [initialContent, setInitialContent] = useState('{\n  "type": "text",\n  "value": "Reusable content"\n}');
  const [content, setContent] = useState('{\n  "type": "text",\n  "value": "Reusable content"\n}');
  const [contentLoaded, setContentLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [revision, setRevision] = useState<number | null>(null);
  const componentId = selectedComponent?.componentId ?? "";
  const isWithdrawn = selectedComponent?.isWithdrawn ?? false;

  useEffect(() => {
    setName(selectedComponent?.name ?? "");
    setContent('{\n  "type": "text",\n  "value": "Reusable content"\n}');
    setContentLoaded(false);
    setRevision(null);
    setError("");
    setNotice("");
  }, [selectedComponent?.componentId]);

  function parseContent(): unknown {
    return parseJsonNode(content, "Component content");
  }

  async function createComponent(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const created = await apiRequest<ReusableComponentDraftResponse>(
        "/api/reusable-components",
        {
          method: "POST",
          body: JSON.stringify({
            name: newName,
            locale,
            content: parseJsonNode(initialContent, "Component content"),
          }),
        },
      );
      setNewName("");
      setName(created.name);
      setContent(jsonText(created.content));
      setContentLoaded(true);
      setRevision(null);
      onSelectComponent(created.componentId);
      onRefresh();
      setNotice(`Created “${created.name}” with a ${created.locale} draft.`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to create the component.");
    } finally {
      setBusy(false);
    }
  }

  async function loadComponent(kind: "draft" | "published") {
    if (!componentId || isWithdrawn) {
      setError("Select an active component from the library first.");
      return;
    }
    setBusy(true);
    setError("");
    setNotice("");
    try {
      if (kind === "draft") {
        const draft = await apiRequest<ReusableComponentDraftResponse>(
          `/api/reusable-components/${encodeURIComponent(componentId)}/draft?locale=${encodeURIComponent(locale)}`,
        );
        setName(draft.name);
        setContent(jsonText(draft.content));
        setContentLoaded(true);
        setRevision(null);
        setNotice(`Loaded ${draft.locale} draft.`);
      } else {
        const published = await apiRequest<ReusableComponentResponse>(
          `/api/reusable-components/${encodeURIComponent(componentId)}?locale=${encodeURIComponent(locale)}`,
        );
        setName(published.name);
        setContent(jsonText(published.content));
        setContentLoaded(true);
        setRevision(published.revision);
        setNotice(`Loaded published ${published.locale} revision ${published.revision}.`);
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : `Unable to load the ${kind}.`);
    } finally {
      setBusy(false);
    }
  }

  async function saveDraft(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!componentId || isWithdrawn) {
      setError("Select an active component from the library first.");
      return;
    }
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const draft = await apiRequest<ReusableComponentDraftResponse>(
        `/api/reusable-components/${encodeURIComponent(componentId)}/draft?locale=${encodeURIComponent(locale)}`,
        {
          method: "PUT",
          body: JSON.stringify({ content: parseContent() }),
        },
      );
      setContent(jsonText(draft.content));
      setRevision(null);
      setNotice(`Saved ${draft.locale} draft.`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to save the draft.");
    } finally {
      setBusy(false);
    }
  }

  async function publishDraft() {
    if (!componentId || isWithdrawn) {
      setError("Select an active component from the library first.");
      return;
    }
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const published = await apiRequest<ReusableComponentResponse>(
        `/api/reusable-components/${encodeURIComponent(componentId)}/publish?locale=${encodeURIComponent(locale)}`,
        { method: "POST" },
      );
      setRevision(published.revision);
      setNotice(`Published ${published.locale} revision ${published.revision}.`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to publish the component.");
    } finally {
      setBusy(false);
    }
  }

  async function withdrawComponent() {
    if (!componentId || isWithdrawn || !window.confirm("Withdraw this reusable component? Referenced components cannot be withdrawn.")) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await apiRequest<void>(
        `/api/reusable-components/${encodeURIComponent(componentId)}/withdraw`,
        { method: "POST" },
      );
      setContentLoaded(false);
      setRevision(null);
      setNotice("Reusable component withdrawn.");
      onRefresh();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to withdraw the component.");
    } finally {
      setBusy(false);
    }
  }

  async function deleteComponent() {
    if (!componentId || !window.confirm("Delete this reusable component? Referenced components cannot be deleted.")) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await apiRequest<void>(`/api/reusable-components/${encodeURIComponent(componentId)}`, {
        method: "DELETE",
      });
      onSelectComponent(null);
      setContent('{\n  "type": "text",\n  "value": "Reusable content"\n}');
      setContentLoaded(false);
      setRevision(null);
      setNotice("Reusable component deleted.");
      onRefresh();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to delete the component.");
    } finally {
      setBusy(false);
    }
  }

  async function renameComponent(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!componentId) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const updated = await apiRequest<ReusableComponentSummary>(
        `/api/reusable-components/${encodeURIComponent(componentId)}`,
        {
          method: "PUT",
          body: JSON.stringify({ name }),
        },
      );
      setName(updated.name);
      onRefresh();
      setNotice(`Renamed component to “${updated.name}”.`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to rename the component.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="authoring-panel" aria-label="Reusable component authoring">
      <div className="section-heading">
        <div>
          <div className="eyebrow">BACKEND-MANAGED STORE</div>
          <h1>Reusable components</h1>
          <p className="panel-description">
            Find components by name, manage their localized content, and add them to pages without handling UUIDs.
          </p>
        </div>
      </div>
      {(error || notice) && (
        <div className={`alert ${error ? "alert-error" : "alert-success"}`} role={error ? "alert" : "status"}>
          <span>{error || notice}</span>
          <button type="button" aria-label="Dismiss notification" onClick={() => { setError(""); setNotice(""); }}>×</button>
        </div>
      )}
      <div className="authoring-card">
        <h2>Create a component</h2>
        <form className="authoring-form" onSubmit={(event) => void createComponent(event)}>
          <label className="form-field">
            <span>Friendly name</span>
            <input required maxLength={200} value={newName} onChange={(event) => setNewName(event.target.value)} />
          </label>
          <label className="form-field">
            <span>Locale</span>
            <input required value={locale} onChange={(event) => setLocale(event.target.value)} />
          </label>
          <JsonEditorField label="Initial component content" value={initialContent} onChange={setInitialContent} />
          <button className="button button-primary" type="submit" disabled={busy}>Create draft</button>
        </form>
      </div>
      {selectedComponent ? (
        <div className="authoring-card">
          <div className="component-manage-heading">
            <div>
              <h2>{selectedComponent.name}</h2>
              {isWithdrawn && <span className="component-withdrawn-badge">Withdrawn</span>}
            </div>
            <button type="button" className="text-button" onClick={() => onSelectComponent(null)}>
              Close
            </button>
          </div>
          <form className="component-name-form" onSubmit={(event) => void renameComponent(event)}>
            <label className="form-field">
              <span>Friendly name</span>
              <input required maxLength={200} value={name} onChange={(event) => setName(event.target.value)} />
            </label>
            <button className="button button-secondary" type="submit" disabled={busy || name.trim() === selectedComponent.name}>
              Save name
            </button>
          </form>
          <div className="component-load-row">
            <label className="form-field locale-field">
              <span>Locale</span>
              <input value={locale} onChange={(event) => { setLocale(event.target.value); setContentLoaded(false); setRevision(null); }} />
            </label>
            <div className="row-actions component-load-actions">
              <button type="button" className="button button-secondary" disabled={busy || isWithdrawn} onClick={() => void loadComponent("draft")}>Load draft</button>
              <button type="button" className="button button-secondary" disabled={busy || isWithdrawn} onClick={() => void loadComponent("published")}>Load published</button>
            </div>
          </div>
          {contentLoaded ? (
            <form className="authoring-form" onSubmit={(event) => void saveDraft(event)}>
              <JsonEditorField label="Component content (JSON)" value={content} onChange={(value) => { setContent(value); setRevision(null); }} />
              <div className="authoring-actions">
                <button className="button button-secondary" type="submit" disabled={busy || isWithdrawn || revision !== null}>Save draft</button>
                <button className="button button-primary" type="button" disabled={busy || isWithdrawn || revision !== null} onClick={() => void publishDraft()}>Publish revision</button>
                <button className="button button-danger-quiet" type="button" disabled={busy || isWithdrawn} onClick={() => void withdrawComponent()}>Withdraw</button>
                <button className="button button-danger-quiet" type="button" disabled={busy} onClick={() => void deleteComponent()}>Delete component</button>
                {revision !== null && <span className="revision-label">Published revision {revision}</span>}
              </div>
            </form>
          ) : !isWithdrawn ? (
            <p className="field-hint">Load this component’s draft or published content for the selected locale to edit it.</p>
          ) : (
            <p className="field-hint">Withdrawn components are unavailable to pages. You can rename or delete this entry.</p>
          )}
        </div>
      ) : (
        <div className="empty-state">
          <h3>Select a component</h3>
          <p>Choose a name from the library, or create a new component.</p>
        </div>
      )}
    </section>
  );
}

interface PageContentEditorProps {
  page: PageSummary;
  components: ReusableComponentSummary[];
}

function PageContentEditor({ page, components }: PageContentEditorProps) {
  const [locale, setLocale] = useState("en");
  const [sections, setSections] = useState("[]");
  const [referenceId, setReferenceId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [publishedVersion, setPublishedVersion] = useState<number | null>(null);
  const [publishedContent, setPublishedContent] = useState<PageContentResponse | null>(null);
  const [publishedContentLoading, setPublishedContentLoading] = useState(true);
  const [publishedContentError, setPublishedContentError] = useState("");
  const [draftStatus, setDraftStatus] = useState<"checking" | "exists" | "missing" | "error">("checking");

  useEffect(() => {
    let active = true;
    setPublishedContent(null);
    setPublishedContentError("");
    setPublishedContentLoading(true);
    apiRequest<PageContentResponse>(
      `/api/content/pages/${encodeURIComponent(page.publicId)}?locale=${encodeURIComponent(locale)}`,
    )
      .then((result) => {
        if (!Array.isArray(result.sections)) {
          throw new Error("The published page response has an invalid sections value.");
        }
        if (active) setPublishedContent(result);
      })
      .catch((requestError: unknown) => {
        if (!active) return;
        if (requestError instanceof ApiRequestError && requestError.status === 404) {
          setPublishedContent(null);
          return;
        }
        setPublishedContentError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load published page content.",
        );
      })
      .finally(() => {
        if (active) setPublishedContentLoading(false);
      });

    return () => {
      active = false;
    };
  }, [page.publicId, locale]);

  useEffect(() => {
    let active = true;
    setDraftStatus("checking");
    setSections("[]");
    apiRequest<PageContentDraftResponse>(
      `/api/content/pages/${encodeURIComponent(page.publicId)}/draft?locale=${encodeURIComponent(locale)}`,
    )
      .then((draft) => {
        if (!Array.isArray(draft.sections)) {
          throw new Error("The page draft response has an invalid sections value.");
        }
        if (active) {
          setSections(jsonText(draft.sections));
          setDraftStatus("exists");
        }
      })
      .catch((requestError: unknown) => {
        if (!active) return;
        if (requestError instanceof ApiRequestError && requestError.status === 404) {
          setDraftStatus("missing");
          return;
        }
        setDraftStatus("error");
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to check for a page draft.",
        );
      });

    return () => {
      active = false;
    };
  }, [page.publicId, locale]);

  const linkedComponentIds = publishedContent
    ? [...collectSourceComponentIds(publishedContent.sections)]
    : [];
  const linkedComponents = linkedComponentIds.map((componentId) => ({
    componentId,
    name: components.find((component) => component.componentId === componentId)?.name
      ?? "Reusable component",
  }));
  const contentLoadFailed = Boolean(publishedContentError);

  async function loadDraft() {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const draft = await apiRequest<PageContentDraftResponse>(
        `/api/content/pages/${encodeURIComponent(page.publicId)}/draft?locale=${encodeURIComponent(locale)}`,
      );
      setSections(jsonText(draft.sections));
      setDraftStatus("exists");
      setNotice(`Loaded ${draft.locale} page draft.`);
    } catch (requestError) {
      if (requestError instanceof ApiRequestError && requestError.status === 404) {
        setDraftStatus("missing");
      }
      setError(requestError instanceof Error ? requestError.message : "Unable to load the page draft.");
    } finally {
      setBusy(false);
    }
  }

  async function startDraftFromPublished() {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const draft = await apiRequest<PageContentDraftResponse>(
        `/api/content/pages/${encodeURIComponent(page.publicId)}/draft/from-published?locale=${encodeURIComponent(locale)}`,
        { method: "POST" },
      );
      setSections(jsonText(draft.sections));
      setDraftStatus("exists");
      setPublishedVersion(null);
      setNotice(`Started a ${draft.locale} draft from published content. Existing component references are preserved.`);
    } catch (requestError) {
      if (requestError instanceof ApiRequestError && requestError.status === 409) {
        await loadDraft();
        setNotice("A draft already existed, so its saved content has been loaded.");
      } else {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to start a draft from published content.",
        );
      }
    } finally {
      setBusy(false);
    }
  }

  async function saveDraft(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const parsed: unknown = JSON.parse(sections);
      if (!Array.isArray(parsed)) {
        throw new Error("Page sections must be a JSON array.");
      }
      const draft = await apiRequest<PageContentDraftResponse>(
        `/api/content/pages/${encodeURIComponent(page.publicId)}/draft?locale=${encodeURIComponent(locale)}`,
        {
          method: "PUT",
          body: JSON.stringify({ sections: parsed }),
        },
      );
      setSections(jsonText(draft.sections));
      setDraftStatus("exists");
      setPublishedVersion(null);
      setNotice(`Saved ${draft.locale} page draft.`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to save the page draft.");
    } finally {
      setBusy(false);
    }
  }

  async function publishDraft() {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const published = await apiRequest<PageContentResponse>(
        `/api/content/pages/${encodeURIComponent(page.publicId)}/publish?locale=${encodeURIComponent(locale)}`,
        { method: "POST" },
      );
      setPublishedVersion(published.version);
      setPublishedContent(published);
      setSections("[]");
      setDraftStatus("missing");
      setNotice(`Published ${published.locale} page revision ${published.version}.`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to publish the page.");
    } finally {
      setBusy(false);
    }
  }

  function appendReference() {
    if (publishedContent && draftStatus === "missing") {
      setError("Start a draft from published content before changing this page.");
      return;
    }
    const selected = components.find(
      (component) => component.componentId === referenceId && !component.isWithdrawn,
    );
    if (!selected) {
      setError("Choose an active reusable component from the list.");
      return;
    }
    try {
      const parsed: unknown = JSON.parse(sections);
      if (!Array.isArray(parsed)) {
        throw new Error("Page sections must be a JSON array.");
      }
      parsed.push({ type: "componentReference", componentId: selected.componentId });
      setSections(jsonText(parsed));
      setError("");
      setNotice("Component reference added to the draft editor. Save the draft to persist it.");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to add a component reference.");
    }
  }

  return (
    <div className="authoring-card page-content-editor">
      <div className="page-content-editor-heading">
        <div>
          <div className="eyebrow">LOCALE-SPECIFIC PAGE CONTENT</div>
          <h2>Sections and reusable references</h2>
          <p className="panel-description">
            Draft and publish page sections. Select components by friendly name; the Studio keeps their identifiers internal.
          </p>
        </div>
        <label className="form-field locale-field">
          <span>Locale</span>
          <input value={locale} onChange={(event) => setLocale(event.target.value)} />
        </label>
      </div>
      <section className="published-reference-summary" aria-label="Published reusable components">
        <div className="published-reference-heading">
          <strong>Reusable components in published content</strong>
          {publishedContent && (
            <span>{publishedContent.locale} · revision {publishedContent.version}</span>
          )}
        </div>
        {publishedContentLoading ? (
          <p className="field-hint">Loading published content…</p>
        ) : publishedContentError ? (
          <p className="published-reference-error" role="alert">{publishedContentError}</p>
        ) : !publishedContent ? (
          <p className="field-hint">No published page content exists for this locale yet.</p>
        ) : linkedComponents.length === 0 ? (
          <p className="field-hint">This published page does not reference any reusable components.</p>
        ) : (
          <ul className="published-reference-list">
            {linkedComponents.map((component, index) => (
              <li key={`${component.componentId}-${index}`}>
                <span className="published-reference-order">{index + 1}</span>
                <span>{component.name}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
      {(error || notice) && (
        <div className={`alert ${error ? "alert-error" : "alert-success"}`} role={error ? "alert" : "status"}>
          <span>{error || notice}</span>
          <button type="button" aria-label="Dismiss notification" onClick={() => { setError(""); setNotice(""); }}>×</button>
        </div>
      )}
      <form className="authoring-form" onSubmit={(event) => void saveDraft(event)}>
        <div className="row-actions">
          <button className="button button-secondary" type="button" disabled={busy || draftStatus === "checking" || draftStatus === "error"} onClick={() => void loadDraft()}>Load draft</button>
          {publishedContent && draftStatus === "missing" && (
            <button
              className="button button-primary"
              type="button"
              disabled={busy || publishedContentLoading}
              onClick={() => void startDraftFromPublished()}
            >
              Start draft from published content
            </button>
          )}
        </div>
        <div className="component-load-row reference-insert-row">
          <label className="form-field">
            <span>Reusable component</span>
            <select value={referenceId} onChange={(event) => setReferenceId(event.target.value)}>
              <option value="">Choose a component</option>
              {components.filter((component) => !component.isWithdrawn).map((component) => (
                <option key={component.componentId} value={component.componentId}>{component.name}</option>
              ))}
            </select>
          </label>
          <button
            className="button button-secondary"
            type="button"
            disabled={!referenceId || busy || contentLoadFailed || draftStatus === "checking" || draftStatus === "error" || (!!publishedContent && draftStatus === "missing")}
            onClick={appendReference}
          >
            Add reference
          </button>
        </div>
        <details className="advanced-json-editor">
          <summary>Advanced: edit page sections as JSON</summary>
          <JsonEditorField label="Sections (JSON array)" value={sections} onChange={(value) => { setSections(value); setPublishedVersion(null); }} />
        </details>
        <div className="authoring-actions">
          <button
            className="button button-secondary"
            type="submit"
            disabled={busy || contentLoadFailed || draftStatus === "checking" || draftStatus === "error" || (!!publishedContent && draftStatus === "missing")}
          >
            Save draft
          </button>
          <button
            className="button button-primary"
            type="button"
            disabled={busy || contentLoadFailed || draftStatus !== "exists"}
            onClick={() => void publishDraft()}
          >
            Publish page
          </button>
          {publishedVersion !== null && <span className="revision-label">Published revision {publishedVersion}</span>}
        </div>
      </form>
    </div>
  );
}

interface JsonEditorFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function JsonEditorField({ label, value, onChange }: JsonEditorFieldProps) {
  return (
    <label className="form-field">
      <span>{label} <small>Valid JSON</small></span>
      <textarea rows={9} spellCheck={false} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

interface PublishedPagePreviewProps {
  initialPageId: string;
  pages: PageSummary[];
  onClose: () => void;
}

export function PublishedPagePreview({
  initialPageId,
  pages,
  onClose,
}: PublishedPagePreviewProps) {
  const [localeInput, setLocaleInput] = useState("en");
  const [locale, setLocale] = useState("en");
  const [pageHistory, setPageHistory] = useState([initialPageId]);
  const [content, setContent] = useState<PageContentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const pageId = pageHistory[pageHistory.length - 1];

  useEffect(() => {
    let active = true;
    setLoading(true);
    setContent(null);
    setError("");
    setActionMessage("");
    apiRequest<PageContentResponse>(
      `/api/content/pages/${encodeURIComponent(pageId)}?locale=${encodeURIComponent(locale)}`,
    )
      .then((result) => {
        if (
          typeof result.id !== "string"
          || typeof result.title !== "string"
          || typeof result.locale !== "string"
          || !Number.isInteger(result.version)
          || !Array.isArray(result.sections)
        ) {
          throw new Error("The published page response has an invalid shape.");
        }
        if (active) setContent(result);
      })
      .catch((requestError: unknown) => {
        if (active) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Unable to load this published page.",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [pageId, locale]);

  function handleAction(action: PreviewAction) {
    setActionMessage("");
    switch (action.type) {
      case "navigate": {
        const destination = resolvePageNavigation(pages, action.pageId);
        if (destination.status === "invalid") {
          setActionMessage("This navigation action has no valid page UUID.");
          return;
        }
        if (destination.status === "unavailable") {
          setActionMessage("The destination page is unavailable or unpublished.");
          return;
        }
        setPageHistory((history) => [...history, destination.page.publicId]);
        return;
      }
      case "showModal":
        setActionMessage(
          `Modal ${typeof action.modalId === "string" ? `"${action.modalId}"` : ""} cannot be previewed because modal content is not available in this API.`,
        );
        return;
      case "navigateIf":
        setActionMessage(
          "Conditional navigation is not evaluated in preview because condition semantics are not defined.",
        );
        return;
      case "openExternalUrl":
        setActionMessage("External links in preview must use a valid HTTPS URL.");
        return;
      default:
        setActionMessage(`Action "${String(action.type)}" is not supported in preview.`);
    }
  }

  function renderNode(value: unknown, key: string): React.ReactNode {
    return renderPreviewNode(value, key, (action) => {
      void handleAction(action);
    });
  }

  function changeLocale(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextLocale = localeInput.trim();
    if (!nextLocale) {
      setError("Enter a locale to load a published page.");
      return;
    }
    setPageHistory([initialPageId]);
    setLocale(nextLocale);
  }

  return (
    <section className="published-preview" aria-label="Published page preview">
      <div className="preview-toolbar">
        <div>
          <div className="eyebrow">PUBLISHED PAGE PREVIEW</div>
          <h1>{content?.title ?? "Preview page"}</h1>
          {content && <p className="page-slug">Locale {content.locale} · Revision {content.version}</p>}
        </div>
        <div className="preview-toolbar-actions">
          <form className="preview-locale-form" onSubmit={changeLocale}>
            <label htmlFor="preview-locale">Locale</label>
            <input id="preview-locale" value={localeInput}
              onChange={(event) => setLocaleInput(event.target.value)} />
            <button className="button button-secondary" type="submit">Load</button>
          </form>
          {pageHistory.length > 1 && (
            <button className="button button-secondary" type="button"
              onClick={() => setPageHistory((history) => history.slice(0, -1))}>
              Back
            </button>
          )}
          <button className="button button-secondary" type="button" onClick={onClose}>
            Close preview
          </button>
        </div>
      </div>

      {actionMessage && <p className="preview-notice" role="status">{actionMessage}</p>}
      {loading ? (
        <div className="empty-state" role="status"><p>Loading published content…</p></div>
      ) : error ? (
        <div className="empty-state preview-error" role="alert">
          <div className="empty-icon">!</div>
          <h3>Published content unavailable</h3>
          <p>{error}</p>
          <p>Check that this page has published content for the selected locale.</p>
        </div>
      ) : content && Array.isArray(content.sections) && content.sections.length === 0 ? (
        <div className="empty-state"><p>This page has no published sections.</p></div>
      ) : (
        <article className="preview-canvas">
          {content && Array.isArray(content.sections)
            ? content.sections.map((node, index) => renderNode(node, `section-${index}`))
            : null}
        </article>
      )}
    </section>
  );
}

interface ComponentCardProps {
  component: Component;
  index: number;
  busy: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onAddBinding: () => void;
  onEditBinding: (binding: Binding) => void;
  onDeleteBinding: (binding: Binding) => void;
  onAddAction: () => void;
  onEditAction: (action: ActionDefinition) => void;
  onDeleteAction: (action: ActionDefinition) => void;
}

function ComponentCard({
  component,
  index,
  busy,
  onEdit,
  onDelete,
  onAddBinding,
  onEditBinding,
  onDeleteBinding,
  onAddAction,
  onEditAction,
  onDeleteAction,
}: ComponentCardProps) {
  return (
    <article className="component-card">
      <div className="component-main">
        <div className="component-order">{String(index + 1).padStart(2, "0")}</div>
        <div className="component-info">
          <div className="component-title-row">
            <h3>{component.key}</h3>
            <span className="type-chip">{component.type}</span>
          </div>
          <p>Sort order {component.sortOrder}</p>
        </div>
        <div className="component-counts">
          <span>{component.bindings.length} bindings</span>
          <span>{component.actions.length} actions</span>
        </div>
        <div className="row-actions">
          <button className="text-button" type="button" onClick={onEdit}>Edit</button>
          <button className="text-button text-danger" type="button" disabled={busy} onClick={onDelete}>Delete</button>
        </div>
      </div>

      <div className="component-details">
        <details>
          <summary>
            Data bindings <span className="detail-count">{component.bindings.length}</span>
          </summary>
          <div className="detail-content">
            {component.bindings.length === 0 ? (
              <p className="muted">{emptyMessage}</p>
            ) : (
              <div className="child-list">
                {component.bindings.map((binding) => (
                  <div className="child-row" key={binding.id}>
                    <div>
                      <strong>{binding.name}</strong>
                      <span className="child-subtitle">{binding.source}</span>
                    </div>
                    <div className="child-actions">
                      <button className="text-button" type="button" onClick={() => onEditBinding(binding)}>Edit</button>
                      <button className="text-button text-danger" type="button" disabled={busy} onClick={() => onDeleteBinding(binding)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button className="text-button add-child" type="button" onClick={onAddBinding}>+ Add binding</button>
          </div>
        </details>

        <details>
          <summary>
            Action definitions <span className="detail-count">{component.actions.length}</span>
          </summary>
          <div className="detail-content">
            {component.actions.length === 0 ? (
              <p className="muted">{emptyMessage}</p>
            ) : (
              <div className="child-list">
                {component.actions.map((action) => (
                  <div className="child-row" key={action.id}>
                    <div>
                      <strong>{action.name}</strong>
                      <span className="child-subtitle">{action.type}</span>
                    </div>
                    <div className="child-actions">
                      <button className="text-button" type="button" onClick={() => onEditAction(action)}>Edit</button>
                      <button className="text-button text-danger" type="button" disabled={busy} onClick={() => onDeleteAction(action)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button className="text-button add-child" type="button" onClick={onAddAction}>+ Add action</button>
          </div>
        </details>
      </div>
    </article>
  );
}

interface EditorDialogProps {
  editor: EditorModal;
  busy: boolean;
  onClose: () => void;
  onSave: (event: React.FormEvent<HTMLFormElement>) => void;
  onChange: (field: string, value: string) => void;
}

function EditorDialog({
  editor,
  busy,
  onClose,
  onSave,
  onChange,
}: EditorDialogProps) {
  const field = (name: string) => editor.values[name] ?? "";
  const input = (label: string, name: string, placeholder?: string) => (
    <label className="form-field" key={name}>
      <span>{label}</span>
      <input
        autoFocus={name === (editor.kind === "page" ? "title" : "key")}
        required
        value={field(name)}
        onChange={(event) => onChange(name, event.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
  const jsonField = (label: string, name: string) => (
    <label className="form-field" key={name}>
      <span>{label} <small>Valid JSON</small></span>
      <textarea
        required
        rows={7}
        spellCheck={false}
        value={field(name)}
        onChange={(event) => onChange(name, event.target.value)}
      />
    </label>
  );

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !busy) onClose();
    }}>
      <section
        className="editor-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="editor-title"
      >
        <form onSubmit={onSave}>
          <header className="dialog-header">
            <div>
              <div className="eyebrow">CONTENT EDITOR</div>
              <h2 id="editor-title">{editor.title}</h2>
            </div>
            <button
              className="icon-button close-button"
              type="button"
              aria-label="Close"
              disabled={busy}
              onClick={onClose}
            >
              ×
            </button>
          </header>

          <div className="dialog-body">
            {editor.kind === "page" && (
              <>
                {input("Page title", "title", "Welcome")}
                {input("URL slug", "slug", "welcome")}
                <label className="toggle-field">
                  <span>
                    <strong>Published</strong>
                    <small>Make this page available to content consumers.</small>
                  </span>
                  <input
                    type="checkbox"
                    checked={field("isPublished") === "true"}
                    onChange={(event) =>
                      onChange("isPublished", String(event.target.checked))
                    }
                  />
                </label>
              </>
            )}
            {editor.kind === "component" && (
              <>
                {input("Component key", "key", "hero")}
                {input("Component type", "type", "Hero")}
                <label className="form-field">
                  <span>Sort order</span>
                  <input
                    required
                    type="number"
                    value={field("sortOrder")}
                    onChange={(event) => onChange("sortOrder", event.target.value)}
                  />
                </label>
                {jsonField("Properties", "props")}
              </>
            )}
            {editor.kind === "binding" && (
              <>
                {input("Binding name", "name", "featured-content")}
                {input("Data source", "source", "content-api")}
                {jsonField("Configuration", "config")}
              </>
            )}
            {editor.kind === "action" && (
              <>
                {input("Action name", "name", "open-page")}
                {input("Action type", "type", "navigate")}
                {jsonField("Configuration", "config")}
              </>
            )}
            {editor.kind === "page" && (
              <p className="field-hint">
                Slugs use lowercase letters and numbers separated by single hyphens.
              </p>
            )}
          </div>

          <footer className="dialog-footer">
            <button
              className="button button-secondary"
              type="button"
              disabled={busy}
              onClick={onClose}
            >
              Cancel
            </button>
            <button className="button button-primary" type="submit" disabled={busy}>
              {busy ? "Saving…" : "Save changes"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}

export default App;
