import {
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const announcementsTable = pgTable("announcements", {
  id: text("id").primaryKey(),

  title: text("title").notNull(),

  content: text("content").notNull(),

  type: text("type")
    .notNull()
    .default("other"),

  postedBy: text("posted_by").notNull(),

  createdAt: timestamp("created_at")
    .notNull(),
});