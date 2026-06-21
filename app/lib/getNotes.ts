import { readSubmissions } from "./submissions";

export async function getApprovedNotes() {
  const submissions = await readSubmissions();

  return submissions
    .filter(
      (item) =>
        item.status === "approved" &&
        item.section === "notes"
    )
    .map((item) => ({
      id: item.id,
      title: item.title,
      author: item.author || "Anonymous",
      subject: item.subject,
      classLevel: item.classLevel,
      board: item.board || "CBSE",
      pdf: item.fileUrl,
      tags: [],
      views: Number(item.views || 0),
      downloads: Number(item.downloads || 0),
      featured: false,
    }));
}