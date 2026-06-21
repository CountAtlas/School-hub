export const dynamic = "force-dynamic";
import NotesClient from "./NotesClient";
import { getApprovedNotes } from "../lib/getNotes";

export default async function NotesPage() {
  const notes = await getApprovedNotes();

  return <NotesClient notes={notes} />;
}