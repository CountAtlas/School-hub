import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminSubmissionsClient from "./AdminSubmissionsClient";

export default async function AdminSubmissionsPage() {
  const cookieStore = await cookies();

  if (cookieStore.get("admin-auth")?.value !== "true") {
    redirect("/admin/login");
  }

  return <AdminSubmissionsClient />;
}