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
