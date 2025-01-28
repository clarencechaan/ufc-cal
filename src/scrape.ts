import { parse, HTMLElement } from "node-html-parser";
import { decode } from "html-entities";

/**
 * Returns an array of URLs of recent and upcoming UFC events
 */
async function getEventURLs() {
  // Get first two pages of event urls
  const pageURLs = [
    new URL("https://www.ufc.com/events?page=0"),
    new URL("https://www.ufc.com/events?page=1"),
  ];

  async function getEventLinksFromUrl(url: URL) {
    const response = await fetch(url);
    const text = await response.text();
    const root = parse(text);

    // Extract the URLs of the relevant events from the HTML element
    const eventURLElements = root.querySelectorAll(
      ".c-card-event--result__headline"
    );
    const eventURLs = eventURLElements.map(
      (html) =>
        new URL(
          `https://www.ufc.com${(html.firstChild as HTMLElement).getAttribute(
            "href"
          )}`
        )
    );

    return eventURLs;
  }

  try {
    const eventURLs = (
      await Promise.all(pageURLs.map(getEventLinksFromUrl))
    ).flat();

    console.log("\nEvent URLs found:");
    console.log(eventURLs);
    return eventURLs;
  } catch (error) {
    console.error(error);
  }
}

/**
 * Helper function to return the output string of a fight given its HTML
 * element list item
 */
function convertLiToStr(li: HTMLElement) {
  const bout = li.querySelector(".c-listing-fight__class-text")?.textContent;

  let fightStr = "";

  // Return only fight names without bout weightclass if formatting for
  // an event is broken on the UFC event page
  if (!bout) {
    const textContent = li
      .querySelector(".field--name-node-title")
      ?.textContent?.trim()
      .replace(" vs ", " vs. ");
    if (!textContent) return "";
    fightStr += `• ${textContent}`;
    return fightStr;
  }

  let weightClass = "";

  // Get weightclass in short form
  if (bout.includes("Strawweight")) weightClass = "115";
  else if (bout.includes("Flyweight")) weightClass = "125";
  else if (bout.includes("Bantamweight")) weightClass = "135";
  else if (bout.includes("Featherweight")) weightClass = "145";
  else if (bout.includes("Lightweight")) weightClass = "155";
  else if (bout.includes("Welterweight")) weightClass = "170";
  else if (bout.includes("Middleweight")) weightClass = "185";
  else if (bout.includes("Light Heavyweight")) weightClass = "205";
  else if (bout.includes("Heavyweight")) weightClass = "265";
  else if (bout.includes("Catchweight")) weightClass = "CW";

  // Extract and format fighter names with weightclass
  const red = li
    .querySelector(".c-listing-fight__corner-name--red")
    ?.textContent?.replaceAll("\n", "")
    .replace(/\s+/g, " ")
    .trim();
  const blue = li
    .querySelector(".c-listing-fight__corner-name--blue")
    ?.textContent?.replaceAll("\n", "")
    .replace(/\s+/g, " ")
    .trim();
  const ranks = [
    ...li.querySelectorAll(
      ".c-listing-fight__ranks-row .js-listing-fight__corner-rank span"
    ),
  ].map((rank) => rank?.textContent);

  const redRankStr = ranks[0] ? ` (${ranks[0]})` : "";
  const blueRankStr = ranks[1] ? ` (${ranks[1]})` : "";
  fightStr += `• ${red}${redRankStr} vs. ${blue}${blueRankStr} @${bout}`;

  // Deentitize HTML entities
  fightStr = decode(fightStr);

  return fightStr;
}

/**
 * Returns the fight card details of a UFC event given its URL
 */
async function getDetailsFromEventLink(url: URL) {
  try {
    const response = await fetch(url);
    const text = await response.text();
    const root = parse(text);

    // Extract basic details of the event from the HTML
    const headlinePrefix = root
      .querySelector(".c-hero__headline-prefix")
      ?.innerText.trim();
    const headline = root
      .querySelector(".c-hero__headline")
      ?.innerText.replace(/\s\s+/g, " ")
      .trim();
    const date = root
      .querySelector(".c-hero__headline-suffix")
      ?.getAttribute("data-timestamp");

    const prelimsTime = root
      .querySelector("#prelims-card .c-event-fight-card-broadcaster__time")
      ?.getAttribute("data-timestamp");
    const earlyPrelimsTime = root
      .querySelector("#early-prelims .c-event-fight-card-broadcaster__time")
      ?.getAttribute("data-timestamp");

    let name = `${headlinePrefix}: ${headline}`;
    let location =
      root
        .querySelector(".field--name-venue")
        ?.innerText.replaceAll("\n", "")
        .replaceAll("   ", " ") || "";
    let fightCard: string[] = [];
    let mainCard: string[] = [];
    let prelims: string[] = [];
    let earlyPrelims: string[] = [];

    console.log(`\nGetting details from url: ${url.href}`);

    const mainCardElements = root.querySelectorAll(
      "#main-card .l-listing__item"
    );
    // Check if main card & prelims have been announced
    if (mainCardElements.length) {
      // Main card has been announced, extract prelims
      const prelimsElements = root.querySelectorAll(
        "#prelims-card .l-listing__item"
      );
      const earlyPrelimsElements = root.querySelectorAll(
        "#early-prelims .l-listing__item"
      );

      mainCard = mainCardElements.map(convertLiToStr);
      prelims = prelimsElements.map(convertLiToStr);
      earlyPrelims = earlyPrelimsElements.map(convertLiToStr);

      console.log(`Main card length: ${mainCard.length}`);
      console.log(`Prelims length: ${prelims.length}`);
    } else {
      // Main card has not been announced, extract entire fight card
      const fightCardElements = root.querySelectorAll(
        ".l-listing__group--bordered .l-listing__item"
      );

      fightCard = fightCardElements.map(convertLiToStr);

      console.log(`Fight card length: ${fightCard.length}`);
    }

    // Deentitize HTML entities
    [name, location] = [decode(name), decode(location)];

    if (!name || !date) {
      throw new Error("Failed to retrieve event details");
    }

    const details: UFCEvent = {
      name,
      url,
      date,
      location,
      fightCard,
      mainCard,
      prelims,
      earlyPrelims,
      prelimsTime,
      earlyPrelimsTime,
    };
    return details;
  } catch (error) {
    throw new Error(`Failed to retrieve event: ${url.href}\n${error}`);
  }
}

/**
 * Returns an array of details of recent and upcoming UFC events
 */
async function getAllDetailedEvents() {
  try {
    const eventURLs = await getEventURLs();

    // Convert each URL to the details of the corresponding UFC event
    const detailedEvents = await Promise.all(
      eventURLs?.map(getDetailsFromEventLink) ?? []
    );
    return detailedEvents;
  } catch (error) {
    console.error(error);
  }
}

export { getAllDetailedEvents };
