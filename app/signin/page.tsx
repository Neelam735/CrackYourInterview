import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth, authEnabled, devLoginEnabled, providerList } from "@/auth";
import { SignInButtons } from "@/components/SignInButtons";

export const metadata: Metadata = { title: "Sign in" };

// Only allow redirects back into this site.
function safeCallback(value: string | string[] | undefined): string {
  const url = Array.isArray(value) ? value[0] : value;
  return url && url.startsWith("/") && !url.startsWith("//") ? url : "/learn/code";
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const callbackUrl = safeCallback(params.callbackUrl);
  if (authEnabled && (await auth())?.user) redirect(callbackUrl);

  const oauthProviders = providerList.filter((provider) => provider.id !== "dev");

  return (
    <main className="mx-auto max-w-sm px-4 py-20">
      <h1 className="text-2xl font-bold tracking-tight">Sign in</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">Save your progress and pick up on any device.</p>

      {params.error && (
        <p className="mt-6 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:bg-rose-950/50 dark:text-rose-200">
          Sign-in failed. Please try again.
        </p>
      )}

      {!authEnabled ? (
        <p className="mt-8 rounded-xl border border-slate-200 p-4 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-400">
          Accounts aren&apos;t set up on this site yet. Your progress is still saved in this browser.
        </p>
      ) : (
        <SignInButtons providers={oauthProviders} devLogin={devLoginEnabled} callbackUrl={callbackUrl} />
      )}
    </main>
  );
}
