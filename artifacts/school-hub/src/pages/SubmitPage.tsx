import { useState } from "react";

export default function SubmitPage() {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [board, setBoard] = useState<"CBSE" | "ISC">("CBSE");
  const [classLevel, setClassLevel] = useState<"11" | "12">("11");
  const [section, setSection] = useState<"notes" | "practicals" | "resources">("notes");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!file) { setStatus("Please select a file."); return; }
    setLoading(true);
    setStatus("");
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("subject", subject);
      formData.append("board", board);
      formData.append("classLevel", classLevel);
      formData.append("section", section);
      formData.append("author", author);
      formData.append("description", description);
      formData.append("file", file);

      const res = await fetch("/api/submissions", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Upload failed.");
      setTitle(""); setSubject(""); setBoard("CBSE"); setClassLevel("11");
      setSection("notes"); setAuthor(""); setDescription(""); setFile(null);
      setStatus("Submitted. It is now pending review.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen px-6 py-10 text-white">
      <div className="mx-auto max-w-2xl">
        <p className="text-sm uppercase tracking-[0.4em] text-violet-400">School Hub</p>
        <h1 className="mt-3 text-5xl font-bold">Submit Notes</h1>
        <p className="mt-3 text-zinc-400">Upload notes, practicals, or resources. Author name is optional.</p>

        <form onSubmit={handleSubmit} className="mt-10 space-y-5 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-md">
          <div>
            <label className="mb-2 block text-sm text-zinc-400">Topic Title *</label>
            <input required value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-violet-500"
              placeholder="Python Conditionals" />
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-400">Subject *</label>
            <input required value={subject} onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-violet-500"
              placeholder="Computer Science" />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm text-zinc-400">Board *</label>
              <select value={board} onChange={(e) => setBoard(e.target.value as "CBSE" | "ISC")}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-violet-500">
                <option value="CBSE">CBSE</option>
                <option value="ISC">ISC</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm text-zinc-400">Class *</label>
              <select value={classLevel} onChange={(e) => setClassLevel(e.target.value as "11" | "12")}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-violet-500">
                <option value="11">Class 11</option>
                <option value="12">Class 12</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm text-zinc-400">Section *</label>
              <select value={section} onChange={(e) => setSection(e.target.value as "notes" | "practicals" | "resources")}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-violet-500">
                <option value="notes">Notes</option>
                <option value="practicals">Practicals</option>
                <option value="resources">Resources</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-400">Author Name (Optional)</label>
            <input value={author} onChange={(e) => setAuthor(e.target.value)}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-violet-500"
              placeholder="Leave blank for privacy" />
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-400">Description (Optional)</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              className="min-h-28 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-violet-500"
              placeholder="Short description of the file..." />
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-400">Upload File *</label>
            <input required type="file" accept=".pdf,.png,.jpg,.jpeg,.py,.txt,.zip"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3" />
          </div>

          <button type="submit" disabled={loading}
            className="w-full rounded-xl bg-violet-600 py-3 font-medium transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60">
            {loading ? "Submitting..." : "Submit"}
          </button>

          {status && <p className="text-sm text-zinc-300">{status}</p>}
        </form>
      </div>
    </main>
  );
}
