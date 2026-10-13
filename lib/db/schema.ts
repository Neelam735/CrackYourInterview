import { pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";

// One row per lesson a user has marked complete.
export const progress = pgTable(
  "progress",
  {
    userId: text("user_id").notNull(),
    slug: text("slug").notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.slug] })],
);
