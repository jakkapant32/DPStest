import { getEvents } from "@/lib/store";
import { CalendarClient } from "./CalendarClient";

export const metadata = {
  title: "ปฏิทินการแข่งขัน",
};

export default async function CalendarPage() {
  const events = await getEvents();
  return <CalendarClient initialEvents={events} />;
}
