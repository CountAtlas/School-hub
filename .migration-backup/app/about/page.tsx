import Link from "next/link";
import { notes } from "../data/notes";
import { practicals } from "../data/practicals";

export default function AboutPage() {
  const contributors = new Set(notes.map((note) => note.author)).size;
  const totalDownloads =
    notes.reduce((sum, note) => sum + note.downloads, 0) +
    practicals.reduce((sum, practical) => sum + practical.downloads, 0);

  return (
    <main className="min-h-screen px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12">
          <p className="text-sm uppercase tracking-[0.4em] text-violet-400">
            School Hub
          </p>
          <h1 className="mt-3 text-5xl font-bold">About</h1>
          <p className="mt-4 max-w-3xl text-zinc-400">
            School Hub is a dark, student-built notes library for practicals,
            study material, and quick revision. It is made for students who want
            everything in one place.
          </p>
        </div>

        <section className="grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
            <h2 className="text-4xl font-bold">{notes.length}</h2>
            <p className="mt-2 text-zinc-400">Notes</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
            <h2 className="text-4xl font-bold">{practicals.length}</h2>
            <p className="mt-2 text-zinc-400">Practicals</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
            <h2 className="text-4xl font-bold">{contributors}</h2>
            <p className="mt-2 text-zinc-400">Contributors</p>
          </div>
        </section>

        <section className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
            <h2 className="text-2xl font-semibold">What this site does</h2>
            <ul className="mt-4 space-y-3 text-zinc-300">
              <li>• Stores notes in one place</li>
              <li>• Shows CS practicals with code, output, and viva</li>
              <li>• Lets students find material by subject or author</li>
              <li>• Keeps the interface clean, dark, and fast</li>
            </ul>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
            <h2 className="text-2xl font-semibold">Why it exists</h2>
            <p className="mt-4 text-zinc-300 leading-7">
              Many school resources are scattered across chats, photos, and
              random folders. School Hub is a simple archive for notes and
              practicals so students can find what they need without digging
              through everything manually.
            </p>
          </div>
        </section>

        <section className="mt-10 rounded-3xl border border-violet-500/20 bg-violet-500/5 p-8 backdrop-blur-md">
          <h2 className="text-2xl font-semibold">Built for students</h2>
          <p className="mt-4 max-w-3xl text-zinc-300 leading-7">
            The project is designed around school use: practical programs,
            revision notes, viva preparation, and quick access to resources.
            It keeps the focus on content instead of clutter.
          </p>

          <div className="mt-6 flex flex-wrap gap-4">
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
              View Practicals
            </Link>
          </div>
        </section>

        <section className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
            <h2 className="text-2xl font-semibold">Current focus</h2>
            <p className="mt-4 text-zinc-300 leading-7">
              The site is currently focused on Class 11 material, especially
              Computer Science notes and practicals. More subjects can be added
              as the library grows.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
            <h2 className="text-2xl font-semibold">Usage stats</h2>
            <p className="mt-4 text-zinc-300 leading-7">
              Total downloads across notes and practicals:{" "}
              <span className="text-violet-400 font-semibold">
                {totalDownloads}
              </span>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}