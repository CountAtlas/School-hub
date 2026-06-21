import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-800 bg-black/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="text-lg font-bold text-violet-400"
        >
          School Hub
        </Link>

        <div className="flex gap-6 text-zinc-300">
          <Link href="/notes">Notes</Link>
          <Link href="/practicals">Practicals</Link>
          <Link href="/resources">Resources</Link>
          <Link href="/about">About</Link>
          <Link href="/submit">Submit Notes</Link>
        </div>
      </div>
    </nav>
  );
}