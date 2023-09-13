import { getAllDetailedEvents } from "./scrape.js";
import { writeFileSync } from "fs";
import { createEvents } from "ics";

async function createICS() {
  try {
    let events = await getAllDetailedEvents();

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
      if (event.fightCard.length)
        description += event.fightCard.join("\n") + "\n";
      if (event.mainCard.length)
        description +=
          "Main Card\n----------\n" + event.mainCard.join("\n") + "\n";
      if (event.prelims.length)
        description +=
          "\nPrelims\n----------\n" + event.prelims.join("\n") + "\n";
      let location = event.location;
      let url = event.url;
      let uid = event.url;
      return { start, duration, title, description, location, url, uid };
    });

    console.log(events);
    writeFileSync(`UFC.ics`, createEvents(events).value);
  } catch (error) {
    console.error(error);
  }
}

createICS();
