import { useParams } from "wouter";
import { practicals } from "../data/practicals";

export default function PracticalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const practical = practicals.find((p) => p.id === Number(id));

  if (!practical) {
    return (
      <main className="min-h-screen px-6 py-10 text-white">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold">Practical not found</h1>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-10 text-white">
      <div className="mx-auto max-w-4xl">
        <p className="text-violet-400">Program {practical.practicalNo}</p>
        <h1 className="mt-2 text-5xl font-bold">{practical.title}</h1>
        <p className="mt-2 text-zinc-400">By {practical.author}</p>

        <section className="mt-10">
          <h2 className="mb-4 text-2xl font-semibold">Aim</h2>
          <div className="rounded-2xl bg-zinc-900 p-6">{practical.aim}</div>
        </section>

        <section className="mt-10">
          <h2 className="mb-4 text-2xl font-semibold">Algorithm</h2>
          <ol className="list-decimal space-y-2 pl-6">
            {practical.algorithm.map((step, i) => <li key={i}>{step}</li>)}
          </ol>
        </section>

        <section className="mt-10">
          <h2 className="mb-4 text-2xl font-semibold">Code</h2>
          <pre className="overflow-auto rounded-2xl bg-black p-6 text-green-400">
            <code>{practical.code}</code>
          </pre>
        </section>

        <section className="mt-10">
          <h2 className="mb-4 text-2xl font-semibold">Output</h2>
          <pre className="rounded-2xl bg-zinc-900 p-6">{practical.output}</pre>
        </section>

        <section className="mt-10">
          <h2 className="mb-4 text-2xl font-semibold">Common Errors</h2>
          <ul className="list-disc space-y-2 pl-6">
            {practical.commonErrors.map((error, i) => <li key={i}>{error}</li>)}
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="mb-4 text-2xl font-semibold">Viva Questions & Answers</h2>
          <div className="space-y-6">
            {practical.viva.map((item, i) => (
              <div key={i} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
                <h3 className="font-semibold text-violet-400">Q{i + 1}. {item.question}</h3>
                <p className="mt-3 text-zinc-300">{item.answer}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
