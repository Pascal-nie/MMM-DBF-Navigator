const NodeHelper = require("node_helper")
const Log = require("logger");

module.exports = NodeHelper.create({

  async socketNotificationReceived(notification, payload) {
    Log.info(`Received socket notification: ${notification} with payload: ${JSON.stringify(payload)}`)
    if (notification === "FETCH_TRAIN_DATA") {
      // Here you would implement the logic to fetch train data from a database or API
      fetch(`https://dbf.finalrewind.org/${payload.from}?platforms=&via=${payload.via}&hide_opts=1&admode=dep&mode=json&version=3`)
        .then(response => response.json())
        .then(data => {
          Log.info(`Fetched successfully train data}`)
          this.sendSocketNotification("DB_NAVIGATOR_TRAIN_DATA", data)
        })
        .catch(error => {
          Log.error(`Error fetching train data: ${error}`)
        })
    }
  },
})
