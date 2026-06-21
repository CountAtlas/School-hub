import { useState } from "react";

interface VivaQAPair {
  question: string;
  answer: string;
}

export default function SubmitPage() {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [board, setBoard] = useState<"CBSE" | "ISC">("CBSE");
  const [classLevel, setClassLevel] = useState<"11" | "12">("11");
  const [section, setSection] = useState<"notes" | "practicals" | "resources">("notes");
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
    setVivaQA((prev) => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
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
      formData.append("section", section);
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
        formData.append("vivaQA", JSON.stringify(filteredViva.map((v) => ({ question: v.question.trim(), answer: v.answer.trim() }))));
      }

      const res = await fetch("/api/submissions", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Upload failed.");

      setTitle(""); setSubject(""); setBoard("CBSE"); setClassLevel("11");
      setSection("notes"); setAuthor(""); setDescription(""); setFile(null);
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

  const inputCls = "w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-violet-500";
  const textareaCls = `${inputCls} min-h-28 resize-y`;

  return (
    <main className="min-h-screen px-6 py-10 text-white">
      <div className="mx-auto max-w-2xl">
        <p className="text-sm uppercase tracking-[0.4em] text-violet-400">School Hub</p>
        <h1 className="mt-3 text-3xl font-bold md:text-5xl">
          {section === "practicals" ? "Submit Practical" : section === "resources" ? "Submit Resource" : "Submit Notes"}
        </h1>
        <p className="mt-3 text-zinc-400">
          {section === "practicals"
            ? "Enter your Python practical with code, aim, algorithm, and viva Q&A."
            : "Upload notes or resources. Author name is optional."}
        </p>

        <form onSubmit={handleSubmit} className="mt-10 space-y-5 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-md">
          {/* Section selector — first so the form adapts */}
          <div>
            <label className="mb-2 block text-sm text-zinc-400">Section *</label>
            <select value={section} onChange={(e) => setSection(e.target.value as "notes" | "practicals" | "resources")}
              className={inputCls}>
              <option value="notes">Notes</option>
              <option value="practicals">Practicals</option>
              <option value="resources">Resources</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-400">
              {section === "practicals" ? "Program Title *" : "Topic Title *"}
            </label>
            <input required value={title} onChange={(e) => setTitle(e.target.value)}
              className={inputCls}
              placeholder={section === "practicals" ? "Python Conditionals" : "Chapter 1 Notes"} />
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-400">Subject *</label>
            <input required value={subject} onChange={(e) => setSubject(e.target.value)}
              className={inputCls}
              placeholder="Computer Science" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-zinc-400">Board *</label>
              <select value={board} onChange={(e) => setBoard(e.target.value as "CBSE" | "ISC")}
                className={inputCls}>
                <option value="CBSE">CBSE</option>
                <option value="ISC">ISC</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm text-zinc-400">Class *</label>
              <select value={classLevel} onChange={(e) => setClassLevel(e.target.value as "11" | "12")}
                className={inputCls}>
                <option value="11">Class 11</option>
                <option value="12">Class 12</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-400">Author Name (Optional)</label>
            <input value={author} onChange={(e) => setAuthor(e.target.value)}
              className={inputCls}
              placeholder="Leave blank for privacy" />
          </div>

          {/* Practical-specific fields */}
          {section === "practicals" && (
            <>
              <hr className="border-zinc-800" />
              <p className="text-sm font-medium text-violet-400">Practical Details</p>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-zinc-400">Program No.</label>
                  <input value={practicalNo} onChange={(e) => setPracticalNo(e.target.value)}
                    className={inputCls} placeholder="1" type="number" min="1" />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-zinc-400">Tags (comma-separated)</label>
                  <input value={tags} onChange={(e) => setTags(e.target.value)}
                    className={inputCls} placeholder="Python, Conditional, Loops" />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-400">Aim</label>
                <textarea value={aim} onChange={(e) => setAim(e.target.value)}
                  className={textareaCls}
                  placeholder="To write a Python program to check if a number is positive, negative, or zero." />
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-400">
                  Algorithm <span className="text-zinc-600">(one step per line)</span>
                </label>
                <textarea value={algorithm} onChange={(e) => setAlgorithm(e.target.value)}
                  className={textareaCls}
                  placeholder={"Start\nInput a number\nIf number > 0, print Positive\nElse print Negative\nStop"} />
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-400">Code</label>
                <textarea value={code} onChange={(e) => setCode(e.target.value)}
                  className="w-full min-h-40 resize-y rounded-xl border border-zinc-700 bg-black px-4 py-3 font-mono text-sm text-green-400 outline-none focus:border-violet-500"
                  placeholder={"num = int(input('Enter number: '))\nif num > 0:\n    print('Positive')\nelse:\n    print('Negative')"} />
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-400">Expected Output</label>
                <textarea value={expectedOutput} onChange={(e) => setExpectedOutput(e.target.value)}
                  className={textareaCls}
                  placeholder={"Enter number: 5\nPositive"} />
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-400">
                  Common Errors <span className="text-zinc-600">(one per line)</span>
                </label>
                <textarea value={commonErrors} onChange={(e) => setCommonErrors(e.target.value)}
                  className={textareaCls}
                  placeholder={"IndentationError: expected an indented block\nNameError: name 'num' is not defined"} />
              </div>

              {/* Viva Q&A */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <label className="text-sm text-zinc-400">Viva Q&amp;A</label>
                  <button type="button" onClick={addVivaQA}
                    className="rounded-lg border border-zinc-700 px-3 py-1 text-xs text-zinc-300 transition hover:border-violet-500 hover:text-violet-300">
                    + Add Q&amp;A
                  </button>
                </div>
                <div className="space-y-4">
                  {vivaQA.map((pair, i) => (
                    <div key={i} className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs text-violet-400">Q{i + 1}</span>
                        {vivaQA.length > 1 && (
                          <button type="button" onClick={() => removeVivaQA(i)}
                            className="text-xs text-zinc-600 transition hover:text-red-400">
                            Remove
                          </button>
                        )}
                      </div>
                      <input value={pair.question} onChange={(e) => updateVivaQA(i, "question", e.target.value)}
                        className={`${inputCls} mb-3`}
                        placeholder="Question..." />
                      <textarea value={pair.answer} onChange={(e) => updateVivaQA(i, "answer", e.target.value)}
                        className="min-h-20 w-full resize-y rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm outline-none focus:border-violet-500"
                        placeholder="Answer..." />
                    </div>
                  ))}
                </div>
              </div>
              <hr className="border-zinc-800" />
            </>
          )}

          {/* Description for notes/resources */}
          {section !== "practicals" && (
            <div>
              <label className="mb-2 block text-sm text-zinc-400">Description (Optional)</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                className={textareaCls}
                placeholder="Short description of the file..." />
            </div>
          )}

          {/* File upload */}
          <div>
            <label className="mb-2 block text-sm text-zinc-400">
              Upload File{section === "practicals" ? " (Optional)" : " *"}
            </label>
            <input
              required={section !== "practicals"}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.py,.txt,.zip"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3"
            />
            {section === "practicals" && (
              <p className="mt-1 text-xs text-zinc-600">You can upload a .py file or leave blank if you entered the code above.</p>
            )}
          </div>

          <button type="submit" disabled={loading}
            className="w-full rounded-xl bg-violet-600 py-3 font-medium transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60">
            {loading ? "Submitting..." : "Submit"}
          </button>

          {status && (
            <p className={`text-sm ${status.startsWith("Submitted") ? "text-green-400" : "text-zinc-300"}`}>
              {status}
            </p>
          )}
        </form>
      </div>
    </main>
  );
}
