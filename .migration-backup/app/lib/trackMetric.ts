export async function trackMetricOnce(
  id: string,
  metric: "views" | "downloads"
) {
  if (typeof window === "undefined") return;

  const key = `${metric}-${id}`;
  if (localStorage.getItem(key)) return;

  localStorage.setItem(key, "1");

  await fetch(`/api/submissions/${id}/engagement`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ metric }),
  });
}