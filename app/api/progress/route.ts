import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDb } from "@/lib/db";
import { progress } from "@/lib/db/schema";
import { pageIds } from "@/lib/navigation";

const validSlugs = pageIds;

async function context() {
  const db = getDb();
  if (!db) return { error: NextResponse.json({ error: "Progress storage is not configured" }, { status: 503 }) };
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { error: NextResponse.json({ error: "Not signed in" }, { status: 401 }) };
  return { db, userId };
}

async function completedSlugs(db: NonNullable<ReturnType<typeof getDb>>, userId: string) {
  const rows = await db.select({ slug: progress.slug }).from(progress).where(eq(progress.userId, userId));
  return rows.map((row) => row.slug);
}

// GET: the signed-in user's completed lessons.
export async function GET() {
  const ctx = await context();
  if ("error" in ctx) return ctx.error;
  return NextResponse.json({ completed: await completedSlugs(ctx.db, ctx.userId) });
}

// POST { slug, completed }: mark one lesson complete or not.
export async function POST(request: Request) {
  const ctx = await context();
  if ("error" in ctx) return ctx.error;

  const body = (await request.json().catch(() => null)) as { slug?: unknown; completed?: unknown } | null;
  const slug = body?.slug;
  if (typeof slug !== "string" || !validSlugs.has(slug) || typeof body?.completed !== "boolean") {
    return NextResponse.json({ error: "Expected { slug, completed }" }, { status: 400 });
  }

  if (body.completed) {
    await ctx.db.insert(progress).values({ userId: ctx.userId, slug }).onConflictDoNothing();
  } else {
    await ctx.db.delete(progress).where(and(eq(progress.userId, ctx.userId), eq(progress.slug, slug)));
  }
  return NextResponse.json({ completed: await completedSlugs(ctx.db, ctx.userId) });
}

// PUT { slugs }: merge progress made while signed out into the account.
export async function PUT(request: Request) {
  const ctx = await context();
  if ("error" in ctx) return ctx.error;

  const body = (await request.json().catch(() => null)) as { slugs?: unknown } | null;
  if (!Array.isArray(body?.slugs)) {
    return NextResponse.json({ error: "Expected { slugs: string[] }" }, { status: 400 });
  }
  const slugs = [...new Set(body.slugs.filter((s): s is string => typeof s === "string" && validSlugs.has(s)))];
  if (slugs.length > 0) {
    await ctx.db
      .insert(progress)
      .values(slugs.map((slug) => ({ userId: ctx.userId, slug })))
      .onConflictDoNothing();
  }
  return NextResponse.json({ completed: await completedSlugs(ctx.db, ctx.userId) });
}
