import { getAllDetailedEvents } from "./scrape.js";
import * as fs from "fs";
import { createEvents, DateArray, EventAttributes } from "ics";

/**
 * Extracts the details of recent and upcoming UFC events, then creates an
 * ICS file named "UFC.ics" in the current directory containing these events
 */
async function createICS() {
  try {
    const events = await getAllDetailedEvents();
    if (!events?.length) throw new Error("No events retrieved");

    // Convert event details in the format in accordance with the ICS generator
    const formattedEvents = events.map(formatEventForCalendar);

    console.log("\nDetailed events:");
    console.log(formattedEvents);

    // Create UFC.ics
    const eventsData = createEvents(formattedEvents).value;
    if (eventsData) fs.writeFileSync("UFC.ics", eventsData);
  } catch (error) {
    console.error(error);
  }
}

function formatEventForCalendar(event: UFCEvent): EventAttributes {
  const date = new Date(parseInt(event.date) * 1000);
  const start: DateArray = [
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
  ];
  const duration: { hours: number } = { hours: 3 };
  const title = event.name;
  let description = "";

  // Distinguish between main card and prelims if this information has been
  // announced by the UFC, otherwise list all fights without categorizing
  if (event.fightCard.length) description = `${event.fightCard.join("\n")}\n`;
  if (event.mainCard.length)
    description += `Main Card\n--------------------\n${event.mainCard.join(
      "\n"
    )}\n`;
  if (event.prelims.length) {
    description += "\nPrelims";
    if (event.prelimsTime) {
      const prelimsTime = new Date(parseInt(event.prelimsTime) * 1000);
      const hoursAgo = (+date - +prelimsTime) / 1000 / 60 / 60;
      if (hoursAgo > 0) description += ` (${hoursAgo} hrs before Main)`;
    }
    description += `\n--------------------\n${event.prelims.join("\n")}\n`;
  }
  if (event.earlyPrelims.length) {
    description += "\nEarly Prelims";
    if (event.earlyPrelimsTime) {
      const earlyPrelimsTime = new Date(
        parseInt(event.earlyPrelimsTime) * 1000
      );
      const hoursAgo = (+date - +earlyPrelimsTime) / 1000 / 60 / 60;
      if (hoursAgo > 0) description += ` (${hoursAgo} hrs before Main)`;
    }
    description += `\n--------------------\n${event.earlyPrelims.join("\n")}\n`;
  }
  if (description.length) description += "\n";
  description += `${event.url}`;

  // Get current date and time to communicate to the user how up-to-date
  // the event details are
  const dateTimestr = new Date().toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    timeZone: "America/Toronto",
    timeZoneName: "short",
  });
  description += `\n\nAccurate as of ${dateTimestr}`;

  const location = event.location;
  const uid = event.url.href;
  const calName = "UFC";

  const calendarEvent = {
    start,
    duration,
    title,
    description,
    location,
    uid,
    calName,
  };

  return calendarEvent;
}

createICS();
