import { getAllDetailedEvents } from "./scrape.js";
import { getEvents } from "./api.js";
import { writeFile } from "fs/promises";
import { createEvents } from "ics";

/**
 * Extracts the details of recent and upcoming UFC events by scraping the
 * UFC website, then creates an ICS file named "UFC.ics" in the current
 * directory containing these events
 *
 * @returns {Promise<void>} - A Promise that resolves when the ICS file is created
 */
async function createICSFromScrape() {
  // Creating ICS by scraping the UFC website

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

/**
 * Fetch the details of recent and upcoming UFC events by using the UFC API,
 * then creates an ICS file named "UFC.ics" in the current directory containing
 * these events
 *
 * @returns {Promise<void>} - A Promise that resolves when the ICS file is created
 */
async function createICSFromAPI() {
  // Creating ICS by using the UFC API

  let events;
  try {
    events = await getEvents();
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
      let date = new Date(
        event.LiveEventDetail.FightCard[0].CardSegmentStartTime ||
          event.LiveEventDetail.StartTime
      );
      let start = [
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDate(),
        date.getHours(),
        date.getMinutes(),
      ];
      let duration = { hours: 3 };
      let title = event.LiveEventDetail.Name;
      let description = "";

      let mainCard = [];
      let prelims = [];
      let fightCard = [];

      // Helper function to convert fight to a string line to be displayed
      // in the calendar
      function fightToStr(fight) {
        return (
          "• " +
          fight.Fighters[0].Name.FirstName +
          " " +
          fight.Fighters[0].Name.LastName +
          " vs. " +
          fight.Fighters[1].Name.FirstName +
          " " +
          fight.Fighters[1].Name.LastName +
          " @" +
          (fight.WeightClass.CatchWeight || fight.WeightClass.Weight.slice(-3))
        );
      }

      if (event.LiveEventDetail.FightCard.every((fight) => fight.CardSegment)) {
        for (const fight of event.LiveEventDetail.FightCard)
          if (fight.CardSegment === "Main") mainCard.push(fightToStr(fight));
          else prelims.push(fightToStr(fight));
      } else {
        for (const fight of event.LiveEventDetail.FightCard)
          fightCard.push(fightToStr(fight));
      }

      // Distinguish between main card and prelims if this information has been
      // announced by the UFC, otherwise list all fights without categorizing
      if (fightCard.length) description += fightCard.join("\n") + "\n";
      if (mainCard.length)
        description += "Main Card\n----------\n" + mainCard.join("\n") + "\n";
      if (prelims.length)
        description += "\nPrelims\n----------\n" + prelims.join("\n") + "\n";

      description +=
        "\nhttps://www.google.com/search?q=" + title.replaceAll(" ", "+");
      description += "\n\nAccurate as of " + dateTimestr;

      let location =
        event.LiveEventDetail.Location.Venue +
        ", " +
        event.LiveEventDetail.Location.City +
        ", " +
        event.LiveEventDetail.Location.Country;
      let uid = "ufc-id-" + event.LiveEventDetail.EventId;
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

createICSFromAPI();
