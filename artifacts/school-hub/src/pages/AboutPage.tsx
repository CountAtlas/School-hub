import { Link } from "wouter";
import { useGetStats, useGetApprovedSubmissions } from "@workspace/api-client-react";
import { practicals } from "../data/practicals";

const FEATURES = [
  {
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    title: "Notes & Resources",
    desc: "Revision notes, sample papers, question banks — uploaded by students and reviewed before going live.",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    title: "CS Practicals",
    desc: "Python programs with aim, algorithm, code, expected output, common errors, and full viva Q&A.",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Admin Review",
    desc: "Every submission is reviewed before it's published — keeping the library clean and accurate.",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    title: "Instant Search",
    desc: "Filter by subject, author, or keyword across all notes and resources in seconds.",
  },
];

const SUBJECTS = [
  "Computer Science",
  "Accounts",
  "Mathematics",
  "Physics",
  "Chemistry",
  "English",
];

export default function AboutPage() {
  const { data: statsData } = useGetStats();
  const { data: approvedData } = useGetApprovedSubmissions();

  const approved = approvedData?.submissions ?? [];
  const totalViews = approved.reduce((s, i) => s + (i.views ?? 0), 0)
    + practicals.reduce((s, p) => s + p.views, 0);

  const stats = [
    { value: statsData?.notesCount ?? 0, label: "Notes" },
    { value: statsData?.resourcesCount ?? 0, label: "Resources" },
    { value: practicals.length, label: "Practicals" },
    { value: statsData?.contributors ?? 0, label: "Contributors" },
    { value: statsData?.subjectsCount ?? 0, label: "Subjects" },
    { value: totalViews, label: "Total Views" },
  ];

  return (
    <main className="min-h-screen text-white">
      {/* Hero */}
      <section className="relative overflow-hidden px-6 py-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(124,58,237,0.18),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(124,58,237,0.10),transparent_55%)]" />
        <div className="relative mx-auto max-w-5xl">
          <p className="text-sm uppercase tracking-[0.4em] text-violet-400">About School Hub</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight md:text-6xl">
            Built by students,{" "}
            <span className="bg-gradient-to-r from-violet-400 to-purple-300 bg-clip-text text-transparent">
              for students.
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400">
            School Hub is a student-built archive for Class 11 &amp; 12 notes, CS practicals, and study resources.
            Everything is reviewed before it goes live. No clutter — just content.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/notes"
              className="rounded-2xl bg-violet-600 px-6 py-3 font-medium transition hover:bg-violet-500">
              Browse Notes
            </Link>
            <Link href="/submit"
              className="rounded-2xl border border-zinc-700 px-6 py-3 font-medium transition hover:border-violet-500">
              Contribute
            </Link>
          </div>
        </div>
      </section>

      {/* Stats grid */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {stats.map((s) => (
              <div key={s.label}
                className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center backdrop-blur-md">
                <p className="text-3xl font-bold">{s.value}</p>
                <p className="mt-1 text-xs text-zinc-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What we offer */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-3 text-3xl font-bold">What School Hub offers</h2>
          <p className="mb-10 text-zinc-400">Everything you need, nothing you don't.</p>
          <div className="grid gap-5 md:grid-cols-2">
            {FEATURES.map((f) => (
              <div key={f.title}
                className="flex gap-5 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition-all duration-300 hover:border-violet-500/40 hover:bg-violet-500/5">
                <div className="mt-0.5 flex-shrink-0 rounded-xl bg-violet-500/15 p-3 text-violet-400">
                  {f.icon}
                </div>
                <div>
                  <h3 className="font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Subjects */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-3 text-3xl font-bold">Subjects covered</h2>
          <p className="mb-10 text-zinc-400">Content spans Class 11 &amp; 12 across boards.</p>
          <div className="flex flex-wrap gap-3">
            {SUBJECTS.map((s) => (
              <Link key={s} href={`/notes?subject=${encodeURIComponent(s)}`}
                className="rounded-full border border-zinc-700 px-5 py-2 text-sm text-zinc-300 transition hover:border-violet-500 hover:text-violet-300">
                {s}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-3 text-3xl font-bold">How it works</h2>
          <p className="mb-10 text-zinc-400">Three steps from upload to live.</p>
          <div className="grid gap-5 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Submit",
                desc: "Upload your PDF notes or resource file with a title, subject, and class. Author name is optional.",
              },
              {
                step: "02",
                title: "Review",
                desc: "Every submission is checked by an admin for quality and accuracy before it's approved.",
              },
              {
                step: "03",
                title: "Live",
                desc: "Approved files appear on the Notes or Resources page, searchable by subject and author.",
              },
            ].map((item) => (
              <div key={item.step}
                className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
                <span className="text-4xl font-black text-violet-500/40">{item.step}</span>
                <h3 className="mt-3 text-xl font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-5xl">
          <div className="relative overflow-hidden rounded-3xl border border-violet-500/20 bg-violet-500/5 p-6 text-center backdrop-blur-md md:p-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.12),transparent_70%)]" />
            <div className="relative">
              <h2 className="text-4xl font-bold">Have notes to share?</h2>
              <p className="mx-auto mt-4 max-w-xl text-zinc-400">
                Help other students study smarter. Upload your notes and they'll be live after a quick review.
              </p>
              <Link href="/submit"
                className="mt-8 inline-block rounded-2xl bg-violet-600 px-8 py-3 font-medium transition hover:bg-violet-500">
                Submit Notes
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
