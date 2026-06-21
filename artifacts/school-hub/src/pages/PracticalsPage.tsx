import { useMemo, useState } from "react";
import { Link } from "wouter";
import { useGetApprovedSubmissions } from "@workspace/api-client-react";

function parseTags(tags: string | null | undefined): string[] {
  if (!tags) return [];
  return tags.split(",").map((t) => t.trim()).filter(Boolean);
}

export default function PracticalsPage() {
  const [query, setQuery] = useState("");
  const { data, isLoading } = useGetApprovedSubmissions({ section: "practicals" });
  const practicals = data?.submissions ?? [];

  const filtered = useMemo(() => {
    const s = query.toLowerCase().trim();
    if (!s) return practicals;
    return practicals.filter((p) => {
      const tags = parseTags(p.tags);
      return (
        p.title.toLowerCase().includes(s) ||
        (p.author ?? "").toLowerCase().includes(s) ||
        tags.some((t) => t.toLowerCase().includes(s))
      );
    });
  }, [query, practicals]);

  return (
    <main className="min-h-screen px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10">
          <p className="text-sm uppercase tracking-[0.4em] text-violet-400">School Hub</p>
          <h1 className="mt-3 text-3xl font-bold md:text-5xl">Practicals</h1>
          <p className="mt-3 text-zinc-400">Python practical programs, outputs and viva questions.</p>
        </div>

        <div className="mb-8">
          <input
            type="text"
            placeholder="Search practicals..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 outline-none focus:border-violet-500"
          />
        </div>

        {isLoading && (
          <div className="flex justify-center py-20 text-zinc-500">Loading practicals...</div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
            <p className="text-lg">{query ? "No practicals match your search." : "No practicals yet."}</p>
            {!query && (
              <Link href="/submit" className="mt-4 text-sm text-violet-400 hover:underline">
                Be the first to submit a practical →
              </Link>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((practical) => {
            const tags = parseTags(practical.tags);
            const codePreview = (practical.code ?? "").split("\n").slice(0, 5).join("\n");
            return (
              <Link key={practical.id} href={`/practicals/${practical.id}`} className="group block w-full">
                <article className="min-h-[24rem] w-full overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:border-violet-500 hover:bg-violet-500/5 hover:shadow-[0_0_30px_rgba(139,92,246,0.30)]">
                  <div className="flex items-start justify-between">
                    <div>
                      {practical.practicalNo && (
                        <p className="text-xs uppercase text-violet-400">Program {practical.practicalNo}</p>
                      )}
                      <h2 className="mt-1 text-xl font-semibold">{practical.title}</h2>
                      {practical.author && (
                        <p className="mt-1 text-sm text-zinc-400">By {practical.author}</p>
                      )}
                    </div>
                  </div>

                  {codePreview && (
                    <pre className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black/60 p-4 text-xs text-green-400">
                      {codePreview}
                    </pre>
                  )}

                  {tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <span key={tag} className="rounded-full border border-zinc-700 px-2 py-1 text-[10px] text-zinc-300">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 flex items-center text-xs text-zinc-500">
                    <span>{practical.views ?? 0} views</span>
                  </div>

                  <p className="mt-4 text-sm text-violet-400">Open Practical →</p>
                </article>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
