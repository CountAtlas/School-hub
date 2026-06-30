import { useState } from "react";
import { apiUrl } from "../lib/api";

interface VivaQAPair {
  question: string;
  answer: string;
}

const BOARDS = ["CBSE", "ICSE", "ISC", "State Board", "Other"];
const CLASSES = ["9", "10", "11", "12"];
const STREAMS = ["Science", "Commerce", "Humanities"];
const RESOURCE_TYPES = [
  "Notes", "Practical", "Assignment", "PYQ", "Sample Paper",
  "Formula Sheet", "Project", "Book", "Other",
];
const LANGUAGES = ["English", "Hindi", "Bengali", "Tamil", "Telugu", "Marathi", "Gujarati", "Other"];

export default function SubmitPage() {
  // Core fields
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [board, setBoard] = useState("CBSE");
  const [classLevel, setClassLevel] = useState("11");
  const [stream, setStream] = useState("");
  const [section, setSection] = useState<"notes" | "practicals" | "resources">("notes");
  const [resourceType, setResourceType] = useState("");
  const [chapter, setChapter] = useState("");
  const [teacher, setTeacher] = useState("");
  const [language, setLanguage] = useState("English");
  const [academicYear, setAcademicYear] = useState("");
  const [school, setSchool] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);

  // Practical-specific state
  const [practicalNo, setPracticalNo] = useState("");
  const [aim, setAim] = useState("");
  const [algorithm, setAlgorithm] = useState("");
  const [code, setCode] = useState("");
  const [expectedOutput, setExpectedOutput] = useState("");
  const [commonErrors, setCommonErrors] = useState("");
  const [vivaQA, setVivaQA] = useState<VivaQAPair[]>([{ question: "", answer: "" }]);
  const [tags, setTags] = useState("");

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  function addVivaQA() {
    setVivaQA((prev) => [...prev, { question: "", answer: "" }]);
  }

  function removeVivaQA(index: number) {
    setVivaQA((prev) => prev.filter((_, i) => i !== index));
  }

  function updateVivaQA(index: number, field: "question" | "answer", value: string) {
    setVivaQA((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (section !== "practicals" && !file) {
      setStatus("Please select a file.");
      return;
    }
    setLoading(true);
    setStatus("");
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("subject", subject);
      formData.append("board", board);
      formData.append("classLevel", classLevel);
      if (stream) formData.append("stream", stream);
      formData.append("section", section);
      if (resourceType) formData.append("resourceType", resourceType);
      if (chapter) formData.append("chapter", chapter);
      if (teacher) formData.append("teacher", teacher);
      if (language) formData.append("language", language);
      if (academicYear) formData.append("academicYear", academicYear);
      if (school) formData.append("school", school);
      formData.append("author", author);
      formData.append("description", description);
      if (file) formData.append("file", file);

      if (section === "practicals") {
        formData.append("practicalNo", practicalNo);
        formData.append("aim", aim);
        formData.append("algorithm", algorithm);
        formData.append("code", code);
        formData.append("expectedOutput", expectedOutput);
        formData.append("commonErrors", commonErrors);
        formData.append("tags", tags);
        const filteredViva = vivaQA.filter((v) => v.question.trim() && v.answer.trim());
        formData.append(
          "vivaQA",
          JSON.stringify(filteredViva.map((v) => ({ question: v.question.trim(), answer: v.answer.trim() })))
        );
      }

      const res = await fetch(apiUrl("/api/submissions"), { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Upload failed.");

      setTitle(""); setSubject(""); setBoard("CBSE"); setClassLevel("11"); setStream("");
      setSection("notes"); setResourceType(""); setChapter(""); setTeacher("");
      setLanguage("English"); setAcademicYear(""); setSchool("");
      setAuthor(""); setDescription(""); setFile(null);
      setPracticalNo(""); setAim(""); setAlgorithm(""); setCode("");
      setExpectedOutput(""); setCommonErrors(""); setTags("");
      setVivaQA([{ question: "", answer: "" }]);
      setStatus("Submitted! It is now pending review.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setLoading(false);
    }
  }

  const inputCls = "w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-accent transition"
    + " placeholder:text-muted"
    + " bg-background text-foreground border-border";
  const textareaCls = `${inputCls} min-h-28 resize-y`;

  return (
    <main className="min-h-screen px-6 py-10" style={{ color: "var(--foreground)" }}>
      <div className="mx-auto max-w-2xl">
        <p className="text-sm uppercase tracking-[0.4em]" style={{ color: "var(--accent)" }}>School Hub</p>
        <h1 className="mt-3 text-3xl font-bold md:text-5xl" style={{ color: "var(--foreground)" }}>
          {section === "practicals" ? "Submit Practical" : section === "resources" ? "Submit Resource" : "Submit Notes"}
        </h1>
        <p className="mt-3 text-sm" style={{ color: "var(--muted)" }}>
          {section === "practicals"
            ? "Enter your practical with code, aim, algorithm, and viva Q&A."
            : "Upload notes or resources. All fields except title, subject, class, and board are optional."}
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5 rounded-3xl border p-8"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}
        >

          {/* Section */}
          <div>
            <label className="mb-2 block text-xs font-medium" style={{ color: "var(--muted)" }}>Type of Submission *</label>
            <div className="flex gap-2">
              {(["notes", "practicals", "resources"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSection(s)}
                  className={`flex-1 rounded-xl py-2 text-sm font-medium capitalize transition ${
                    section === s ? "bg-accent text-white" : "border border-border text-muted hover:border-accent hover:text-foreground"
                  }`}
                  style={section !== s ? { borderColor: "var(--border)", color: "var(--muted)" } : {}}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="mb-2 block text-xs font-medium" style={{ color: "var(--muted)" }}>
              {section === "practicals" ? "Program Title *" : "Topic / Title *"}
            </label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputCls}
              placeholder={section === "practicals" ? "Bubble Sort Program" : "Chapter 3 Notes — Matrices"}
            />
          </div>

          {/* Subject + Chapter */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-medium" style={{ color: "var(--muted)" }}>Subject *</label>
              <input required value={subject} onChange={(e) => setSubject(e.target.value)}
                className={inputCls} placeholder="Computer Science" />
            </div>
            <div>
              <label className="mb-2 block text-xs font-medium" style={{ color: "var(--muted)" }}>Chapter / Topic</label>
              <input value={chapter} onChange={(e) => setChapter(e.target.value)}
                className={inputCls} placeholder="Chapter 3" />
            </div>
          </div>

          {/* Board + Class */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-medium" style={{ color: "var(--muted)" }}>Board *</label>
              <select value={board} onChange={(e) => setBoard(e.target.value)} className={inputCls}>
                {BOARDS.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-xs font-medium" style={{ color: "var(--muted)" }}>Class *</label>
              <select value={classLevel} onChange={(e) => setClassLevel(e.target.value)} className={inputCls}>
                {CLASSES.map((c) => <option key={c} value={c}>Class {c}</option>)}
              </select>
            </div>
          </div>

          {/* Stream + Resource Type */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-medium" style={{ color: "var(--muted)" }}>Stream</label>
              <select value={stream} onChange={(e) => setStream(e.target.value)} className={inputCls}>
                <option value="">Any Stream</option>
                {STREAMS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-xs font-medium" style={{ color: "var(--muted)" }}>Resource Type</label>
              <select value={resourceType} onChange={(e) => setResourceType(e.target.value)} className={inputCls}>
                <option value="">Select Type</option>
                {RESOURCE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Teacher + Language */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-medium" style={{ color: "var(--muted)" }}>Teacher Name</label>
              <input value={teacher} onChange={(e) => setTeacher(e.target.value)}
                className={inputCls} placeholder="Mrs. Sharma" />
            </div>
            <div>
              <label className="mb-2 block text-xs font-medium" style={{ color: "var(--muted)" }}>Language</label>
              <select value={language} onChange={(e) => setLanguage(e.target.value)} className={inputCls}>
                {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>

          {/* Academic Year + School */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-medium" style={{ color: "var(--muted)" }}>Academic Year</label>
              <input value={academicYear} onChange={(e) => setAcademicYear(e.target.value)}
                className={inputCls} placeholder="2025–2026" />
            </div>
            <div>
              <label className="mb-2 block text-xs font-medium" style={{ color: "var(--muted)" }}>School Name (Optional)</label>
              <input value={school} onChange={(e) => setSchool(e.target.value)}
                className={inputCls} placeholder="Delhi Public School" />
            </div>
          </div>

          {/* Author */}
          <div>
            <label className="mb-2 block text-xs font-medium" style={{ color: "var(--muted)" }}>Your Name (Optional)</label>
            <input value={author} onChange={(e) => setAuthor(e.target.value)}
              className={inputCls} placeholder="Leave blank for anonymity" />
          </div>

          {/* Practical-specific fields */}
          {section === "practicals" && (
            <>
              <hr style={{ borderColor: "var(--border)" }} />
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--accent)" }}>Practical Details</p>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-medium" style={{ color: "var(--muted)" }}>Program No.</label>
                  <input value={practicalNo} onChange={(e) => setPracticalNo(e.target.value)}
                    className={inputCls} placeholder="1" type="number" min="1" />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-medium" style={{ color: "var(--muted)" }}>Tags (comma-separated)</label>
                  <input value={tags} onChange={(e) => setTags(e.target.value)}
                    className={inputCls} placeholder="Python, Sorting, Arrays" />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium" style={{ color: "var(--muted)" }}>Aim</label>
                <textarea value={aim} onChange={(e) => setAim(e.target.value)} className={textareaCls}
                  placeholder="To write a Python program to sort a list using bubble sort." />
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium" style={{ color: "var(--muted)" }}>
                  Algorithm <span style={{ color: "var(--muted-foreground)" }}>(one step per line)</span>
                </label>
                <textarea value={algorithm} onChange={(e) => setAlgorithm(e.target.value)} className={textareaCls}
                  placeholder={"Start\nInput the list\nRepeat until sorted\nStop"} />
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium" style={{ color: "var(--muted)" }}>Code</label>
                <textarea value={code} onChange={(e) => setCode(e.target.value)}
                  className="w-full min-h-40 resize-y rounded-xl border px-4 py-3 font-mono text-sm text-green-400 outline-none transition"
                  style={{ backgroundColor: "#000", borderColor: "var(--border)" }}
                  placeholder={"def bubble_sort(arr):\n    n = len(arr)\n    for i in range(n):\n        ..."} />
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium" style={{ color: "var(--muted)" }}>Expected Output</label>
                <textarea value={expectedOutput} onChange={(e) => setExpectedOutput(e.target.value)} className={textareaCls}
                  placeholder={"Enter list: 5 3 1 2 4\nSorted: [1, 2, 3, 4, 5]"} />
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium" style={{ color: "var(--muted)" }}>
                  Common Errors <span style={{ color: "var(--muted-foreground)" }}>(one per line)</span>
                </label>
                <textarea value={commonErrors} onChange={(e) => setCommonErrors(e.target.value)} className={textareaCls}
                  placeholder={"IndentationError: expected an indented block\nIndexError: list index out of range"} />
              </div>

              {/* Viva Q&A */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>Viva Q&amp;A</label>
                  <button type="button" onClick={addVivaQA}
                    className="rounded-lg border px-3 py-1 text-xs transition hover:border-accent hover:text-accent"
                    style={{ borderColor: "var(--border)", color: "var(--muted)" }}>
                    + Add Q&amp;A
                  </button>
                </div>
                <div className="space-y-4">
                  {vivaQA.map((pair, i) => (
                    <div key={i} className="rounded-2xl border p-4" style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)" }}>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs" style={{ color: "var(--accent)" }}>Q{i + 1}</span>
                        {vivaQA.length > 1 && (
                          <button type="button" onClick={() => removeVivaQA(i)}
                            className="text-xs text-muted transition hover:text-red-400">
                            Remove
                          </button>
                        )}
                      </div>
                      <input value={pair.question} onChange={(e) => updateVivaQA(i, "question", e.target.value)}
                        className={`${inputCls} mb-3`} placeholder="Question..." />
                      <textarea value={pair.answer} onChange={(e) => updateVivaQA(i, "answer", e.target.value)}
                        className="min-h-20 w-full resize-y rounded-xl border px-4 py-3 text-sm outline-none transition placeholder:text-muted bg-background text-foreground"
                        style={{ borderColor: "var(--border)" }}
                        placeholder="Answer..." />
                    </div>
                  ))}
                </div>
              </div>
              <hr style={{ borderColor: "var(--border)" }} />
            </>
          )}

          {/* Description for notes/resources */}
          {section !== "practicals" && (
            <div>
              <label className="mb-2 block text-xs font-medium" style={{ color: "var(--muted)" }}>Description (Optional)</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                className={textareaCls} placeholder="Brief description of the content..." />
            </div>
          )}

          {/* File upload */}
          <div>
            <label className="mb-2 block text-xs font-medium" style={{ color: "var(--muted)" }}>
              Upload File{section === "practicals" ? " (Optional)" : " *"}
            </label>
            <input
              required={section !== "practicals"}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.py,.txt,.zip"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full rounded-xl border px-4 py-3 text-sm text-muted transition"
              style={{ borderColor: "var(--border)", backgroundColor: "var(--background)" }}
            />
            {file && <p className="mt-1 text-xs text-green-400">Selected: {file.name}</p>}
            {section === "practicals" && (
              <p className="mt-1 text-xs" style={{ color: "var(--muted-foreground)" }}>Upload a .py file or leave blank if you entered code above.</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-accent py-3 text-sm font-semibold text-white transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Submitting..." : "Submit for Review"}
          </button>

          {status && (
            <p className={`text-sm ${status.startsWith("Submitted") ? "text-green-400" : "text-red-400"}`}>
              {status}
            </p>
          )}
        </form>
      </div>
    </main>
  );
}
