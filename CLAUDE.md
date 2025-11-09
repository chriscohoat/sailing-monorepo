# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a sailing navigation platform monorepo centered on Oceanside Marina, CA (33°12'22"N 117°23'26"W). The platform collects ocean readings, displays real-time marine data, and provides route planning capabilities for sailors.

## Running the Application

**Start all projects:**
```bash
./run.sh
```
This starts all services with designated ports. Press `Ctrl+C` to stop all services cleanly.

**Run individual project (wind-map):**
```bash
cd wind-map
npm install
npm start  # Starts on http://localhost:3000
```

**Run tests:**
```bash
cd wind-map
npm test              # Interactive watch mode
npm test -- --coverage # With coverage report
```

**Build for production:**
```bash
cd wind-map
npm run build
```

## Environment Setup

**Required: OpenWeatherMap API key**
1. Sign up at https://openweathermap.org/api (free tier available)
2. Keys take up to 2 hours to activate
3. Create `wind-map/.env`:
   ```
   REACT_APP_OPENWEATHER_API_KEY=your_key_here
   ```
4. Test activation: `cd wind-map && ./test-api-key.sh`

**Security:** `.env` is gitignored. Only `.env.example` should be committed.

## Architecture

### Data Flow

1. **Wind Data Sources:**
   - **OpenWeatherMap API**: Forecast data for marina location
   - **NOAA Buoy 46224**: Real-time offshore measurements (wind, waves, water temp)
   - Data fetched every 10 minutes, cached in localStorage for 2 minutes (dev TTL)

2. **Caching Strategy:**
   - Uses localStorage with TTL to reduce API calls during development
   - Cache keys: `windData`, `buoyData`, `mapPosition`
   - Check cache age before fetching new data

3. **Error Handling:**
   - Network errors are logged with `console.warn` (not `console.error`)
   - Silent failures with cache fallback prevent user-facing errors
   - Tests verify graceful degradation (see App.test.js)

### Key Components

**wind-map/src/App.js** - Main application orchestrator
- Manages state for wind data, buoy data, loading, errors
- Location constants: `OCEANSIDE_MARINA`, `NOAA_BUOY_46224`
- Implements data fetching with caching and error handling
- Renders Leaflet map with multiple layer controls

**wind-map/src/components/WindArrow.js**
- Custom Leaflet marker rendering wind direction as SVG arrow
- Uses `divIcon` to display rotated arrows on map
- Direction prop: meteorological degrees (0° = North)

**wind-map/src/components/MapEventHandler.js**
- Persists map view (center, zoom) to localStorage
- Restores position on page reload using `useMapEvents` hook

### Map Layers Architecture

**Base Layers** (user selects one):
- Standard Map: OpenStreetMap tiles
- Satellite View: Esri World Imagery
- NOAA Nautical Charts: `seamlessrnc.nauticalcharts.noaa.gov` WMS service

**Overlays** (can enable multiple):
- Seamarks: OpenSeaMap navigation aids/buoys (`tiles.openseamap.org/seamark`)
- Depth Contours: OpenSeaMap depth data (`tiles.openseamap.org/water`)

Both OpenSeaMap overlays are enabled by default via `checked` prop.

### Unit Conversions (Always Nautical)

All units displayed to user must be nautical:
- Wind speed: mph → knots (multiply by 0.868976)
- Wave height: meters → feet (multiply by 3.28084)
- Temperature: Celsius → Fahrenheit (×9/5 + 32)
- Buoy wind: m/s → knots (multiply by 1.94384)

Beaufort scale thresholds use knots (see `getBeaufortScale` in App.js:179-193).

### CORS Handling

NOAA buoy data requires CORS proxy:
```javascript
`https://corsproxy.io/?${encodeURIComponent(noaaUrl)}`
```
Direct requests to NOAA NDBC will fail in browser due to CORS policy.

## Customizing Location

To change from Oceanside Marina to a different location:

1. Update `OCEANSIDE_MARINA` constant in `wind-map/src/App.js:13-16`
2. Find nearby NOAA buoy at https://www.ndbc.noaa.gov/
3. Update `NOAA_BUOY_46224` constant with new buoy ID and coordinates
4. Update location references in README files

## Port Allocation

Fixed ports ensure no conflicts:
- **3000**: wind-map (Wind visualization)
- **3001**: Reserved for future route-planner
- **3002**: Reserved for future sensor-data
- **3003**: Reserved for future navigation-dashboard

The `run.sh` script kills previous instances on the same ports before starting.

## NOAA Charts Integration

See `wind-map/NOAA_CHARTS_SETUP.md` for detailed guidance on:
- Downloading NOAA ENC (Electronic Navigational Charts) in S-57 format
- Converting charts for web use (OpenCPN, GDAL, tile servers)
- Specific chart cells for Oceanside area: US5CA52M, US4CA52M, US3CA52M
- WMS service vs. local hosting options

Current implementation uses NOAA's WMS tile service (no local setup required).

## Testing Philosophy

Network-dependent code must handle failures gracefully:
- Mock `global.fetch` in tests
- Test both success and failure paths
- Verify silent error handling (no user-facing errors for transient network issues)
- Test unit conversions with known values
- Example: `App.test.js:29-51` tests `ERR_NETWORK_CHANGED` scenario

## Future Phases

- Phase 2: Historical wind data charts, multiple location support
- Phase 3: Route planning with wind optimization, waypoint management
- Phase 4: Custom sensor data collection, wave/tide information
- Phase 5: Full navigation dashboard, offline capability, mobile app

New projects should follow the monorepo structure with independent directories and designated ports.
