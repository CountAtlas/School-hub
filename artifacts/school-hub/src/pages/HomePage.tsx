import { useState, useMemo } from "react";
import { Link } from "wouter";
import {
  useGetStats,
  useGetApprovedSubmissions,
  useGetDailyUpdates,
  useGetExams,
  useGetAnnouncements,
  useCreateDailyUpdate,
  useVerifyDailyUpdate,
  useCreateExam,
  useCreateAnnouncement,
} from "@workspace/api-client-react";
import { useUserProfile, type UserProfileData } from "../contexts/UserProfile";

// ─── Utilities ───────────────────────────────────────────────
function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

function formatDateFull(d: Date) {
  return d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function countdown(dateStr: string): string {
  const diff = new Date(dateStr).getTime() - Date.now();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days < 0) return "Past";
  if (days === 0) return "Today!";
  if (days === 1) return "Tomorrow";
  return `${days} days away`;
}

function announcementIcon(type: string) {
  switch (type) {
    case "holiday": return "🎉";
    case "schedule-change": return "📅";
    case "practical-reminder": return "💻";
    case "event": return "⭐";
    default: return "📢";
  }
}

function announcementColor(type: string) {
  switch (type) {
    case "holiday": return "bg-green-500/10 border-green-500/30 text-green-400";
    case "schedule-change": return "bg-yellow-500/10 border-yellow-500/30 text-yellow-400";
    case "practical-reminder": return "bg-blue-500/10 border-blue-500/30 text-blue-400";
    case "event": return "bg-violet-500/10 border-violet-500/30 text-violet-400";
    default: return "bg-zinc-500/10 border-zinc-500/30 text-zinc-400";
  }
}

// ─── Profile Setup ────────────────────────────────────────────
function ProfileSetup({ onSave }: { onSave: (p: UserProfileData) => void }) {
  const [name, setName] = useState("");
  const [board, setBoard] = useState("");
  const [classLevel, setClassLevel] = useState("");
  const [stream, setStream] = useState("");
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <div className="rounded-2xl border border-accent/30 bg-accent/5 px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm font-medium text-foreground">Set up your profile for personalised content</p>
          <p className="text-xs text-muted mt-0.5">Filter content by your board, class & stream</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-hover"
        >
          Set Up Profile
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-accent/30 bg-accent/5 p-5">
      <h3 className="font-semibold text-foreground mb-4">Your Profile</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs text-muted">Your Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Arjun Sharma"
            className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-accent" />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted">Board</label>
          <select value={board} onChange={(e) => setBoard(e.target.value)}
            className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-accent">
            <option value="">Select Board</option>
            {["CBSE", "ICSE", "ISC", "State Board", "Other"].map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted">Class</label>
          <select value={classLevel} onChange={(e) => setClassLevel(e.target.value)}
            className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-accent">
            <option value="">Select Class</option>
            {["9", "10", "11", "12"].map((c) => (
              <option key={c} value={c}>Class {c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted">Stream</label>
          <select value={stream} onChange={(e) => setStream(e.target.value)}
            className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-accent">
            <option value="">Select Stream</option>
            {["Science", "Commerce", "Humanities"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="mt-4 flex gap-3">
        <button
          onClick={() => { onSave({ name, board, classLevel, stream }); setOpen(false); }}
          className="rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-hover"
        >
          Save Profile
        </button>
        <button onClick={() => setOpen(false)} className="rounded-xl border border-border px-4 py-2 text-sm text-muted transition hover:text-foreground">
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── Add Daily Update Form ────────────────────────────────────
function AddDailyUpdateForm({ defaultName, onCreated }: { defaultName: string; onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [teacher, setTeacher] = useState("");
  const [portion, setPortion] = useState("");
  const [homework, setHomework] = useState("");
  const [practical, setPractical] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const [postedBy, setPostedBy] = useState(defaultName);
  const [error, setError] = useState("");
  const createUpdate = useCreateDailyUpdate();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim() || !postedBy.trim()) { setError("Subject and your name are required."); return; }
    setError("");
    createUpdate.mutate(
      { data: { subject, teacher, portionCovered: portion, homework, practicalWork: practical, announcement, postedBy } },
      { onSuccess: () => { setOpen(false); setSubject(""); setTeacher(""); setPortion(""); setHomework(""); setPractical(""); setAnnouncement(""); onCreated(); },
        onError: () => setError("Failed to post update.") }
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-2 rounded-xl border border-dashed border-border px-4 py-3 text-sm text-muted transition hover:border-accent hover:text-accent"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Post today's class update
      </button>
    );
  }

  const inp = "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent placeholder:text-muted";

  return (
    <form onSubmit={submit} className="rounded-2xl border border-accent/20 bg-accent/5 p-4 space-y-3">
      <h4 className="text-sm font-semibold text-foreground">Post Class Update</h4>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs text-muted">Subject *</label>
          <input required value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Computer Science" className={inp} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted">Teacher Name</label>
          <input value={teacher} onChange={(e) => setTeacher(e.target.value)} placeholder="Mrs. Sharma" className={inp} />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs text-muted">Portion Covered Today</label>
        <input value={portion} onChange={(e) => setPortion(e.target.value)} placeholder="Chapter 3 — Arrays, loops revision" className={inp} />
      </div>
      <div>
        <label className="mb-1 block text-xs text-muted">Homework</label>
        <input value={homework} onChange={(e) => setHomework(e.target.value)} placeholder="Ex 3.2 Q1–Q5, due tomorrow" className={inp} />
      </div>
      <div>
        <label className="mb-1 block text-xs text-muted">Practical Work</label>
        <input value={practical} onChange={(e) => setPractical(e.target.value)} placeholder="Practical 7 — bubble sort" className={inp} />
      </div>
      <div>
        <label className="mb-1 block text-xs text-muted">Announcement</label>
        <input value={announcement} onChange={(e) => setAnnouncement(e.target.value)} placeholder="Test next Friday!" className={inp} />
      </div>
      <div>
        <label className="mb-1 block text-xs text-muted">Your Name *</label>
        <input required value={postedBy} onChange={(e) => setPostedBy(e.target.value)} placeholder="Your name" className={inp} />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={createUpdate.isPending}
          className="rounded-xl bg-accent px-4 py-2 text-xs font-medium text-white transition hover:bg-accent-hover disabled:opacity-60">
          {createUpdate.isPending ? "Posting..." : "Post Update"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-xl border border-border px-4 py-2 text-xs text-muted transition hover:text-foreground">
          Cancel
        </button>
      </div>
    </form>
  );
}

// ─── Daily Update Card ────────────────────────────────────────
function DailyUpdateCard({ update, myName, onVerified }: {
  update: {
    id: string; subject: string; teacher?: string | null; portionCovered?: string | null;
    homework?: string | null; practicalWork?: string | null; announcement?: string | null;
    postedBy: string; verifications: string[]; updatedAt: string;
  };
  myName: string;
  onVerified: () => void;
}) {
  const [verifyName, setVerifyName] = useState(myName || "");
  const [showVerify, setShowVerify] = useState(false);
  const verifyMutation = useVerifyDailyUpdate();
  const alreadyVerified = myName ? update.verifications.includes(myName) : false;

  function handleVerify() {
    if (!verifyName.trim()) return;
    verifyMutation.mutate(
      { id: update.id, data: { studentName: verifyName } },
      { onSuccess: onVerified, onError: () => {} }
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4 space-y-3 transition hover:border-accent/40">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-foreground">{update.subject}</h3>
          {update.teacher && <p className="text-xs text-muted mt-0.5">👩‍🏫 {update.teacher}</p>}
        </div>
        <span className="shrink-0 rounded-full bg-accent/10 px-2 py-0.5 text-[10px] text-accent">
          {update.verifications.length > 0
            ? `✔ Verified by ${update.verifications.length}`
            : "⚠ Unverified"}
        </span>
      </div>

      {update.portionCovered && (
        <div className="rounded-xl border border-border bg-surface px-3 py-2">
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted mb-1">Portion Covered</p>
          <p className="text-sm text-foreground">{update.portionCovered}</p>
        </div>
      )}
      {update.homework && (
        <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 px-3 py-2">
          <p className="text-[10px] font-medium uppercase tracking-widest text-yellow-400 mb-1">📝 Homework</p>
          <p className="text-sm text-foreground">{update.homework}</p>
        </div>
      )}
      {update.practicalWork && (
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 px-3 py-2">
          <p className="text-[10px] font-medium uppercase tracking-widest text-blue-400 mb-1">💻 Practical</p>
          <p className="text-sm text-foreground">{update.practicalWork}</p>
        </div>
      )}
      {update.announcement && (
        <div className="rounded-xl border border-accent/20 bg-accent/5 px-3 py-2">
          <p className="text-[10px] font-medium uppercase tracking-widest text-accent mb-1">📢 Announcement</p>
          <p className="text-sm text-foreground">{update.announcement}</p>
        </div>
      )}

      <div className="flex items-center justify-between gap-3 pt-1">
        <p className="text-xs text-muted">Posted by {update.postedBy}</p>
        {alreadyVerified ? (
          <span className="text-xs text-green-400">✔ You verified</span>
        ) : showVerify ? (
          <div className="flex gap-2">
            <input
              value={verifyName}
              onChange={(e) => setVerifyName(e.target.value)}
              placeholder="Your name"
              className="rounded-lg border border-border bg-background px-2 py-1 text-xs text-foreground outline-none focus:border-accent w-28"
            />
            <button
              onClick={handleVerify}
              disabled={verifyMutation.isPending || !verifyName.trim()}
              className="rounded-lg bg-accent px-2 py-1 text-xs text-white disabled:opacity-60"
            >
              {verifyMutation.isPending ? "..." : "Verify"}
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowVerify(true)}
            className="rounded-lg border border-border px-2.5 py-1 text-xs text-muted transition hover:border-accent hover:text-accent"
          >
            Verify
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Add Exam Form ────────────────────────────────────────────
function AddExamForm({ defaultName, onCreated }: { defaultName: string; onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [date, setDate] = useState("");
  const [portion, setPortion] = useState("");
  const [postedBy, setPostedBy] = useState(defaultName);
  const [error, setError] = useState("");
  const createExam = useCreateExam();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim() || !date || !postedBy.trim()) { setError("Subject, date, and your name are required."); return; }
    setError("");
    createExam.mutate(
      { data: { subject, date, portion, postedBy } },
      { onSuccess: () => { setOpen(false); setSubject(""); setDate(""); setPortion(""); onCreated(); },
        onError: () => setError("Failed to add exam.") }
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-2 rounded-xl border border-dashed border-border px-4 py-3 text-sm text-muted transition hover:border-accent hover:text-accent"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add upcoming exam
      </button>
    );
  }

  const inp = "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent placeholder:text-muted";

  return (
    <form onSubmit={submit} className="rounded-2xl border border-accent/20 bg-accent/5 p-4 space-y-3">
      <h4 className="text-sm font-semibold text-foreground">Add Exam</h4>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs text-muted">Subject *</label>
          <input required value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Mathematics" className={inp} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted">Date *</label>
          <input required type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inp} />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs text-muted">Exam Portion / Syllabus</label>
        <input value={portion} onChange={(e) => setPortion(e.target.value)} placeholder="Ch 1–5, Calculus, Vectors" className={inp} />
      </div>
      <div>
        <label className="mb-1 block text-xs text-muted">Your Name *</label>
        <input required value={postedBy} onChange={(e) => setPostedBy(e.target.value)} placeholder="Your name" className={inp} />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={createExam.isPending}
          className="rounded-xl bg-accent px-4 py-2 text-xs font-medium text-white transition hover:bg-accent-hover disabled:opacity-60">
          {createExam.isPending ? "Saving..." : "Add Exam"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-xl border border-border px-4 py-2 text-xs text-muted transition hover:text-foreground">
          Cancel
        </button>
      </div>
    </form>
  );
}

// ─── Add Announcement Form ────────────────────────────────────
function AddAnnouncementForm({ defaultName, onCreated }: { defaultName: string; onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("other");
  const [postedBy, setPostedBy] = useState(defaultName);
  const [error, setError] = useState("");
  const createAnnouncement = useCreateAnnouncement();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !postedBy.trim()) { setError("All fields are required."); return; }
    setError("");
    createAnnouncement.mutate(
      // @ts-ignore – orval wraps in { data }
      { data: { title, content, type, postedBy } },
      { onSuccess: () => { setOpen(false); setTitle(""); setContent(""); setType("other"); onCreated(); },
        onError: () => setError("Failed to post announcement.") }
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-2 rounded-xl border border-dashed border-border px-4 py-3 text-sm text-muted transition hover:border-accent hover:text-accent"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Post announcement
      </button>
    );
  }

  const inp = "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent placeholder:text-muted";

  return (
    <form onSubmit={submit} className="rounded-2xl border border-accent/20 bg-accent/5 p-4 space-y-3">
      <h4 className="text-sm font-semibold text-foreground">Post Announcement</h4>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs text-muted">Title *</label>
          <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="School holiday tomorrow" className={inp} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted">Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)} className={inp}>
            <option value="holiday">🎉 Holiday</option>
            <option value="schedule-change">📅 Schedule Change</option>
            <option value="practical-reminder">💻 Practical Reminder</option>
            <option value="event">⭐ Event</option>
            <option value="other">📢 Other</option>
          </select>
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs text-muted">Details *</label>
        <textarea required value={content} onChange={(e) => setContent(e.target.value)} placeholder="Full details here..."
          className="min-h-20 w-full resize-y rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent placeholder:text-muted" />
      </div>
      <div>
        <label className="mb-1 block text-xs text-muted">Your Name *</label>
        <input required value={postedBy} onChange={(e) => setPostedBy(e.target.value)} placeholder="Your name" className={inp} />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={createAnnouncement.isPending}
          className="rounded-xl bg-accent px-4 py-2 text-xs font-medium text-white transition hover:bg-accent-hover disabled:opacity-60">
          {createAnnouncement.isPending ? "Posting..." : "Post"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-xl border border-border px-4 py-2 text-xs text-muted transition hover:text-foreground">
          Cancel
        </button>
      </div>
    </form>
  );
}

// ─── Section Header ───────────────────────────────────────────
function SectionHeader({ title, count, icon }: { title: string; count?: number; icon: string }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span className="text-xl">{icon}</span>
      <h2 className="text-lg font-bold text-foreground">{title}</h2>
      {count !== undefined && (
        <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">{count}</span>
      )}
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────
function StatCard({ value, label, accent }: { value: number | string; label: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl border p-4 transition ${accent ? "border-accent/30 bg-accent/5" : "border-border bg-card"}`}>
      <p className={`text-2xl font-bold ${accent ? "text-accent" : "text-foreground"}`}>{value}</p>
      <p className="mt-0.5 text-xs text-muted">{label}</p>
    </div>
  );
}

// ─── HomePage ─────────────────────────────────────────────────
export default function HomePage() {
  const { profile, setProfile, hasProfile } = useUserProfile();

  const today = todayDate();

  // API data
  const { data: statsData } = useGetStats();
  const { data: approvedData } = useGetApprovedSubmissions();
  const { data: dailyData, refetch: refetchDaily } = useGetDailyUpdates({ date: today });
  const { data: examsData, refetch: refetchExams } = useGetExams();
  const { data: announcementsData, refetch: refetchAnnouncements } = useGetAnnouncements({ limit: 10 });

  const approved = approvedData?.submissions ?? [];
  const stats = statsData;
  const dailyUpdates = dailyData?.updates ?? [];
  const exams = examsData?.exams ?? [];
  const announcements = announcementsData?.announcements ?? [];

  const recentUploads = useMemo(() =>
    [...approved]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6),
    [approved]
  );

  const myName = profile.name || "";

  return (
    <main className="min-h-screen text-foreground">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden px-6 py-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(124,58,237,0.15),transparent_55%)]" />
        <div className="relative mx-auto max-w-6xl">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm text-muted">{formatDateFull(new Date())}</p>
              <h1 className="mt-1 text-3xl font-black text-foreground md:text-4xl">
                {myName ? `Hey, ${myName.split(" ")[0]} 👋` : "Welcome back 👋"}
              </h1>
              {profile.board && (
                <p className="mt-1 text-sm text-muted">
                  {[profile.board, profile.classLevel && `Class ${profile.classLevel}`, profile.stream].filter(Boolean).join(" · ")}
                </p>
              )}
            </div>
            <div className="mt-3 flex flex-wrap gap-3 sm:mt-0">
              <Link href="/submit" className="rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-hover">
                Upload Resource
              </Link>
              <Link href="/notes" className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-muted transition hover:border-accent hover:text-foreground">
                Browse Notes
              </Link>
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard value={stats?.approvedCount ?? 0} label="Total Files" />
            <StatCard value={stats?.notesCount ?? 0} label="Notes" accent />
            <StatCard value={stats?.practicalsCount ?? 0} label="Practicals" />
            <StatCard value={stats?.contributors ?? 0} label="Contributors" />
          </div>
        </div>
      </section>

      {/* ── Profile setup ── */}
      {!hasProfile && (
        <section className="px-6 pb-6">
          <div className="mx-auto max-w-6xl">
            <ProfileSetup onSave={setProfile} />
          </div>
        </section>
      )}

      {/* ── Quick Actions ── */}
      <section className="px-6 pb-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {[
              { href: "/submit", label: "Upload", icon: "📤" },
              { href: "/notes", label: "Notes", icon: "📚" },
              { href: "/practicals", label: "Practicals", icon: "💻" },
              { href: "/resources", label: "Resources", icon: "📂" },
              { href: "/about", label: "About", icon: "ℹ️" },
              { href: "/submit", label: "Contribute", icon: "✨" },
            ].map((a) => (
              <Link
                key={a.label}
                href={a.href}
                className="flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-card px-3 py-4 text-center transition hover:border-accent/50 hover:bg-surface"
              >
                <span className="text-xl">{a.icon}</span>
                <span className="text-xs font-medium text-muted">{a.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Main dashboard grid ── */}
      <section className="px-6 pb-10">
        <div className="mx-auto max-w-6xl grid gap-8 lg:grid-cols-2">

          {/* Today's Classes */}
          <div>
            <SectionHeader title="Today's Classes" count={dailyUpdates.length} icon="📋" />
            <div className="space-y-3">
              {dailyUpdates.length > 0 ? (
                dailyUpdates.map((u) => (
                  <DailyUpdateCard
                    key={u.id}
                    update={{ ...u, teacher: u.teacher ?? null, portionCovered: u.portionCovered ?? null, homework: u.homework ?? null, practicalWork: u.practicalWork ?? null, announcement: u.announcement ?? null }}
                    myName={myName}
                    onVerified={() => refetchDaily()}
                  />
                ))
              ) : (
                <div className="rounded-2xl border border-border bg-card px-5 py-8 text-center">
                  <p className="text-muted text-sm">No class updates posted today.</p>
                  <p className="text-xs text-muted mt-1">Be the first to share what happened!</p>
                </div>
              )}
              <AddDailyUpdateForm
                defaultName={myName}
                onCreated={() => refetchDaily()}
              />
            </div>
          </div>

          {/* Upcoming Exams */}
          <div>
            <SectionHeader title="Upcoming Exams" count={exams.length} icon="📅" />
            <div className="space-y-3">
              {exams.length > 0 ? (
                exams.slice(0, 5).map((exam) => {
                  const cd = countdown(exam.date);
                  const urgent = exam.date <= new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10);
                  return (
                    <div key={exam.id} className={`rounded-2xl border p-4 transition ${urgent ? "border-red-500/30 bg-red-500/5" : "border-border bg-card"}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-foreground">{exam.subject}</h3>
                          <p className="text-xs text-muted mt-0.5">
                            {new Date(exam.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        </div>
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${urgent ? "bg-red-500/20 text-red-400" : "bg-accent/10 text-accent"}`}>
                          {cd}
                        </span>
                      </div>
                      {exam.portion && (
                        <div className="mt-2 rounded-xl border border-border bg-surface px-3 py-2">
                          <p className="text-xs text-muted">📖 {exam.portion}</p>
                        </div>
                      )}
                      <p className="mt-2 text-[10px] text-muted">Posted by {exam.postedBy}</p>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-2xl border border-border bg-card px-5 py-8 text-center">
                  <p className="text-muted text-sm">No upcoming exams.</p>
                  <p className="text-xs text-muted mt-1">Add one to help the class prepare.</p>
                </div>
              )}
              <AddExamForm defaultName={myName} onCreated={() => refetchExams()} />
            </div>
          </div>

          {/* Announcements */}
          <div>
            <SectionHeader title="Announcements" count={announcements.length} icon="📢" />
            <div className="space-y-3">
              {announcements.length > 0 ? (
                announcements.slice(0, 5).map((a) => (
                  <div key={a.id} className={`rounded-2xl border p-4 ${announcementColor(a.type)}`}>
                    <div className="flex items-start gap-3">
                      <span className="text-lg shrink-0">{announcementIcon(a.type)}</span>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-sm text-foreground truncate">{a.title}</h3>
                        <p className="mt-1 text-xs text-muted leading-relaxed">{a.content}</p>
                        <p className="mt-2 text-[10px] text-muted">
                          {a.postedBy} · {new Date(a.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-border bg-card px-5 py-8 text-center">
                  <p className="text-muted text-sm">No announcements yet.</p>
                </div>
              )}
              <AddAnnouncementForm defaultName={myName} onCreated={() => refetchAnnouncements()} />
            </div>
          </div>

          {/* Recent Uploads */}
          <div>
            <SectionHeader title="Recent Uploads" count={recentUploads.length} icon="📤" />
            <div className="space-y-3">
              {recentUploads.length > 0 ? (
                recentUploads.map((item) => (
                  <a
                    key={item.id}
                    href={item.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 transition hover:border-accent/40 hover:bg-surface"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-lg">
                      {item.section === "notes" ? "📄" : item.section === "practicals" ? "💻" : "📂"}
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-foreground">{item.title}</h3>
                      <p className="mt-0.5 text-xs text-muted">{item.subject} · {item.author || "Anonymous"}</p>
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] text-accent">{item.section}</span>
                        {item.board && <span className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted">{item.board}</span>}
                        <span className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted">Class {item.classLevel}</span>
                      </div>
                    </div>
                    <div className="ml-auto shrink-0 text-right">
                      <p className="text-[10px] text-muted">{item.views ?? 0} views</p>
                      <p className="text-[10px] text-muted">{item.downloads ?? 0} downloads</p>
                    </div>
                  </a>
                ))
              ) : (
                <div className="rounded-2xl border border-border bg-card px-5 py-8 text-center">
                  <p className="text-muted text-sm">No uploads yet.</p>
                  <Link href="/submit" className="mt-2 inline-block text-xs text-accent hover:underline">
                    Be the first to contribute →
                  </Link>
                </div>
              )}
              {approved.length > 6 && (
                <Link href="/notes" className="flex items-center justify-center gap-1.5 rounded-xl border border-border px-4 py-2.5 text-sm text-muted transition hover:border-accent hover:text-accent">
                  View all {approved.length} files →
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-6 pb-16">
        <div className="mx-auto max-w-6xl">
          <div className="relative overflow-hidden rounded-3xl border border-accent/20 bg-accent/5 p-8 text-center">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.10),transparent_70%)]" />
            <div className="relative">
              <h2 className="text-2xl font-bold text-foreground">Have notes to share?</h2>
              <p className="mt-2 text-sm text-muted">Upload your notes or submit a practical — live after a quick review.</p>
              <Link href="/submit" className="mt-5 inline-block rounded-2xl bg-accent px-6 py-2.5 text-sm font-medium text-white transition hover:bg-accent-hover">
                Submit Notes
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
