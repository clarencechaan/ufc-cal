import { writeFile } from "fs/promises";

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
 * preceding it until we reach an event that occurred 90 days before now.
 * Finally, create events.json containing these events
 *
 * @returns {Promise<void>} - A Promise that resolves when events.json is created
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

    // Write the fetched events to events.json
    fetchedEvents = JSON.stringify(fetchedEvents, null, 2);
    writeFile("./events.json", fetchedEvents);
  } catch (error) {
    console.error(error);
  }
}
