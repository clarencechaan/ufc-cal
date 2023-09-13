import { parse } from "node-html-parser";

async function getEventLinks() {
  let url = `https://www.ufc.com/events`;
  try {
    const response = await fetch(url);
    const text = await response.text();
    const root = parse(text);
    let links = root.querySelectorAll(
      "#events-list-upcoming h3.c-card-event--result__headline"
    );
    links = links.map(
      (html) => "https://www.ufc.com" + html.firstChild.getAttribute("href")
    );
    return links;
  } catch (error) {
    console.error(error);
  }
}
