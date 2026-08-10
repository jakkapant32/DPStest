import { getEvents, getResults } from "@/lib/store";
import { ResultsClient } from "@/app/results/ResultsClient";

export const metadata = {
  title: "รายงานผลการแข่งขัน",
};

export default async function AnalyticsResultsPage() {
  const [events, results] = await Promise.all([getEvents(), getResults()]);
  return <ResultsClient initialEvents={events} initialResults={results} />;
}
