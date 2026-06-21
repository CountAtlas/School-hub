import { useParams } from "wouter";
import { Link } from "wouter";
import { useGetSubmissionById } from "@workspace/api-client-react";

function parseLines(text: string | null | undefined): string[] {
  if (!text) return [];
  return text.split("\n").map((l) => l.trim()).filter(Boolean);
}

function parseTags(tags: string | null | undefined): string[] {
  if (!tags) return [];
  return tags.split(",").map((t) => t.trim()).filter(Boolean);
}

function parseVivaQA(vivaQA: string | null | undefined): { question: string; answer: string }[] {
  if (!vivaQA) return [];
  try {
    return JSON.parse(vivaQA);
  } catch {
    return [];
  }
}

export default function PracticalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useGetSubmissionById(id ?? "");

  if (isLoading) {
    return (
      <main className="min-h-screen px-6 py-10 text-white">
        <div className="mx-auto max-w-4xl">
          <div className="text-zinc-500">Loading practical...</div>
        </div>
      </main>
    );
  }

  if (isError || !data?.submission) {
    return (
      <main className="min-h-screen px-6 py-10 text-white">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold">Practical not found</h1>
          <Link href="/practicals" className="mt-4 block text-violet-400 hover:underline">
            ← Back to Practicals
          </Link>
        </div>
      </main>
    );
  }

  const practical = data.submission;
  const algorithmSteps = parseLines(practical.algorithm);
  const commonErrors = parseLines(practical.commonErrors);
  const vivaQA = parseVivaQA(practical.vivaQA);
  const tags = parseTags(practical.tags);

  return (
    <main className="min-h-screen px-6 py-10 text-white">
      <div className="mx-auto max-w-4xl">
        <Link href="/practicals" className="mb-6 block text-sm text-zinc-500 hover:text-zinc-300">
          ← Back to Practicals
        </Link>

        {practical.practicalNo && (
          <p className="text-violet-400">Program {practical.practicalNo}</p>
        )}
        <h1 className="mt-2 text-3xl font-bold md:text-5xl">{practical.title}</h1>
        {practical.author && (
          <p className="mt-2 text-zinc-400">By {practical.author}</p>
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

        {practical.aim && (
          <section className="mt-10">
            <h2 className="mb-4 text-2xl font-semibold">Aim</h2>
            <div className="rounded-2xl bg-zinc-900 p-6">{practical.aim}</div>
          </section>
        )}

        {algorithmSteps.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-4 text-2xl font-semibold">Algorithm</h2>
            <ol className="list-decimal space-y-2 pl-6">
              {algorithmSteps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </section>
        )}

        {practical.code && (
          <section className="mt-10">
            <h2 className="mb-4 text-2xl font-semibold">Code</h2>
            <pre className="overflow-auto rounded-2xl bg-black p-6 text-green-400">
              <code>{practical.code}</code>
            </pre>
          </section>
        )}

        {practical.expectedOutput && (
          <section className="mt-10">
            <h2 className="mb-4 text-2xl font-semibold">Output</h2>
            <pre className="rounded-2xl bg-zinc-900 p-6">{practical.expectedOutput}</pre>
          </section>
        )}

        {commonErrors.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-4 text-2xl font-semibold">Common Errors</h2>
            <ul className="list-disc space-y-2 pl-6">
              {commonErrors.map((error, i) => (
                <li key={i}>{error}</li>
              ))}
            </ul>
          </section>
        )}

        {vivaQA.length > 0 && (
          <section className="mt-10 pb-10">
            <h2 className="mb-4 text-2xl font-semibold">Viva Questions &amp; Answers</h2>
            <div className="space-y-6">
              {vivaQA.map((item, i) => (
                <div key={i} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
                  <h3 className="font-semibold text-violet-400">Q{i + 1}. {item.question}</h3>
                  <p className="mt-3 text-zinc-300">{item.answer}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {practical.description && !practical.aim && (
          <section className="mt-10">
            <h2 className="mb-4 text-2xl font-semibold">Description</h2>
            <div className="rounded-2xl bg-zinc-900 p-6">{practical.description}</div>
          </section>
        )}
      </div>
    </main>
  );
}
