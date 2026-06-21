// app/resources/page.tsx
export const dynamic = "force-dynamic";
import ResourcesClient from "./ResourcesClient";
import { getApprovedResources } from "../lib/getResources";

export default async function ResourcesPage() {
  const resources = await getApprovedResources();

  return (
    <ResourcesClient
      resources={resources}
    />
  );
}