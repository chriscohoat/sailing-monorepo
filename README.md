# Sailing Monorepo

A comprehensive sailing and marine navigation platform for collecting ocean readings, route planning, and real-time marine data visualization.

## Projects

### wind-map (Port 3000)
Interactive wind speed and direction visualization centered on your boat location.

**Current Location**: Oceanside Marina, CA (33°12'22"N 117°23'26"W)

Features:
- **Real-time wind data** in nautical units (knots)
- **NOAA Buoy 46224** offshore measurements (wind, waves, water temp)
- **OpenWeatherMap** forecast data for marina location
- **NOAA Nautical Charts** with depth contours and navigation aids
- **OpenSeaMap** overlay with buoys, seamarks, and depth data
- **Interactive map** with clickable markers and wind arrows
- **Map persistence** - remembers your zoom/pan position
- **Beaufort scale** for sailing conditions
- **Auto-refresh** every 10 minutes
- **2-minute caching** for development

[View wind-map README](./wind-map/README.md) | [NOAA Charts Setup](./wind-map/NOAA_CHARTS_SETUP.md)

## Getting Started

### Quick Start - Run All Projects

From the repository root:

```bash
./run.sh
```

This will start all projects with their designated ports:
- **wind-map**: http://localhost:3000

Press `Ctrl+C` to stop all services.

### Individual Project Setup

Each project can also be run independently:

```bash
cd wind-map
npm install
npm start
```

## Port Allocation

- **3000**: wind-map (Wind visualization)
- **3001**: Reserved for future route-planner
- **3002**: Reserved for future sensor-data
- **3003**: Reserved for future navigation-dashboard

## Planned Features

### Phase 1 (Current)
- [x] Wind map visualization
- [x] Oceanside Marina focus
- [x] OpenWeatherMap integration

### Phase 2
- [x] NOAA buoy data integration
- [ ] Historical wind data charts
- [ ] Multiple location support

### Phase 3
- [ ] Route planning with wind optimization
- [ ] Waypoint management
- [ ] GPS track recording

### Phase 4
- [ ] Custom sensor data collection
- [ ] Real-time data logging
- [ ] Wave and tide information

### Phase 5
- [ ] Full navigation dashboard
- [ ] Offline capability
- [ ] Mobile app

## Technology Stack

- **Frontend**: React, Leaflet
- **APIs**: OpenWeatherMap, NOAA/NDBC
- **Future**: Node.js backend, PostgreSQL/TimescaleDB for sensor data

## Configuration

### Customizing GPS Coordinates

To change the default location from Oceanside Marina to your own marina or boat location:

1. Open `wind-map/src/App.js`
2. Update the `OCEANSIDE_MARINA` constant (around line 13):
   ```javascript
   const OCEANSIDE_MARINA = {
     lat: 33.2061111,  // Your latitude in decimal degrees
     lng: -117.3905556  // Your longitude in decimal degrees
   };
   ```
3. Optionally update the NOAA buoy to one near your location:
   - Find buoys at: https://www.ndbc.noaa.gov/
   - Update `NOAA_BUOY_46224` constant with your buoy's ID and coordinates

## Development

### Prerequisites
- Node.js v14+
- npm or yarn

### Project Structure

```
sailing-monorepo/
├── run.sh                    # Start all projects
├── wind-map/                 # Wind visualization (Port 3000)
│   ├── src/
│   │   ├── components/
│   │   ├── App.js
│   │   └── ...
│   └── package.json
└── README.md                 # This file
```

## Contributing

This is a personal sailing navigation project. As new features are added, each will be in its own subdirectory with independent deployment.

## License

MIT
