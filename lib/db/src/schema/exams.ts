import {
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const examsTable = pgTable("exams", {
  id: text("id").primaryKey(),

  subject: text("subject").notNull(),

  date: text("date").notNull(),

  portion: text("portion"),

  board: text("board"),

  classLevel: text("class_level"),

  stream: text("stream"),

  postedBy: text("posted_by").notNull(),

  createdAt: timestamp("created_at").notNull(),
});