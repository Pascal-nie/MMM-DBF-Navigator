## MMM-DBF-Navigator

A MagicMirror² module to display live train departures from Deutsche Bahn at your chosen station(s).

Uses unoficial Deutsche Bahn API from DBF (see: [dbf.finalrewind.org](https://dbf.finalrewind.org/))

---

### Features

- Shows upcoming train departures from one or multiple configurable stations
- Displays train name, destination, scheduled and real departure time, delay, and time remaining
- Highlights cancelled trains
- Supports filtering via a specific station
- Multistation Support: Select 2 or more stations to display information in one table
- Multilingual support (English, German)
- Configurable update interval

---

## Installation

1. **Navigate to your MagicMirror modules folder:**
   ```sh
   cd ~/MagicMirror/modules
   ```

2. **Clone this repository:**
   ```sh
   git clone https://github.com/Pascal-nie/MMM-DBF-Navigator.git
   ```

---

## Configuration

Add the module to your `config.js` in the MagicMirror `modules` array:

```javascript
let config = {  
  // ...
  modules: [
    //...
    // add here
  ]
}
```

```javascript
{
  module: "MMM-DBF-Navigator",
  position: "top_left", // Or any region you prefer
  config: {
    from: "Berlin Hbf", // Departure station
    via: "",            // (Optional) Filter via a specific station
    maxSize: 8,         // (Optional) Maximum number of departures to show
    updateInterval: 10000, // (Optional) Update interval in milliseconds (default: 10 seconds)
    stations: []        // (Optional) Array of station objects for multi-station support
  }
}
```

### Config Options

| Option          | Type     | Mandatory | Default         | Example                                                                 | Description                                                                                  |
|-----------------|----------|-----------|-----------------|-------------------------------------------------------------------------|----------------------------------------------------------------------------------------------|
| `from`          | string   | Yes*      | `"Berlin Hbf"`  | `from: "München Hbf"`                                                   | The departure station name. The name can be found by searching for your station on the [DBF Frontend](https://dbf.finalrewind.org/). Required unless using `stations` array.                          |
| `via`           | string   | No        | `""`            | `via: "Leipzig"`                                                        | (Optional) Filter departures via a specific station. Leave empty for all.                    |
| `stations`      | array    | No        | `[]`            | `stations: [{ from: "Berlin Hbf", via: "Leipzig Hbf" }, { from: "München Hbf", via: "Nürnberg Hbf" }]` | (Optional) List of station objects for displaying departures from multiple stations. Each object should have at least a `from` property, and optionally a `via` property. If `stations` is used, `from` and `via` are ignored. |
| `maxSize`       | number   | No        | `8`             | `maxSize: 5`                                                            | (Optional) Maximum number of departures to display.                                          |
| `updateInterval`| number   | No        | `10000`         | `updateInterval: 30000`                                                 | (Optional) How often to update the departures, in milliseconds.                              |

\* **Note:** Either `from` or `stations` must be provided.

---

## Example Configuration

```javascript
{
  module: "MMM-DBF-Navigator",
  position: "top_left",
  config: {
    // Single station example
    from: "Frankfurt Hbf",
    via: "Wiesbaden",
    maxSize: 10,
    updateInterval: 30000 // updates every 30 seconds

    // OR for multiple stations:
    // stations: [
    //   { from: "Berlin Hbf", via: "Leipzig Hbf" },
    //   { from: "München Hbf", via: "Nürnberg Hbf" }
    // ]
  }
}
```

---

## Screenshots

![](screenshot.png)

---

## Troubleshooting

- Make sure your MagicMirror is running and the module is listed in your `config.js`.
- If you see no data, check your internet connection and station spelling.
- For issues, open a [GitHub Issue](https://github.com/YOUR_GITHUB/MMM-DBF-Navigator/issues).

---

## Contributing

Pull requests and suggestions are welcome! Please ensure your changes are well documented.

---

## License

MIT

---

## Credits

Inspired by the MagicMirror² community and Deutsche Bahn API.
