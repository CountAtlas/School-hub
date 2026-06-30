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
  stream: text("stream"),
  section: text("section").notNull(),
  resourceType: text("resource_type"),
  chapter: text("chapter"),
  teacher: text("teacher"),
  language: text("language"),
  academicYear: text("academic_year"),
  school: text("school"),
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

export const dailyUpdatesTable = pgTable("daily_updates", {
  id: text("id").primaryKey(),
  date: text("date").notNull(), // YYYY-MM-DD
  subject: text("subject").notNull(),
  teacher: text("teacher"),
  classLevel: text("class_level"),
  board: text("board"),
  portionCovered: text("portion_covered"),
  homework: text("homework"),
  practicalWork: text("practical_work"),
  announcement: text("announcement"),
  postedBy: text("posted_by").notNull(),
  verifications: text("verifications").notNull().default("[]"), // JSON array of student names
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const examsTable = pgTable("exams", {
  id: text("id").primaryKey(),
  subject: text("subject").notNull(),
  date: text("date").notNull(), // YYYY-MM-DD
  portion: text("portion"),
  board: text("board"),
  classLevel: text("class_level"),
  stream: text("stream"),
  postedBy: text("posted_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const announcementsTable = pgTable("announcements", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  type: text("type").notNull().default("other"), // holiday | schedule-change | practical-reminder | event | other
  postedBy: text("posted_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertSubmissionSchema = createInsertSchema(submissionsTable).omit({
  createdAt: true,
});
export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;
export type Submission = typeof submissionsTable.$inferSelect;
