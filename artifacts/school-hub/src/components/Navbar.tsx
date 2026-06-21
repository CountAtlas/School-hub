import { Link } from "wouter";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-800 bg-black/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-bold text-violet-400">
          School Hub
        </Link>
        <div className="flex flex-wrap gap-4 text-sm text-zinc-300 md:gap-6">
          <Link href="/notes" className="hover:text-white transition">Notes</Link>
          <Link href="/practicals" className="hover:text-white transition">Practicals</Link>
          <Link href="/resources" className="hover:text-white transition">Resources</Link>
          <Link href="/about" className="hover:text-white transition">About</Link>
          <Link href="/submit" className="hover:text-white transition">Submit Notes</Link>
        </div>
      </div>
    </nav>
  );
}
