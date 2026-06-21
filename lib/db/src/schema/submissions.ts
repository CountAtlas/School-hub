import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const submissionsTable = pgTable("submissions", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  subject: text("subject").notNull(),
  board: text("board"),
  classLevel: text("class_level").notNull(),
  section: text("section").notNull(),
  author: text("author"),
  description: text("description"),
  originalFileName: text("original_file_name").notNull(),
  storedFileName: text("stored_file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  mimeType: text("mime_type").notNull(),
  status: text("status").notNull().default("pending"),
  views: integer("views").default(0),
  downloads: integer("downloads").default(0),
  approvedBy: text("approved_by"),
  approvedAt: text("approved_at"),
  rejectedBy: text("rejected_by"),
  rejectedAt: text("rejected_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertSubmissionSchema = createInsertSchema(submissionsTable).omit({
  createdAt: true,
});
export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;
export type Submission = typeof submissionsTable.$inferSelect;
