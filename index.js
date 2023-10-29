import { getAllDetailedEvents } from "./scrape.js";
import { writeFile } from "fs/promises";
import { createEvents } from "ics";

/**
 * Extracts the details of recent and near-future UFC events, then creates an
 * ICS file named "UFC.ics" in the current directory containing these events
 *
 * @returns {Promise<void>} - A Promise that resolves when the ICS file is created
 */
async function createICS() {
  try {
    let events = await getAllDetailedEvents();
    if (!events.length) throw new Error("No events retrieved");

    // Get current date and time to communicate to the user how up-to-date
    // the event details are
    let currentDateTime = new Date();
    let dateTimestr = currentDateTime.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      timeZone: "America/Toronto",
      timeZoneName: "short",
    });

    // Convert event details in the format in accordance with the ICS generator
    events = events.map((event) => {
      let date = new Date(parseInt(event.date) * 1000);
      let start = [
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDate(),
        date.getHours(),
        date.getMinutes(),
      ];
      let duration = { hours: 3 };
      let title = event.name;
      let description = "";

      // Distinguish between main card and prelims if this information has been
      // announced by the UFC, otherwise list all fights without categorizing
      if (event.fightCard.length)
        description += event.fightCard.join("\n") + "\n";
      if (event.mainCard.length)
        description +=
          "Main Card\n----------\n" + event.mainCard.join("\n") + "\n";
      if (event.prelims.length)
        description +=
          "\nPrelims\n----------\n" + event.prelims.join("\n") + "\n";

      description += "\n" + event.url;
      description += "\n\nAccurate as of " + dateTimestr;

      let location = event.location;
      let uid = event.url;
      let calName = "UFC";
      return {
        start,
        duration,
        title,
        description,
        location,
        uid,
        calName,
      };
    });

    console.log("\nDetailed events:");
    console.log(events);

    // Create UFC.ics
    writeFile(`UFC.ics`, createEvents(events).value);
  } catch (error) {
    console.error(error);
  }
}

createICS();
