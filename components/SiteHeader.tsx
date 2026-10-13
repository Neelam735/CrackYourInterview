import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { UserMenu } from "./UserMenu";

const links = [
  { href: "/learn/code", label: "Coding" },
  { href: "#", label: "System Design", soon: true },
  { href: "#", label: "Behavioral", soon: true },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto flex h-16 max-w-[90rem] items-center gap-6 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-sm text-white">CY</span>
          <span className="hidden sm:inline">CrackYourInterview</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          {links.map((link) =>
            link.soon ? (
              <span
                key={link.label}
                title="Coming soon"
                className="hidden cursor-not-allowed rounded-md px-3 py-2 text-slate-400 md:inline dark:text-slate-600"
              >
                {link.label}
              </span>
            ) : (
              <Link
                key={link.label}
                href={link.href}
                className="rounded-md px-3 py-2 font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                {link.label}
              </Link>
            ),
          )}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
