# Wind Map - Oceanside Marina

A React-based wind visualization platform for sailors in Oceanside, CA. Displays real-time wind speed, direction, and conditions on an interactive map.

## Features

- **Interactive Map**: Centered on Oceanside Marina with OpenStreetMap tiles
- **Wind Visualization**: Animated wind arrows showing direction and speed
- **Real-time Data**: Wind speed, direction, gusts, and Beaufort scale
- **Marine-focused**: Beaufort scale for sailing conditions
- **Auto-refresh**: Updates every 10 minutes

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

```bash
cd wind-map
npm install
```

### Configuration

1. Sign up for a free account at [OpenWeatherMap](https://openweathermap.org/api)
2. Generate an API key from your account dashboard
3. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
4. Edit `.env` and add your API key:
   ```
   REACT_APP_OPENWEATHER_API_KEY=your_api_key_here
   ```

**Note:** The `.env` file is ignored by git to keep your API key secure.

### Testing Your API Key

OpenWeatherMap API keys can take **up to 2 hours** to activate after creation. To test if your key is ready:

```bash
./test-api-key.sh
```

This will check:
- If your API key is in the `.env` file
- If the API key is activated
- Current wind conditions (if working)

### Running the App

```bash
npm start
```

The app will start on http://localhost:3000 and fetch live wind data from OpenWeatherMap.

**If you see a 401 error:** Your API key is still activating. Wait a bit and refresh the page.

## Current Location

The app is pre-configured for:
- **Oceanside Marina** (boat location)
- Coordinates: 33°12'22"N 117°23'26"W
- Decimal: 33.2061111°N, 117.3905556°W

## Wind Data Displayed

- **Speed**: Current wind speed in knots (kts)
- **Direction**: Cardinal direction (N, NE, E, etc.) and degrees
- **Gusts**: Peak gust speed when available
- **Beaufort Scale**: Sailing-friendly wind strength classification (0-12)

## Data Sources

### Weather Data
- **OpenWeatherMap**: Forecast wind data for marina location
- **NOAA Buoy 46224**: Real-time offshore conditions including:
  - Wind speed and direction
  - Wave height
  - Water and air temperature
  - Barometric pressure

### Chart Data
- **OpenSeaMap**: Free crowdsourced nautical data (seamarks, depth contours)
- **NOAA Nautical Charts**: Official US government charts via WMS
- **OpenStreetMap**: Base map tiles
- **Esri Satellite**: Satellite imagery view

See [NOAA_CHARTS_SETUP.md](./NOAA_CHARTS_SETUP.md) for detailed instructions on downloading and using NOAA ENC charts.

## Map Layers

Toggle between different map views using the layer control (top-right):

**Base Layers** (choose one):
- Standard Map (OpenStreetMap)
- Satellite View
- **NOAA Nautical Charts** - Official charts with depths, navigation aids, hazards

**Overlays** (can enable multiple):
- Seamarks (Buoys & Navigation)
- Depth Contours

## Technology Stack

- **React**: UI framework
- **Leaflet**: Interactive mapping
- **react-leaflet**: React bindings for Leaflet
- **OpenWeatherMap API**: Weather forecast data
- **NOAA NDBC**: Real-time buoy observations
- **NOAA Charts WMS**: Official nautical charts
- **OpenSeaMap**: Crowdsourced nautical data

## Future Enhancements

- [ ] Add NOAA buoy data integration
- [ ] Historical wind data charts
- [ ] Multiple waypoint tracking
- [ ] Route planning with wind optimization
- [ ] Wave height and swell direction
- [ ] Tide information
- [ ] Custom data logging from onboard sensors

## Data Sources

### Available Options

1. **OpenWeatherMap** (Current implementation)
   - Easy to use, free tier available
   - Global coverage
   - Updated hourly

2. **NOAA/NDBC** (Planned)
   - National Data Buoy Center
   - Real buoy measurements
   - Very accurate for coastal areas
   - Free to use

3. **Windy API** (Future consideration)
   - Beautiful visualizations
   - Multiple weather models
   - Premium features available

## Development

### Project Structure

```
wind-map/
├── src/
│   ├── components/
│   │   └── WindArrow.js       # Wind direction visualization
│   ├── App.js                 # Main application component
│   ├── App.css                # Styling
│   └── index.js               # Entry point
├── public/
└── package.json
```

### Available Scripts

- `npm start` - Run development server
- `npm test` - Run tests
- `npm run build` - Build for production

## Contributing

This is part of a larger sailing navigation platform. Future additions will include:
- Ocean readings database
- Route planning
- GPS integration
- Sensor data collection

## Notes

The app fetches live wind data from OpenWeatherMap. Your API key is stored securely in the `.env` file which is not committed to version control.
