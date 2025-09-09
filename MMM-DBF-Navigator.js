Module.register("MMM-DBF-Navigator", {

  defaults: {
    from: "Berlin Hbf",
    maxSize: 8,
    via: ''
  },

  getScripts() {
    return ["moment.js"]
  },

  getStyles() {
    return ["dbf-navigator.css"]
  },

  getTranslations() {
    return {
      en: "translations/en.json",
      de: "translations/de.json"
    }
  },

  /**
   * Pseudo-constructor for our module. Initialize stuff here.
   */
  start() {
    this.trainData = []
    this.fetchTrainData();
    // set timeout for next random text
    setInterval(() => this.fetchTrainData(), 10000)
  },


  getTemplate: function () {
    return "mmm-dbf-navigator.njk";
  },

  getTemplateData: function () {
    return {
      from: this.config.from,
      header: {
        train: this.translate("train"),
        destination: this.translate("destination"),
        departure: this.translate("departure"),
        delay: this.translate("delay"),
        in: this.translate("in"),
      },
      trains: this.trainData
    };
  },

  fetchTrainData() {
    this.sendSocketNotification("FETCH_TRAIN_DATA", {
      from: this.config.from,
      via: this.config.via
    })
  },

  /**
   * This is the place to receive notifications from other modules or the system.
   *
   * @param {string} notification The notification ID, it is preferred that it prefixes your module name
   * @param {number} payload the payload type.
   */
  socketNotificationReceived(notification, payload) {
    console.log(`Received socket notification: ${notification}`)
    if (notification === "DB_NAVIGATOR_TRAIN_DATA") {
      this.trainData = this.mapResponse(payload)
      this.updateDom()
    }
  },

  mapResponse(response) {
    return response.departures.map(item => {
      const realDeparture = this.calculateRealDeparture(item.scheduledDeparture, item.delayDeparture)
      return {
        name: item.train,
        destination: item.destination,
        scheduledDeparture: item.scheduledDeparture,
        realDeparture,
        showRealDeparture: this.isDuringNextHour(realDeparture),
        relativeTime: this.calculateRelativeTime(realDeparture).formatted,
        delay: item.delayDeparture,
        cancelled: item.isCancelled != 0,
      }
    }).slice(0, Math.min(this.config.maxSize, response.departures.length))
  },

  calculateRealDeparture(timeString, delayMinutes) {
    const time = moment(timeString, "HH:mm")
    if (delayMinutes && delayMinutes > 0) {
      time.add(delayMinutes, 'minutes')
    }
    return time.format("HH:mm")
  },

  calculateRelativeTime(timeString) {
    const time = moment(timeString, "HH:mm")
    const now = moment()
    let diffMinutes = time.diff(now, 'minutes')
    if (diffMinutes < 0) {
      time.add(1, 'day')
      diffMinutes = time.diff(now, 'minutes')
    }
    let formatted = "";
    if (diffMinutes >= 60) {
      formatted = Math.abs(time.diff(now, 'hours')) + " h"
    } else {
      formatted = diffMinutes + " min"
    }
    return { diffMinutes, formatted };
  },

  isDuringNextHour(scheduledDeparture) {
    return this.calculateRelativeTime(scheduledDeparture).diffMinutes <= 60
  }
})
