"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = setContact;
function setContact(_ref) {
  var name = _ref.name,
    email = _ref.email,
    rsvp = _ref.rsvp,
    dir = _ref.dir,
    partstat = _ref.partstat,
    role = _ref.role,
    cutype = _ref.cutype,
    xNumGuests = _ref.xNumGuests;
  var formattedParts = [];
  if (rsvp !== undefined) {
    formattedParts.push(rsvp ? 'RSVP=TRUE' : 'RSVP=FALSE');
  }
  if (cutype) {
    formattedParts.push("CUTYPE=".concat(cutype));
  }
  if (xNumGuests !== undefined) {
    formattedParts.push("X-NUM-GUESTS=".concat(xNumGuests));
  }
  if (role) {
    formattedParts.push("ROLE=".concat(role));
  }
  if (partstat) {
    formattedParts.push("PARTSTAT=".concat(partstat));
  }
  if (dir) {
    formattedParts.push("DIR=".concat(dir));
  }
  formattedParts.push('CN='.concat(name || 'Unnamed attendee'));
  var formattedAttendee = formattedParts.join(';').concat(email ? ":mailto:".concat(email) : '');
  return formattedAttendee;
}