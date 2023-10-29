import { writeFile, readFile } from "fs/promises";

/**
 * Returns the details of a UFC event given its event ID and using the UFC API
 *
 * @param {number} eventId - The ID of a UFC event
 * @returns {Promise<object>} - A Promise that resolves with the details of
 *     a UFC event
 */
async function fetchEvent(eventId) {
  try {
    const url =
      "https://d29dxerjsp82wz.cloudfront.net/api/v3/event/live/" +
      eventId +
      ".json";
    const response = await fetch(url);
    const event = await response.json();
    return event;
  } catch (error) {
    console.error(error);
  }
}

/**
 * Using the UFC API, search for the latest event ID, then request each event
 * preceding it until we reach an event that occurred 90 days before now, then
 * create events.json containing these events.
 * Finally return an array of these events
 *
 * @returns {Promise<Array<object>>} - A Promise that resolves with the array
 *     of details of recent and upcoming UFC events
 */
async function initializeEvents() {
  // Binary search for the event with the highest valid event ID
  let min = 1180;
  let max = 2000; // Values should be updated when we reach UFC event ID 2000
  let mid = Math.ceil((min + max) / 2);

  console.log("Intializing events.json");
  console.log("Finding latest event ID...");

  try {
    while (min < max) {
      const event = await fetchEvent(mid);
      if (event.LiveEventDetail.EventId) min = mid;
      else max = mid - 1;
      mid = Math.ceil((min + max) / 2);
    }

    console.log("Fetching recent and upcoming events:");

    // Fetch all events starting from the latest event ID, moving backwards
    // until we reach an event that occured 90 days before now
    let eventId = mid;
    let fetchedEvents = [];
    let event;

    do {
      console.log("Event ID:", eventId);

      event = await fetchEvent(eventId);

      // Only filter in UFC events
      if (event.LiveEventDetail.Organization.OrganizationId === 1)
        fetchedEvents.push(event);

      eventId--;
    } while (
      new Date(event.LiveEventDetail.StartTime) >
      Date.now() - 1000 * 60 * 60 * 24 * 90
    );

    console.log("Creating events.json");

    // Write the fetched events to events.json
    const json = JSON.stringify(fetchedEvents, null, 2);
    writeFile("./events.json", json);

    return fetchedEvents;
  } catch (error) {
    console.error(error);
  }
}

/**
 * Update upcoming events in events.json, and add newly found events to events.json
 * Return an array of these events
 *
 * @returns {Promise<Array<object>>} - A Promise that resolves with the array
 *     of details of recent and upcoming UFC events
 */
async function updateEventsFile() {
  try {
    let events = JSON.parse(await readFile("./events.json"));

    // Update upcoming events
    for (let i = 0; i < events.length; i++) {
      // Skip past events
      if (events[i].LiveEventDetail.Status === "Final") continue;

      console.log("Updating event", events[i].LiveEventDetail.EventId);
      events[i] = fetchEvent(events[i].LiveEventDetail.EventId);
    }

    events = await Promise.all(events);

    // Starting from the latest event ID previously found, find and add any
    // new events
    let eventId = events[0].LiveEventDetail.EventId;
    let event;
    do {
      eventId++;

      event = await fetchEvent(eventId);

      // Only filter in UFC events
      if (
        event.LiveEventDetail.EventId &&
        event.LiveEventDetail.Organization.OrganizationId === 1
      ) {
        console.log("Found new event", event.LiveEventDetail.EventId);
        events.unshift(event);
      }
    } while (event?.LiveEventDetail.EventId);

    console.log("Updating events.json");

    // Write the newly added and updated events to events.json
    const json = JSON.stringify(events, null, 2);
    writeFile("./events.json", json);

    return events;
  } catch (error) {
    console.error(error);
  }
}

/**
 * Create events.json if it does not exist, otherwise update events.json.
 * Return an array of recent and upcoming events
 *
 * @returns {Promise<Array<object>>} - A Promise that resolves with the array
 *     of details of recent and upcoming UFC events
 */
async function getEvents() {
  let events;

  try {
    events = await updateEventsFile();
    if (!events) events = await initializeEvents();
  } catch (error) {
    console.error(error);
  }

  return events;
}

export { getEvents };
