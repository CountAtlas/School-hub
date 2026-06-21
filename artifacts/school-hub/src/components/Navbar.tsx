import { useState } from "react";
import { Link, useLocation } from "wouter";

const LINKS = [
  { href: "/notes", label: "Notes" },
  { href: "/practicals", label: "Practicals" },
  { href: "/resources", label: "Resources" },
  { href: "/about", label: "About" },
  { href: "/submit", label: "Submit Notes" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();

  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-800 bg-black/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
        <Link href="/" className="text-lg font-bold text-violet-400" onClick={() => setOpen(false)}>
          School Hub
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-6 text-sm text-zinc-300 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`transition hover:text-white ${location === l.href ? "text-white" : ""}`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Hamburger button — mobile only */}
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 w-9 flex-col items-center justify-center gap-[5px] rounded-lg transition hover:bg-zinc-800 md:hidden"
        >
          <span
            className={`block h-0.5 w-5 rounded-full bg-zinc-300 transition-all duration-200 ${open ? "translate-y-[7px] rotate-45" : ""}`}
          />
          <span
            className={`block h-0.5 w-5 rounded-full bg-zinc-300 transition-all duration-200 ${open ? "opacity-0" : ""}`}
          />
          <span
            className={`block h-0.5 w-5 rounded-full bg-zinc-300 transition-all duration-200 ${open ? "-translate-y-[7px] -rotate-45" : ""}`}
          />
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="border-t border-zinc-800 bg-black/90 px-4 pb-4 md:hidden">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={`block py-3 text-sm transition hover:text-white ${location === l.href ? "text-white" : "text-zinc-300"}`}
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
