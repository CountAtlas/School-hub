import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useUserProfile } from "../contexts/UserProfile";
import { apiUrl } from "../lib/api";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/notes", label: "Notes" },
  { href: "/practicals", label: "Practicals" },
  { href: "/resources", label: "Resources" },
  { href: "/about", label: "About" },
  { href: "/submit", label: "Submit" },
];

export default function Navbar() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const { isDark, toggleTheme } = useUserProfile();

  async function handleLogout() {
    await fetch(apiUrl("/api/admin/logout"), { method: "POST", credentials: "include" });
    window.location.href = "/admin/login";
  }

  const isAdmin = location.startsWith("/admin");

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-black text-lg tracking-tight text-foreground hover:text-accent">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-white text-sm font-bold">S</span>
          <span>School Hub</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-xl px-3 py-1.5 text-sm transition font-medium ${
                location === l.href
                  ? "bg-accent/15 text-accent"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-border text-muted transition hover:border-accent hover:text-foreground"
          >
            {isDark ? (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 5a7 7 0 110 14A7 7 0 0112 5z" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
              </svg>
            )}
          </button>

          {isAdmin && (
            <button
              onClick={handleLogout}
              className="hidden rounded-xl border border-border px-3 py-1.5 text-sm text-muted transition hover:border-accent hover:text-foreground md:block"
            >
              Logout
            </button>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-border text-muted transition hover:text-foreground md:hidden"
            aria-label="Menu"
          >
            {open ? (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-border bg-card px-6 py-4 md:hidden">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={`block py-2.5 text-sm transition hover:text-foreground ${
                location === l.href ? "text-accent font-medium" : "text-muted"
              }`}
            >
              {l.label}
            </Link>
          ))}
          {isAdmin && (
            <button
              onClick={handleLogout}
              className="mt-2 block w-full rounded-xl border border-border py-2.5 text-left text-sm text-muted"
            >
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
