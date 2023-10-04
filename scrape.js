import { parse } from "node-html-parser";
import { decode } from "html-entities";

/**
 * Returns an array of URL strings of recent and near-future UFC events
 *
 * @returns {Promise<Array<string>>} - A Promise that resolves with the array
 *     of URL strings of UFC events
 */
async function getEventLinks() {
  let url = `https://www.ufc.com/events`;
  try {
    const response = await fetch(url);
    const text = await response.text();
    const root = parse(text);

    // Extract the URLs of the relevant events from the DOM object
    let links = root.querySelectorAll(".c-card-event--result__headline");
    links = links.map(
      (html) => "https://www.ufc.com" + html.firstChild.getAttribute("href")
    );

    console.log("\nEvent links found:");
    console.log(links);
    return links;
  } catch (error) {
    console.error(error);
  }
}

/**
 * Returns the fight card details of a UFC event given its URL
 *
 * @param {string} url - A URL string of a UFC event
 * @returns {Promise<object>} - A Promise that resolves with the fight card details of
 *     the UFC event
 */
async function getDetailsFromEventLink(url) {
  try {
    const response = await fetch(url);
    const text = await response.text();
    const root = parse(text);

    // Extract basic details of the event from the DOM object
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

    /**
     * Helper function to return the string of a fight given its DOM list item
     *
     * @param {object} li - The DOM list item of a fight
     * @returns {string} - The string of a fight
     */
    function convertLiToStr(li) {
      let bout = li.querySelector(".c-listing-fight__class-text")?.innerText;

      // Return only fight names without bout weightclass if formatting for
      // an event is broken on the UFC event page
      if (!bout)
        return (
          "• " +
          li
            .querySelector(".field--name-node-title")
            .innerText.trim()
            .replace(" vs ", " vs. ")
        );

      // Convert weightclass to lbs
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

      // Extract and format fighter names with weightclass
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

      // Deentitize HTML entities
      fightStr = decode(fightStr);

      return fightStr;
    }

    console.log("\nGetting details from url:", url);

    // Check if main card & prelims have been announced
    if (mainCard.length) {
      // Main card has been announced, extract prelims
      prelims = root.querySelectorAll("#prelims-card .l-listing__item");

      console.log("Main card length:", mainCard.length);
      console.log("Prelims length:", prelims.length);

      mainCard = mainCard.map(convertLiToStr);
      prelims = prelims.map(convertLiToStr);
    } else {
      // Main card has not been announced, extract entire fight card
      fightCard = root.querySelectorAll(
        ".l-listing__group--bordered .l-listing__item"
      );

      console.log("Fight card length:", fightCard.length);

      fightCard = fightCard.map(convertLiToStr);
    }

    // Deentitize HTML entities
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
    throw new Error("Failed to retrieve event: " + url + "\n" + error);
  }
}

/**
 * Returns an array of details of recent and near-future UFC events
 *
 * @returns {Promise<Array<object>>} - A Promise that resolves with the array
 *     of details of recent and near-future UFC events
 */
async function getAllDetailedEvents() {
  let events = [];
  try {
    // Get the URLs of recent and near-future UFC events
    events = await getEventLinks();

    // Convert each URL to the details of the corresponding UFC event
    events = events.map(getDetailsFromEventLink);
    events = await Promise.all(events);
    return events;
  } catch (error) {
    console.error(error);
  }
}

export { getAllDetailedEvents };
