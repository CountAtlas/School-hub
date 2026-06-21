import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";

type AdminUser = {
  id: string;
  name: string;
  createdAt: string;
};

export default function AdminUsersPage() {
  const [, navigate] = useLocation();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentName, setCurrentName] = useState<string | null>(null);

  const [newName, setNewName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");

  async function loadAdmins() {
    setLoading(true);
    setError("");
    const [meRes, usersRes] = await Promise.all([
      fetch("/api/admin/me", { credentials: "include" }),
      fetch("/api/admin/users", { credentials: "include" }),
    ]);
    if (usersRes.status === 401) { navigate("/admin/login"); return; }
    const meData = await meRes.json().catch(() => null);
    const usersData = await usersRes.json().catch(() => ({ admins: [] }));
    setCurrentName(meData?.name ?? null);
    setAdmins(usersData.admins ?? []);
    setLoading(false);
  }

  useEffect(() => { loadAdmins(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setCreateError("");
    setCreateSuccess("");
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, password: newPassword }),
      credentials: "include",
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      setCreateError(data?.error || "Failed to create admin.");
    } else {
      setNewName("");
      setNewPassword("");
      setCreateSuccess(`Admin "${data.admin.name}" created.`);
      await loadAdmins();
    }
    setCreating(false);
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete admin "${name}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      setError(data?.error || "Delete failed.");
    } else {
      await loadAdmins();
    }
  }

  function formatDate(value: string) {
    return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(value));
  }

  const inputCls = "w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-violet-500";

  return (
    <main className="min-h-screen px-6 py-10 text-white">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-violet-400">School Hub — Admin</p>
            <h1 className="mt-3 text-3xl font-bold md:text-5xl">Manage Admins</h1>
            <p className="mt-3 text-zinc-400">Add or remove admin accounts. Each account has its own password.</p>
          </div>
          <Link href="/admin/submissions"
            className="rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm text-zinc-300 transition hover:border-violet-500">
            ← Submissions
          </Link>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">{error}</div>
        )}

        {/* Current admins */}
        <section className="mb-10">
          <h2 className="mb-4 text-xl font-semibold">Current Admins</h2>
          {loading ? (
            <p className="text-zinc-500">Loading...</p>
          ) : admins.length === 0 ? (
            <p className="text-zinc-500">No admins found.</p>
          ) : (
            <div className="space-y-3">
              {admins.map((admin) => (
                <div key={admin.id}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-md">
                  <div>
                    <p className="font-medium">
                      {admin.name}
                      {admin.name === currentName && (
                        <span className="ml-2 rounded-full bg-violet-500/15 px-2 py-0.5 text-xs text-violet-400">you</span>
                      )}
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-500">Added {formatDate(admin.createdAt)}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(admin.id, admin.name)}
                    disabled={admin.name === currentName}
                    className="rounded-xl bg-red-600/20 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-600/40 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Add admin form */}
        <section>
          <h2 className="mb-4 text-xl font-semibold">Add New Admin</h2>
          <form onSubmit={handleCreate} className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-zinc-400">Name / Username *</label>
                <input required value={newName} onChange={(e) => setNewName(e.target.value)}
                  className={inputCls} placeholder="Priya" maxLength={40} />
              </div>
              <div>
                <label className="mb-2 block text-sm text-zinc-400">Password *</label>
                <input required type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                  className={inputCls} placeholder="At least 6 characters" minLength={6} />
              </div>
            </div>
            <button type="submit" disabled={creating}
              className="rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-medium transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60">
              {creating ? "Creating..." : "Create Admin"}
            </button>
            {createError && <p className="text-sm text-red-400">{createError}</p>}
            {createSuccess && <p className="text-sm text-green-400">✓ {createSuccess}</p>}
          </form>
        </section>
      </div>
    </main>
  );
}
