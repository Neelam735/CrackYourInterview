"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

// Client-side signIn does a full-page redirect, so the session is fresh
// when the reader lands back on the lesson.
export function SignInButtons({
  providers,
  devLogin,
  callbackUrl,
}: {
  providers: { id: string; name: string }[];
  devLogin: boolean;
  callbackUrl: string;
}) {
  const [name, setName] = useState("");

  return (
    <div className="mt-8 space-y-3">
      {providers.map((provider) => (
        <button
          key={provider.id}
          type="button"
          onClick={() => signIn(provider.id, { redirectTo: callbackUrl })}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-900"
        >
          Continue with {provider.name}
        </button>
      ))}

      {devLogin && (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            signIn("dev", { name, redirectTo: callbackUrl });
          }}
          className="rounded-xl border border-dashed border-amber-400 p-4"
        >
          <label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
            Dev login (local only)
          </label>
          <div className="mt-2 flex gap-2">
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            />
            <button type="submit" className="rounded-lg bg-amber-500 px-3 py-2 text-sm font-semibold text-slate-950">
              Sign in
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
