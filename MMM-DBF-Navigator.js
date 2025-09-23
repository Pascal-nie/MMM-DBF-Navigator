Module.register("MMM-DBF-Navigator", {

  defaults: {
    from: "Berlin Hbf",
    via: '',
    maxSize: 8,
    updateInterval: 10 * 1000, // 10 seconds
    stations: [] // Example: [{ from: "Berlin Hbf", via: "Leipzig Hbf" }, { from: "Munich Hbf", via: "Nuremberg Hbf" }] 
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

  start() {
    this.trainData = []
    this.fetchTrainData();
    setInterval(() => this.fetchTrainData(), this.config.updateInterval);
  },


  getTemplate: function () {
    return "mmm-dbf-navigator.njk";
  },

  getTemplateData: function () {
    return {
      from: this.mapFromToDisplayName(this.config),
      header: {
        train: this.translate("train"),
        destination: this.translate("destination"),
        departure: this.translate("departure"),
        delay: this.translate("delay"),
        in: this.translate("in"),
        from: this.translate("from")
      },
      displayFromColumn: this.isMultiStationConfig(),
      trains: this.trainData
    };
  },

  isMultiStationConfig() {
    return this.config.stations && this.config.stations.length > 0;
  },

  mapFromToDisplayName(config) {
    if (this.isMultiStationConfig()) {
      return config.stations.map(station => station.from).join(" / ");
    }
    return config.from;
  },

  fetchTrainData() {
    this.sendSocketNotification("FETCH_TRAIN_DATA", {
      stations: this.isMultiStationConfig() ? this.config.stations : [{ from: this.config.from, via: this.config.via }]
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
        from: item.from,
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
