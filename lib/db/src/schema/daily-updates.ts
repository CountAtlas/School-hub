import {
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const dailyUpdatesTable = pgTable("daily_updates", {
  id: text("id").primaryKey(),

  date: text("date").notNull(),

  subject: text("subject").notNull(),

  teacher: text("teacher"),

  classLevel: text("class_level"),

  board: text("board"),

  portionCovered: text("portion_covered"),

  homework: text("homework"),

  practicalWork: text("practical_work"),

  announcement: text("announcement"),

  postedBy: text("posted_by").notNull(),

  verifications: text("verifications")
    .notNull()
    .default("[]"),

  createdAt: timestamp("created_at")
    .notNull(),

  updatedAt: timestamp("updated_at")
    .notNull(),
});