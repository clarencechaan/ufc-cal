"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = buildEvent;
var _defaults = _interopRequireDefault(require("../defaults"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function buildEvent() {
  var attributes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var title = attributes.title,
    productId = attributes.productId,
    method = attributes.method,
    uid = attributes.uid,
    sequence = attributes.sequence,
    start = attributes.start,
    startType = attributes.startType,
    duration = attributes.duration,
    end = attributes.end,
    description = attributes.description,
    url = attributes.url,
    geo = attributes.geo,
    location = attributes.location,
    status = attributes.status,
    categories = attributes.categories,
    organizer = attributes.organizer,
    attendees = attributes.attendees,
    alarms = attributes.alarms,
    recurrenceRule = attributes.recurrenceRule,
    created = attributes.created,
    lastModified = attributes.lastModified,
    calName = attributes.calName,
    htmlContent = attributes.htmlContent;

  // fill in default values where necessary
  var output = Object.assign({}, _defaults["default"], attributes);

  // remove undefined values
  return Object.entries(output).reduce(function (clean, entry) {
    return typeof entry[1] !== 'undefined' ? Object.assign(clean, _defineProperty({}, entry[0], entry[1])) : clean;
  }, {});
}