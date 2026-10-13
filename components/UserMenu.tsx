"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuthEnabled } from "./Providers";

export function UserMenu() {
  return useAuthEnabled() ? <SessionMenu /> : null;
}

function SessionMenu() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  if (status === "loading") return <div className="h-8 w-8" />;

  if (!session?.user) {
    return (
      <Link
        href={`/signin?callbackUrl=${encodeURIComponent(pathname)}`}
        className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-700"
      >
        Sign in
      </Link>
    );
  }

  const name = session.user.name ?? session.user.email ?? "Account";
  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Account menu"
        aria-expanded={open}
        className="grid h-8 w-8 place-items-center overflow-hidden rounded-full bg-brand-100 text-sm font-semibold text-brand-800 ring-2 ring-transparent hover:ring-brand-300 dark:bg-brand-900 dark:text-brand-200"
      >
        {session.user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={session.user.image} alt="" className="h-full w-full object-cover" />
        ) : (
          name.charAt(0).toUpperCase()
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-200 px-3 py-2 dark:border-slate-800">
            <div className="truncate text-sm font-medium">{name}</div>
            {session.user.email && (
              <div className="truncate text-xs text-slate-500 dark:text-slate-400">{session.user.email}</div>
            )}
          </div>
          <button
            type="button"
            onClick={() => signOut({ redirectTo: pathname })}
            className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
