import { parse } from "node-html-parser";

async function searchEvents() {
  let url = `https://www.tapology.com/search?term=ufc&commit=Submit&model%5Bevents%5D=eventsSearch`;
  try {
    const response = await fetch(url);
    const text = await response.text();
    const root = parse(text);
    let rows = root.querySelectorAll(".fcLeaderboard tr");
    let relevantEvents = [];
    let now = Date.now();
    for (let row of rows) {
      let bouts = parseInt(row.querySelector(".altB")?.innerText);
      if (!bouts) continue;
      let date = new Date(row.childNodes[5]?.innerText);
      if (date < now) break;
      let name = row.childNodes[1].innerText
        .replaceAll("\n", "")
        .replace("|", ":");
      if (!name.includes("UFC")) continue;
      let link =
        "https://www.tapology.com" +
        row.querySelector("a")?.getAttribute("href");
      relevantEvents.push({ name, link });
    }
    return relevantEvents;
  } catch (error) {
    console.error(error);
  }
}

async function getDetails(event) {
  function convertDateString(input) {
    let [, dateStr, , time, ampm] = input.split(" ");
    let date = new Date(dateStr + " " + time);
    if (ampm === "PM") date = new Date(date.getTime() + 1000 * 60 * 60 * 12);
    return date;
  }

  const { name, link: url } = event;
  try {
    const response = await fetch(url);
    const text = await response.text();
    const root = parse(text);

    // Get event date, venue, location
    let details = root
      .querySelector(".right > .clearfix")
      .innerText.split("\n")
      .filter((str) => str);
    let date = convertDateString(details[0]);
    let venue;
    let location;
    for (let i = 0; i < details.length; i++)
      if (details[i] === "Venue:") venue = details[i + 1];
      else if (details[i] === "Location:") location = details[i + 1];

    // Get fights
    let quickCard = root.querySelectorAll(".eventQuickCardSidebar li");
    let fights = [];

    for (const li of quickCard) {
      let innerText = li.innerText.split("\n");
      let fight =
        innerText[2] + " vs. " + innerText[4] + " (" + innerText[7] + ")";
      fights.push(fight);
    }

    return { name, link: url, date, venue, location, fights };
  } catch (error) {
    console.error(error);
  }
}

async function getDetailedEvents() {
  let events = [];

  try {
    events = await searchEvents();
    events = events.map((event) => getDetails(event));
    events = await Promise.all(events);
    return events;
  } catch (error) {
    console.error(error);
  }
}

getDetailedEvents();
