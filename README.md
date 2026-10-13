# CrackYourInterview

A coding interview prep site that teaches algorithm patterns with step-by-step visual walkthroughs.

Built with **Next.js (App Router)**, **MDX**, **Tailwind CSS v4**, **Auth.js** and **Postgres (Drizzle ORM)**.

- 122 pages in 17 sections: 30 concept guides and 92 problem walkthroughs, from Two Pointers to Dynamic Programming, Greedy, Trie, Prefix Sum and Matrices
- 30 step-through visualizations for arrays, linked lists, stacks, trees, heaps, grids, graphs, intervals and DP tables
- Every solution in Python, Java, C++ and JavaScript; the chosen language is remembered
- Progress tracking: in the browser when signed out, synced to your account when signed in

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build (all lessons are statically generated)
npm run lint     # type-check
```

The site runs without any configuration. To try accounts locally, copy `.env.example` to `.env.local`, set `AUTH_SECRET` (`npx auth secret`) and `DATABASE_URL`, keep `AUTH_DEV_LOGIN=true`, and run `npm run db:push` once to create the table. The sign-in page then offers a "dev login" that accepts any name.

## Deploying to Vercel

1. **Import the repo** at [vercel.com/new](https://vercel.com/new). The defaults (Next.js, `npm run build`) are correct.
2. **Add a database.** In the project's *Storage* tab, add a Postgres database (e.g. Neon from the Marketplace). It sets `DATABASE_URL` for you.
3. **Create the table** once from your machine: `DATABASE_URL="<connection string>" npm run db:push`.
4. **Create OAuth apps** for the providers you want, using your Vercel domain:
   - GitHub: [github.com/settings/developers](https://github.com/settings/developers) → callback `https://<domain>/api/auth/callback/github`
   - Google: [console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials) → redirect URI `https://<domain>/api/auth/callback/google`
5. **Set environment variables** in *Settings → Environment Variables*: `AUTH_SECRET`, plus `AUTH_GITHUB_ID`/`AUTH_GITHUB_SECRET` and/or `AUTH_GOOGLE_ID`/`AUTH_GOOGLE_SECRET`. Don't set `AUTH_DEV_LOGIN` in production (it's ignored there anyway).
6. **Redeploy** so the new variables take effect.

Accounts only switch on when `AUTH_SECRET` and at least one provider are set. Until then the Sign in button is hidden and progress stays in the browser.

## Deploying to Railway

1. **Create the app service.** In a new Railway project choose *Deploy from GitHub repo* and pick this repo (pick your branch under *Settings → Source* if it isn't the default one). Railway detects Next.js and runs `npm run build` and `npm start`; `next start` listens on the `PORT` Railway provides, so no build or start settings are needed.
2. **Add Postgres.** In the project canvas: *+ Create → Database → PostgreSQL*.
3. **Connect the database.** On the app service's *Variables* tab add `DATABASE_URL` = `${{Postgres.DATABASE_URL}}` (a reference to the database service, using its private network).
4. **Create the table** once from your machine, using the database's *public* URL (Postgres service → *Variables* → `DATABASE_PUBLIC_URL`):
   ```bash
   # macOS / Linux
   DATABASE_URL="<DATABASE_PUBLIC_URL>" npm run db:push
   ```
   ```powershell
   # Windows PowerShell
   $env:DATABASE_URL="<DATABASE_PUBLIC_URL>"; npm run db:push
   ```
   Run it inside the cloned project folder after `npm install`. The internal URL (`postgres.railway.internal`) only works inside Railway, so use the public one here.
5. **Get a public URL.** App service → *Settings → Networking → Generate Domain*. You'll get something like `https://<name>.up.railway.app`.
6. **Create OAuth apps** with that domain:
   - GitHub callback: `https://<name>.up.railway.app/api/auth/callback/github`
   - Google redirect URI: `https://<name>.up.railway.app/api/auth/callback/google`
7. **Set the remaining variables** on the app service:
   - `AUTH_SECRET` (generate with `npx auth secret`)
   - `AUTH_TRUST_HOST` = `true` (required off Vercel: Railway's proxy forwards the host, and Auth.js only trusts it automatically on Vercel)
   - `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` and/or `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`
8. **Deploy.** Railway redeploys when variables change, and on every push to the connected branch.

If sign-in fails with `UntrustedHost`, check that `AUTH_TRUST_HOST` is set on the app service (not the database) and that the service was redeployed afterwards. Using a custom domain? Add it under *Networking*, then update the OAuth callback URLs to match.

## Project structure

```
app/
  page.tsx                   Landing page
  learn/code/layout.tsx      Docs layout: sidebar + content
  learn/code/[section]/[page]/page.tsx   One page per concept or problem
components/
  DocPage.tsx                Article header, MDX body, prev/next, table of contents
  Sidebar.tsx, TableOfContents.tsx
  mdx/                       Components usable inside MDX (Callout, Problem, Complexity, Difficulty)
  visualizer/                Step-through algorithm visualizer
content/code/<section>/<page>.mdx   Page content
lib/navigation.ts            Sections, page order and redirects (add new pages here)
lib/content.ts               Reads MDX files and extracts headings
auth.ts                      Auth.js config (GitHub, Google, local dev login)
lib/db/                      Drizzle schema and connection (progress table)
app/api/progress/route.ts    Progress API: GET, POST one lesson, PUT to merge browser progress
```

## Adding a lesson

1. Create `content/code/<section>/<page>.mdx` with `title` and `description` frontmatter.
2. Add the page to its section in `lib/navigation.ts`: `concept(slug, title)` for guides, `problem(slug, title, difficulty)` for problems. Problems are indented under the concept page before them in the sidebar.
3. Overview pages can list their section's problems with `<ProblemList section="<section>" />`.

Code blocks marked `nocheck` (for example ` ```python nocheck `) are pseudocode or definitions; every other solution block is real code in Python, Java, C++ or JavaScript.

### MDX components

````mdx
<ProblemList section="two-pointers" />

<Problem difficulty="Medium" link="https://leetcode.com/problems/...">

Problem statement in **markdown**.

</Problem>

<Visualizer id="two-sum-sorted" />

<Complexity time="O(n)" space="O(1)" />

<Callout type="tip | info | warning | interview" title="Optional title">
Body text.
</Callout>

<CodeTabs>

```python
...
```

```java
...
```

</CodeTabs>
````

## Adding a visualization

Visualizations live in `components/visualizer/scenarios.ts` and `advancedScenarios.ts`. Each scenario runs the real algorithm and records a `Frame` at every decision. A frame can show any mix of panels: the main array with pointers, extra arrays (e.g. a dp row), a binary tree, a grid, a graph, intervals, stacks/queues, variables, and an explanation. The panel types are in `components/visualizer/types.ts`. Register the scenario in the map and reference it from MDX with `<Visualizer id="..." />`.
