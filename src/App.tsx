import { useCallback, useEffect, useState } from "react";
import {
  apiRequest,
  type ActionDefinition,
  type Binding,
  type Component,
  type Page,
  type PageSummary,
} from "./api";

type EditorKind = "page" | "component" | "binding" | "action";

interface EditorModal {
  kind: EditorKind;
  title: string;
  id?: number;
  parentId?: number;
  values: Record<string, string>;
}

const emptyMessage = "Nothing here yet. Add your first item to get started.";

function jsonText(value: unknown): string {
  return JSON.stringify(value === undefined ? {} : value, null, 2);
}

function App() {
  const [pages, setPages] = useState<PageSummary[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [page, setPage] = useState<Page | null>(null);
  const [editor, setEditor] = useState<EditorModal | null>(null);
  const [busy, setBusy] = useState(false);
  const [loadingPages, setLoadingPages] = useState(true);
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

  useEffect(() => {
    void refreshPages();
  }, [refreshPages]);

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
          <span>YOUR PAGES</span>
          <button
            className="icon-button"
            type="button"
            onClick={() => openPageEditor()}
            aria-label="Create a page"
            title="Create a page"
          >
            +
          </button>
        </div>

        <nav className="page-nav" aria-label="Pages">
          {loadingPages && pages.length === 0 ? (
            <p className="sidebar-empty">Loading pages…</p>
          ) : pages.length === 0 ? (
            <p className="sidebar-empty">No pages yet. Create one to begin.</p>
          ) : (
            pages.map((item) => (
              <button
                type="button"
                key={item.id}
                className={`page-nav-item${item.slug === selectedSlug ? " active" : ""}`}
                onClick={() => setSelectedSlug(item.slug)}
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
            <strong>{page?.title ?? "Workspace"}</strong>
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

          {loadingPage ? (
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
                  <span>Components</span>
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

              <div className="section-heading">
                <div>
                  <div className="eyebrow">PAGE CONTENT</div>
                  <h2>Components</h2>
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
                  <h3>No components yet</h3>
                  <p>Components are the building blocks displayed on this page.</p>
                  <button
                    className="button button-primary"
                    type="button"
                    onClick={() => openComponentEditor(undefined, page.id)}
                  >
                    Add your first component
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
