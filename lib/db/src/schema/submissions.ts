import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const adminsTable = pgTable("admins", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const submissionsTable = pgTable("submissions", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  subject: text("subject").notNull(),
  board: text("board"),
  classLevel: text("class_level").notNull(),
  section: text("section").notNull(),
  author: text("author"),
  description: text("description"),
  originalFileName: text("original_file_name").notNull().default(""),
  storedFileName: text("stored_file_name").notNull().default(""),
  fileUrl: text("file_url").notNull().default(""),
  mimeType: text("mime_type").notNull().default(""),
  status: text("status").notNull().default("pending"),
  views: integer("views").default(0),
  downloads: integer("downloads").default(0),
  approvedBy: text("approved_by"),
  approvedAt: text("approved_at"),
  rejectedBy: text("rejected_by"),
  rejectedAt: text("rejected_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  // Practical-specific fields
  practicalNo: text("practical_no"),
  aim: text("aim"),
  algorithm: text("algorithm"),
  code: text("code"),
  expectedOutput: text("expected_output"),
  commonErrors: text("common_errors"),
  vivaQA: text("viva_qa"),
  tags: text("tags"),
});

export const insertSubmissionSchema = createInsertSchema(submissionsTable).omit({
  createdAt: true,
});
export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;
export type Submission = typeof submissionsTable.$inferSelect;
