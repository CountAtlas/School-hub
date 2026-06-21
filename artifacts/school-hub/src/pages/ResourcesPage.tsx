import { useMemo, useState } from "react";
import { useGetApprovedSubmissions } from "@workspace/api-client-react";
import PdfThumbnail from "../components/PdfThumbnail";

async function trackMetric(id: string, metric: "views" | "downloads"): Promise<void> {
  const url = `/api/submissions/${encodeURIComponent(id)}/engagement`;
  try {
    if (typeof window !== "undefined") {
      const key = `${metric}-${id}`;
      if (localStorage.getItem(key)) return;
      localStorage.setItem(key, "1");
    }
  } catch {}
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ metric }),
      credentials: "include",
      keepalive: true,
    });
  } catch {}
}

export default function ResourcesPage() {
  const { data } = useGetApprovedSubmissions({ section: "resources" });
  const resources = data?.submissions ?? [];

  const [query, setQuery] = useState("");
  const [activeSubject, setActiveSubject] = useState("All");
  const [activeAuthor, setActiveAuthor] = useState("All");
  const [actionError, setActionError] = useState("");

  const subjects = useMemo(() => [
    "All",
    ...Array.from(new Set(resources.map((r) => r.subject))).filter(Boolean),
  ], [resources]);

  const authors = useMemo(() => [
    "All",
    ...Array.from(new Set(resources.map((r) => r.author).filter(Boolean))),
  ], [resources]);

  const filtered = useMemo(() => {
    const s = query.toLowerCase().trim();
    return resources.filter((r) => {
      const matchSearch = !s ||
        r.title.toLowerCase().includes(s) ||
        r.subject.toLowerCase().includes(s) ||
        (r.author || "").toLowerCase().includes(s);
      const matchSubject = activeSubject === "All" || r.subject === activeSubject;
      const matchAuthor = activeAuthor === "All" || r.author === activeAuthor;
      return matchSearch && matchSubject && matchAuthor;
    });
  }, [resources, query, activeSubject, activeAuthor]);

  async function openPdf(resource: (typeof resources)[0]) {
    setActionError("");
    try { await trackMetric(resource.id, "views"); } catch {}
    try { window.location.assign(resource.fileUrl); } catch { setActionError("Could not open the file."); }
  }

  async function downloadPdf(resource: (typeof resources)[0]) {
    setActionError("");
    try { await trackMetric(resource.id, "downloads"); } catch {}
    try {
      const link = document.createElement("a");
      link.href = resource.fileUrl;
      link.download = resource.fileUrl.split("/").pop() || "download";
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch { setActionError("Could not start the download."); }
  }

  return (
    <main className="min-h-screen px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10">
          <p className="text-sm uppercase tracking-[0.4em] text-violet-400">School Hub</p>
          <h1 className="mt-3 text-5xl font-bold">Resources</h1>
          <p className="mt-3 text-zinc-400">Question banks, sample papers, reference material, and useful study resources.</p>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <input
            type="text"
            placeholder="Search resources, authors, subjects..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 outline-none focus:border-violet-500"
          />
          <select
            value={activeSubject}
            onChange={(e) => setActiveSubject(e.target.value)}
            className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 outline-none focus:border-violet-500"
          >
            {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            value={activeAuthor}
            onChange={(e) => setActiveAuthor(e.target.value)}
            className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 outline-none focus:border-violet-500"
          >
            {authors.map((a) => <option key={String(a)} value={String(a)}>{String(a)}</option>)}
          </select>
        </div>

        {actionError && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {actionError}
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-6">
          {filtered.length > 0 ? (
            filtered.map((resource) => (
              <article
                key={resource.id}
                className="group block w-[300px] min-h-[20rem] overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:border-violet-500 hover:bg-violet-500/5 hover:shadow-[0_0_30px_rgba(139,92,246,0.30)]"
              >
                <div className="flex h-full flex-col">
                  <div>
                    <h2 className="text-xl font-semibold text-white">{resource.title}</h2>
                    <p className="mt-1 text-sm text-zinc-400">By {resource.author || "Anonymous"}</p>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-violet-500/15 px-3 py-1 text-[10px] text-violet-300">{resource.subject}</span>
                    <span className="rounded-full border border-zinc-700 px-2 py-1 text-[10px] text-zinc-300">Class {resource.classLevel}</span>
                    {resource.board && <span className="rounded-full border border-zinc-700 px-2 py-1 text-[10px] text-zinc-300">{resource.board}</span>}
                  </div>

                  {resource.mimeType === "application/pdf" ? (
                    <PdfThumbnail url={resource.fileUrl} className="mt-3 h-44" />
                  ) : resource.description ? (
                    <p className="mt-3 text-sm text-zinc-400 line-clamp-3">{resource.description}</p>
                  ) : null}

                  <div className="mt-auto pt-3">
                    <div className="flex items-center justify-between text-xs text-zinc-500">
                      <span>{resource.views ?? 0} views</span>
                      <span>{resource.downloads ?? 0} downloads</span>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => openPdf(resource)}
                        className="flex-1 rounded-xl border border-violet-500/30 bg-violet-500/10 px-3 py-2 text-xs text-violet-300 transition hover:bg-violet-500/20"
                      >
                        View PDF
                      </button>
                      <button
                        type="button"
                        onClick={() => downloadPdf(resource)}
                        className="flex-1 rounded-xl border border-zinc-700 px-3 py-2 text-xs text-zinc-300 transition hover:border-violet-500"
                      >
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8 text-zinc-400">
              No resources found.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
