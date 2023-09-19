import { parse } from "node-html-parser";
import { decode } from "html-entities";

async function getEventLinks() {
  let url = `https://www.ufc.com/events`;
  try {
    const response = await fetch(url);
    const text = await response.text();
    const root = parse(text);
    let links = root.querySelectorAll(".c-card-event--result__headline");
    links = links.map(
      (html) => "https://www.ufc.com" + html.firstChild.getAttribute("href")
    );
    return links;
  } catch (error) {
    console.error(error);
  }
}

async function getDetailsFromEventLink(url) {
  try {
    const response = await fetch(url);
    const text = await response.text();
    const root = parse(text);
    let name = root.querySelector("title").innerText.replace(" | UFC", "");
    let date = root
      .querySelector(".c-hero__headline-suffix")
      .getAttribute("data-timestamp");
    let location = root
      .querySelector(".field--name-venue")
      .innerText.replaceAll("\n", "")
      .replaceAll("   ", " ");
    let fightCard = [];
    let mainCard = root.querySelectorAll("#main-card .l-listing__item");
    let prelims = [];

    function convertLiToStr(li) {
      let bout = li.querySelector(".c-listing-fight__class-text").innerText;
      if (bout.includes("Strawweight")) bout = "115";
      else if (bout.includes("Flyweight")) bout = "125";
      else if (bout.includes("Bantamweight")) bout = "135";
      else if (bout.includes("Featherweight")) bout = "145";
      else if (bout.includes("Lightweight")) bout = "155";
      else if (bout.includes("Welterweight")) bout = "170";
      else if (bout.includes("Middleweight")) bout = "185";
      else if (bout.includes("Light Heavyweight")) bout = "205";
      else if (bout.includes("Heavyweight")) bout = "265";
      else if (bout.includes("Catchweight")) bout = "CW";

      let red = li
        .querySelector(".c-listing-fight__corner-name--red")
        .innerText.replaceAll("\n", "")
        .replace(/\s+/g, " ")
        .trim();
      let blue = li
        .querySelector(".c-listing-fight__corner-name--blue")
        .innerText.replaceAll("\n", "")
        .replace(/\s+/g, " ")
        .trim();
      let ranks = li.querySelectorAll(
        ".c-listing-fight__ranks-row .js-listing-fight__corner-rank span"
      );
      ranks = ranks.map((rank) => rank?.innerText);
      let fightStr =
        "• " +
        red +
        (ranks[0] ? " (" + ranks[0] + ")" : "") +
        " vs. " +
        blue +
        (ranks[1] ? " (" + ranks[1] + ")" : "") +
        " @" +
        bout;
      fightStr = decode(fightStr);
      return fightStr;
    }

    if (mainCard.length) {
      mainCard = mainCard.map(convertLiToStr);
      prelims = root.querySelectorAll("#prelims-card .l-listing__item");
      prelims = prelims.map(convertLiToStr);
    } else {
      fightCard = root.querySelectorAll(
        ".l-listing__group--bordered .l-listing__item"
      );
      fightCard = fightCard.map(convertLiToStr);
    }

    [name, location] = [decode(name), decode(location)];
    let details = {
      name,
      url,
      date,
      location,
      fightCard,
      mainCard,
      prelims,
    };
    return details;
  } catch (error) {
    console.error(error);
  }
}

async function getAllDetailedEvents() {
  let events = [];
  try {
    events = await getEventLinks();
    events = events.map(getDetailsFromEventLink);
    events = await Promise.all(events);
    if (events.some((event) => !event)) throw "Failed to retrieve an event";
    return events;
  } catch (error) {
    console.error(error);
  }
}

export { getAllDetailedEvents };
