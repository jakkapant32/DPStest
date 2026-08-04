import { getEvents, getResults } from "@/lib/store";
import { ResultsClient } from "./ResultsClient";

export const metadata = {
  title: "ผลการแข่งขัน",
};

export default async function ResultsPage() {
  const [events, results] = await Promise.all([getEvents(), getResults()]);
  return <ResultsClient initialEvents={events} initialResults={results} />;
}
