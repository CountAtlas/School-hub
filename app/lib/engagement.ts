import { readSubmissions, writeSubmissions } from "./submissions";

export async function incrementSubmissionMetric(
  id: string,
  metric: "views" | "downloads"
) {
  const submissions = await readSubmissions();

  const index = submissions.findIndex(
    (item) => item.id === id
  );

  if (index === -1) {
    return null;
  }

  const current = submissions[index];

  submissions[index] = {
    ...current,
    [metric]:
      Number(current[metric] ?? 0) + 1,
  };

  await writeSubmissions(submissions);

  return submissions[index];
}