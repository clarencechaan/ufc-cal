"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = setOrganizer;
function setOrganizer(_ref) {
  var name = _ref.name,
    email = _ref.email,
    dir = _ref.dir,
    sentBy = _ref.sentBy;
  var formattedOrganizer = '';
  formattedOrganizer += dir ? "DIR=\"".concat(dir, "\";") : '';
  formattedOrganizer += sentBy ? "SENT-BY=\"MAILTO:".concat(sentBy, "\";") : '';
  formattedOrganizer += 'CN=';
  formattedOrganizer += name || 'Organizer';
  formattedOrganizer += email ? ":MAILTO:".concat(email) : '';
  return formattedOrganizer;
}