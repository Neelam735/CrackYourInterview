import { Sidebar } from "@/components/Sidebar";
import { codeNavigation } from "@/lib/navigation";

export default function CodeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-[90rem] px-4 sm:px-6">
      <div className="flex gap-10">
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="sticky top-16 max-h-[calc(100vh-4rem)] overflow-y-auto py-10 pr-2">
            <Sidebar sections={codeNavigation} />
          </div>
        </aside>
        <main className="min-w-0 flex-1">
          <details className="group mt-4 rounded-xl border border-slate-200 lg:hidden dark:border-slate-800">
            <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium">
              <span className="mr-2 inline-block transition-transform group-open:rotate-90">›</span>
              Coding patterns menu
            </summary>
            <div className="border-t border-slate-200 p-3 dark:border-slate-800">
              <Sidebar sections={codeNavigation} />
            </div>
          </details>
          {children}
        </main>
      </div>
    </div>
  );
}
