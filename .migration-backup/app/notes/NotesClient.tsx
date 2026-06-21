"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";

const PDFPreview = dynamic(() => import("../components/PDFPreview"), {
  ssr: false,
});

type Note = {
  id: string;
  title: string;
  author: string;
  subject: string;
  classLevel: string;
  board: string;
  pdf: string;
  tags: string[];
  views: number;
  downloads: number;
  featured?: boolean;
};

async function trackMetric(
  id: string,
  metric: "views" | "downloads"
): Promise<void> {
  const url = `/api/submissions/${encodeURIComponent(id)}/engagement`;
  const payload = JSON.stringify({ metric });

  try {
    if (typeof window !== "undefined") {
      const key = `${metric}-${id}`;
      if (localStorage.getItem(key)) return;
      localStorage.setItem(key, "1");
    }
  } catch {
    // Ignore storage failures.
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: payload,
      credentials: "same-origin",
      keepalive: true,
    });

    if (!res.ok) {
      return;
    }
  } catch {
    // Fail open: never block the user action.
  }
}

export default function NotesClient({
  notes,
}: {
  notes: Note[];
}) {
  const [query, setQuery] = useState("");
  const [activeSubject, setActiveSubject] = useState("All");
  const [activeAuthor, setActiveAuthor] = useState("All");
  const [actionError, setActionError] = useState("");

  const subjects = useMemo(() => {
    return [
      "All",
      ...Array.from(new Set(notes.map((note) => note.subject))),
    ];
  }, [notes]);

  const authors = useMemo(() => {
    return [
      "All",
      ...Array.from(new Set(notes.map((note) => note.author))),
    ];
  }, [notes]);

  const filteredNotes = useMemo(() => {
    const search = query.toLowerCase().trim();

    return notes.filter((note) => {
      const matchesSearch =
        search === "" ||
        note.title.toLowerCase().includes(search) ||
        note.subject.toLowerCase().includes(search) ||
        note.author.toLowerCase().includes(search) ||
        note.tags.some((tag) => tag.toLowerCase().includes(search));

      const matchesSubject =
        activeSubject === "All" || note.subject === activeSubject;

      const matchesAuthor =
        activeAuthor === "All" || note.author === activeAuthor;

      return matchesSearch && matchesSubject && matchesAuthor;
    });
  }, [notes, query, activeSubject, activeAuthor]);

  async function openPdf(note: Note) {
    setActionError("");

    try {
      await trackMetric(note.id, "views");
    } catch {
      // Keep going even if tracking fails.
    }

    try {
      window.location.assign(note.pdf);
    } catch {
      setActionError("Could not open the file.");
    }
  }

  async function downloadPdf(note: Note) {
    setActionError("");

    try {
      await trackMetric(note.id, "downloads");
    } catch {
      // Keep going even if tracking fails.
    }

    try {
      const link = document.createElement("a");
      link.href = note.pdf;
      link.download = note.pdf.split("/").pop() || "download.pdf";
      link.rel = "noreferrer noopener";
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      setActionError("Could not start the download.");
    }
  }

  return (
    <main className="min-h-screen px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10">
          <p className="text-sm uppercase tracking-[0.4em] text-violet-400">
            School Hub
          </p>

          <h1 className="mt-3 text-5xl font-bold">Notes</h1>

          <p className="mt-3 text-zinc-400">
            Study material, revision notes, and practical PDFs in one place.
          </p>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <input
            type="text"
            placeholder="Search notes, authors, subjects, or tags..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 outline-none focus:border-violet-500"
          />

          <select
            value={activeSubject}
            onChange={(e) => setActiveSubject(e.target.value)}
            className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 outline-none focus:border-violet-500"
          >
            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>

          <select
            value={activeAuthor}
            onChange={(e) => setActiveAuthor(e.target.value)}
            className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 outline-none focus:border-violet-500"
          >
            {authors.map((author) => (
              <option key={author} value={author}>
                {author}
              </option>
            ))}
          </select>
        </div>

        {actionError && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {actionError}
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-6">
          {filteredNotes.length > 0 ? (
            filteredNotes.map((note) => (
              <article
                key={note.id}
                className="
                  group block w-[300px]
                  min-h-[24rem]
                  overflow-hidden
                  rounded-3xl
                  border
                  border-white/10
                  bg-white/5
                  p-4
                  backdrop-blur-md
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:scale-[1.02]
                  hover:border-violet-500
                  hover:bg-violet-500/5
                  hover:shadow-[0_0_30px_rgba(139,92,246,0.30)]
                "
              >
                <div className="flex h-full flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-semibold text-white">
                        {note.title}
                      </h2>

                      <p className="mt-1 text-sm text-zinc-400">
                        By {note.author}
                      </p>
                    </div>

                    {note.featured && (
                      <span className="rounded-full bg-yellow-500/15 px-3 py-1 text-xs text-yellow-400">
                        Featured
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex justify-center overflow-hidden rounded-2xl border border-white/10 bg-black/30">
                    <PDFPreview file={note.pdf} />
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-violet-500/15 px-3 py-1 text-[10px] text-violet-300">
                      {note.subject}
                    </span>

                    <span className="rounded-full border border-zinc-700 px-2 py-1 text-[10px] text-zinc-300">
                      Class {note.classLevel}
                    </span>

                    <span className="rounded-full border border-zinc-700 px-2 py-1 text-[10px] text-zinc-300">
                      {note.board}
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-2">
                    {note.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-zinc-700 px-2 py-1 text-[10px] text-zinc-300"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="mt-auto pt-3">
                    <div className="flex items-center justify-between text-xs text-zinc-500">
                      <span>{note.views} views</span>
                      <span>{note.downloads} downloads</span>
                    </div>

                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => openPdf(note)}
                        className="flex-1 rounded-xl border border-violet-500/30 bg-violet-500/10 px-3 py-2 text-xs text-violet-300 transition hover:bg-violet-500/20"
                      >
                        View PDF
                      </button>

                      <button
                        type="button"
                        onClick={() => downloadPdf(note)}
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
              No notes found.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}