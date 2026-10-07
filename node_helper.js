const NodeHelper = require("node_helper")
const Log = require("logger");
const moment = require("moment");

module.exports = NodeHelper.create({

  async socketNotificationReceived(notification, payload) {
    if (notification === "FETCH_TRAIN_DATA") {
      const { stations } = payload;
      Promise.all(stations.map(station => fetchTrainData(station.from, station.via)))
        .then(results => {
          const combinedResults = results.flat().sort(sort);
          this.sendSocketNotification("DB_NAVIGATOR_TRAIN_DATA", { departures: combinedResults })
        })
        .catch(error => {
          Log.error(`Error fetching train data: ${error}`)
        })
    }
  }
})

function sort(a, b) {
  return moment(a.scheduledDeparture, "HH:mm").valueOf() - moment(b.scheduledDeparture, "HH:mm").valueOf();
}

function fetchTrainData(from, via) {
  return fetch(`https://dbf.finalrewind.org/${from}?platforms=&via=${via}&hide_opts=1&admode=dep&mode=json&version=3`)
    .then(response => response.json())
    .then(data => data.departures || [])
    .then(data => data.map(item => ({
      ...item,
      from: from,
      infoMessages: extractMessages(item.messages)
    })));
}

// Collects delay reasons (e.g. "Reparatur an einem Signal") and quality of service
// notes (e.g. "Wagen fehlen") independent of the current delay, newest first, without duplicates.
function extractMessages(messages) {
  if (!messages) return [];
  const entries = Array.isArray(messages)
    ? messages
    : [...(messages.delay || []), ...(messages.qos || [])];
  const seen = new Set();
  return entries
    .map(entry => typeof entry === "string"
      ? { text: entry, timestamp: 0 }
      : { text: entry.text || entry.lead || entry.header || "", timestamp: toEpoch(entry.timestamp) })
    .map(entry => ({ ...entry, text: entry.text.trim() }))
    .filter(entry => entry.text)
    .sort((a, b) => b.timestamp - a.timestamp)
    .filter(entry => !seen.has(entry.text) && seen.add(entry.text))
    .map(entry => entry.text);
}

function toEpoch(timestamp) {
  if (typeof timestamp === "number") return timestamp;
  const parsed = Date.parse(timestamp);
  return isNaN(parsed) ? 0 : parsed / 1000;
}

module.exports.extractMessages = extractMessages;
