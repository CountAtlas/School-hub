import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { apiUrl } from "../lib/api";

type Submission = {
  id: string;
  title: string;
  subject: string;
  board?: string | null;
  classLevel: string;
  section: string;
  author?: string | null;
  description?: string | null;
  fileUrl: string;
  originalFileName: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  approvedBy?: string | null;
  approvedAt?: string | null;
  rejectedBy?: string | null;
  rejectedAt?: string | null;
};

export default function AdminSubmissionsPage() {
  const [, navigate] = useLocation();
  const [items, setItems] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [error, setError] = useState("");

  async function loadItems() {
    setLoading(true);
    setError("");
    const res = await fetch(apiUrl("/api/submissions"), { credentials: "include" });
    if (res.status === 401) { navigate("/admin/login"); return; }
    const data = await res.json();
    setItems(data.submissions || []);
    setLoading(false);
  }

  useEffect(() => { loadItems(); }, []);

  async function updateStatus(id: string, status: Submission["status"]) {
    const res = await fetch(apiUrl("/api/submissions"), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
      credentials: "include",
    });
    if (res.status === 401) { navigate("/admin/login"); return; }
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error || "Update failed.");
      return;
    }
    await loadItems();
  }

  async function logout() {
    await fetch(apiUrl("/api/admin/logout"), { method: "POST", credentials: "include" });
    navigate("/admin/login");
  }

  const visibleItems = filter === "all" ? items : items.filter((item) => item.status === filter);

  const counts = useMemo(() => ({
    total: items.length,
    pending: items.filter((i) => i.status === "pending").length,
    approved: items.filter((i) => i.status === "approved").length,
    rejected: items.filter((i) => i.status === "rejected").length,
  }), [items]);

  function formatDate(value: string) {
    return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
  }

  return (
    <main className="min-h-screen px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-violet-400">School Hub</p>
            <h1 className="mt-3 text-5xl font-bold">Submissions</h1>
            <p className="mt-3 text-zinc-400">Review uploaded files and mark them pending, approved, or rejected.</p>
          </div>
          <div className="flex gap-3">
            <a href="/admin/users"
              className="rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm text-zinc-300 transition hover:border-violet-500">
              Manage Admins
            </a>
            <button onClick={logout}
              className="rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm text-zinc-300 transition hover:border-violet-500">
              Logout
            </button>
          </div>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
            <p className="text-sm text-zinc-400">Total</p>
            <h2 className="text-3xl font-bold">{counts.total}</h2>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
            <p className="text-sm text-yellow-400">Pending</p>
            <h2 className="text-3xl font-bold">{counts.pending}</h2>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
            <p className="text-sm text-green-400">Approved</p>
            <h2 className="text-3xl font-bold">{counts.approved}</h2>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
            <p className="text-sm text-red-400">Rejected</p>
            <h2 className="text-3xl font-bold">{counts.rejected}</h2>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-3">
          {(["all", "pending", "approved", "rejected"] as const).map((value) => (
            <button key={value} onClick={() => setFilter(value)}
              className={`rounded-full px-4 py-2 text-sm transition ${
                filter === value
                  ? "bg-violet-600 text-white"
                  : "border border-zinc-700 bg-zinc-950 text-zinc-300 hover:border-violet-500"
              }`}>
              {value}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-300">{error}</div>
        )}

        {loading ? (
          <p className="text-zinc-400">Loading submissions...</p>
        ) : visibleItems.length === 0 ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8 text-zinc-400">No submissions found.</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {visibleItems.map((item) => (
              <div key={item.id} className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold">{item.title}</h2>
                    <p className="mt-1 text-sm text-zinc-400">
                      {item.subject} • {item.board || "CBSE"} • Class {item.classLevel} • {item.section}
                    </p>
                    <p className="mt-1 text-sm text-zinc-500">{item.author ? `By ${item.author}` : "Anonymous"}</p>
                    <p className="mt-1 text-xs text-zinc-600">{formatDate(item.createdAt)}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs ${
                    item.status === "approved" ? "bg-green-500/15 text-green-400" :
                    item.status === "rejected" ? "bg-red-500/15 text-red-400" :
                    "bg-yellow-500/15 text-yellow-400"
                  }`}>{item.status}</span>
                </div>

                <p className="mt-4 text-sm text-zinc-300">{item.description || "No description provided."}</p>

                <a href={item.fileUrl} target="_blank" rel="noreferrer"
                  className="mt-4 inline-block rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition hover:border-violet-500">
                  Open File
                </a>

                <div className="mt-5">
                  {item.status === "pending" ? (
                    <div className="flex gap-3">
                      <button onClick={() => updateStatus(item.id, "approved")}
                        className="rounded-xl bg-green-600 px-4 py-2 text-sm font-medium transition hover:bg-green-500">
                        Approve
                      </button>
                      <button onClick={() => updateStatus(item.id, "rejected")}
                        className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium transition hover:bg-red-500">
                        Reject
                      </button>
                    </div>
                  ) : item.status === "approved" ? (
                    <div className="rounded-xl bg-green-500/10 px-4 py-2 text-sm text-green-400">
                      ✓ Approved{item.approvedBy ? ` by ${item.approvedBy}` : ""}
                    </div>
                  ) : (
                    <div className="rounded-xl bg-red-500/10 px-4 py-2 text-sm text-red-400">
                      ✕ Rejected{item.rejectedBy ? ` by ${item.rejectedBy}` : ""}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
