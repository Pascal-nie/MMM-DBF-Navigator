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
      from: from
    })));
}
