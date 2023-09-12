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
      let date = new Date(Date.parse(row.childNodes[5]?.innerText));
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
