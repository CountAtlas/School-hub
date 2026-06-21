import { Link } from "wouter";
import { useGetStats, useGetApprovedSubmissions } from "@workspace/api-client-react";

export default function HomePage() {
  const { data: statsData } = useGetStats();
  const { data: approvedData } = useGetApprovedSubmissions();

  const approved = approvedData?.submissions ?? [];
  const stats = statsData;

  const subjects = Array.from(
    new Set(approved.map((item) => item.subject?.trim()).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b)) as string[];

  const latestUploads = [...approved]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  const authorMap = approved.reduce(
    (map, item) => {
      const name = item.author?.trim();
      if (!name) return map;
      const current = map.get(name) ?? { name, uploads: 0 };
      current.uploads += 1;
      map.set(name, current);
      return map;
    },
    new Map<string, { name: string; uploads: number }>()
  );

  const popularAuthors = Array.from(authorMap.values())
    .sort((a, b) => b.uploads - a.uploads)
    .slice(0, 3);

  return (
    <main className="min-h-screen text-white">
      <section className="relative overflow-hidden px-6 py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.20),transparent_50%)]" />
        <div className="relative mx-auto max-w-6xl">
          <p className="mb-4 text-sm uppercase tracking-[0.4em] text-violet-400">
            School Hub
          </p>
          <h1 className="max-w-4xl text-4xl font-black leading-tight md:text-6xl">
            Knowledge should be shared,
            <span className="text-violet-400"> not hidden.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-zinc-400">
            Notes, practicals, projects, and study resources collected by students for students.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/notes"
              className="rounded-2xl bg-violet-600 px-6 py-3 font-medium transition hover:bg-violet-500"
            >
              Browse Notes
            </Link>
            <Link
              href="/practicals"
              className="rounded-2xl border border-zinc-700 px-6 py-3 font-medium transition hover:border-violet-500"
            >
              Practicals
            </Link>
            <Link
              href="/submit"
              className="rounded-2xl border border-zinc-700 px-6 py-3 font-medium transition hover:border-violet-500"
            >
              Submit Notes
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
            <h2 className="text-3xl font-bold">{stats?.approvedCount ?? 0}</h2>
            <p className="mt-1 text-sm text-zinc-400">Approved Files</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
            <h2 className="text-3xl font-bold">{stats?.contributors ?? 0}</h2>
            <p className="mt-1 text-sm text-zinc-400">Contributors</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
            <h2 className="text-3xl font-bold">{stats?.subjectsCount ?? 0}</h2>
            <p className="mt-1 text-sm text-zinc-400">Subjects</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
            <h2 className="text-3xl font-bold">{stats?.pendingCount ?? 0}</h2>
            <p className="mt-1 text-sm text-zinc-400">Pending Review</p>
          </div>
        </div>

        <div className="mx-auto mt-6 grid max-w-6xl gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
            <h2 className="text-3xl font-bold">{stats?.notesCount ?? 0}</h2>
            <p className="mt-1 text-sm text-zinc-400">Notes</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
            <h2 className="text-3xl font-bold">{stats?.practicalsCount ?? 0}</h2>
            <p className="mt-1 text-sm text-zinc-400">Practicals</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
            <h2 className="text-3xl font-bold">{stats?.resourcesCount ?? 0}</h2>
            <p className="mt-1 text-sm text-zinc-400">Resources</p>
          </div>
        </div>

        <div className="mx-auto mt-10 grid max-w-6xl gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md md:col-span-2">
            <h2 className="text-2xl font-semibold">Popular Authors</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {popularAuthors.length > 0 ? (
                popularAuthors.map((author) => (
                  <div key={author.name} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                    <h3 className="text-lg font-semibold">{author.name}</h3>
                    <p className="mt-1 text-sm text-zinc-400">{author.uploads} uploads</p>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-zinc-400 md:col-span-3">
                  No approved contributors yet.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
            <h2 className="text-2xl font-semibold">Latest Uploads</h2>
            <p className="mt-1 text-sm text-zinc-400">Most recent approved content.</p>
            <div className="mt-5 space-y-3">
              {latestUploads.length > 0 ? (
                latestUploads.slice(0, 3).map((item) => (
                  <a
                    key={item.id}
                    href={item.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-2xl border border-zinc-800 bg-zinc-950 p-4 transition hover:border-violet-500"
                  >
                    <p className="text-xs uppercase tracking-[0.25em] text-violet-400">{item.section}</p>
                    <h3 className="mt-2 text-base font-semibold">{item.title}</h3>
                    <p className="mt-1 text-sm text-zinc-400">{item.author || "Anonymous"}</p>
                  </a>
                ))
              ) : (
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-zinc-400">
                  No approved uploads yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10">
            <h2 className="text-3xl font-bold">Featured Uploads</h2>
            <p className="mt-3 text-zinc-400">Approved study material from the community.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {latestUploads.length > 3 ? (
              latestUploads.slice(3, 6).map((item) => (
                <a
                  key={item.id}
                  href={item.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:border-violet-500 hover:bg-violet-500/5 hover:shadow-[0_0_30px_rgba(139,92,246,0.30)]"
                >
                  <h3 className="text-xl font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm text-zinc-400">By {item.author || "Anonymous"}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-violet-500/15 px-3 py-1 text-xs text-violet-300">{item.subject}</span>
                    <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-300">{item.section}</span>
                  </div>
                </a>
              ))
            ) : (
              <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8 text-zinc-400">
                No featured content yet.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-10 text-3xl font-bold">Subjects</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {subjects.length > 0 ? (
              subjects.map((subject) => (
                <Link
                  key={subject}
                  href={`/notes?subject=${encodeURIComponent(subject)}`}
                  className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:border-violet-500 hover:bg-violet-500/5 hover:shadow-[0_0_25px_rgba(139,92,246,0.25)]"
                >
                  <h3 className="font-medium">{subject}</h3>
                </Link>
              ))
            ) : (
              <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8 text-zinc-400 md:col-span-4">
                No subjects yet.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="mx-auto max-w-4xl rounded-3xl border border-violet-500/20 bg-violet-500/5 p-8 text-center backdrop-blur-md">
          <h2 className="text-3xl font-bold">Have Notes To Share?</h2>
          <p className="mt-4 text-zinc-400">Help other students learn faster by contributing your notes.</p>
          <Link
            href="/submit"
            className="mt-6 inline-block rounded-2xl bg-violet-600 px-6 py-3 font-medium transition hover:bg-violet-500"
          >
            Submit Notes
          </Link>
        </div>
      </section>
    </main>
  );
}
