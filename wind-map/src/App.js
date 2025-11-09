import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import WindArrow from './components/WindArrow';
import MapEventHandler from './components/MapEventHandler';
import 'leaflet/dist/leaflet.css';
import './App.css';

// Oceanside Marina coordinates
// 33°12'22"N 117°23'26"W (boat location)
const OCEANSIDE_MARINA = {
  lat: 33.2061111,
  lng: -117.3905556
};

// Fix for default marker icon in react-leaflet
const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// NOAA Buoy 46224 - Oceanside Offshore
const NOAA_BUOY_46224 = {
  id: '46224',
  lat: 33.178,
  lng: -117.472,
  name: 'Oceanside Offshore'
};

function App() {
  const [windData, setWindData] = useState(null);
  const [windDataTimestamp, setWindDataTimestamp] = useState(null);
  const [buoyData, setBuoyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWindData();
    fetchBuoyData();
    // Refresh every 10 minutes
    const interval = setInterval(() => {
      fetchWindData();
      fetchBuoyData();
    }, 600000);
    return () => clearInterval(interval);
  }, []);

  const fetchWindData = async () => {
    try {
      setLoading(true);

      // Check cache first (2 minute TTL for dev)
      const cacheKey = 'windData';
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        const age = Date.now() - timestamp;
        if (age < 120000) { // 2 minutes
          console.log('Using cached wind data');
          setWindData(data);
          setWindDataTimestamp(new Date(timestamp));
          setLoading(false);
          return;
        }
      }

      const API_KEY = process.env.REACT_APP_OPENWEATHER_API_KEY;

      if (!API_KEY) {
        throw new Error('OpenWeatherMap API key not found. Please add REACT_APP_OPENWEATHER_API_KEY to your .env file');
      }

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${OCEANSIDE_MARINA.lat}&lon=${OCEANSIDE_MARINA.lng}&appid=${API_KEY}&units=imperial`
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('API key not yet activated. OpenWeatherMap keys can take up to 2 hours to activate. Please wait and refresh.');
        }
        throw new Error(`API request failed: ${response.status} - ${data.message || response.statusText}`);
      }

      // Cache the data
      const now = Date.now();
      localStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: now }));

      setWindData(data);
      setWindDataTimestamp(new Date(now));
      setLoading(false);
    } catch (err) {
      console.warn('Failed to fetch wind data, will retry on next interval:', err.message);
      // Don't show error to user for network issues, just log it
      // Keep loading false so cached data shows if available
      setLoading(false);
    }
  };

  const fetchBuoyData = async () => {
    try {
      // Check cache first (2 minute TTL for dev)
      const cacheKey = 'buoyData';
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        const age = Date.now() - timestamp;
        if (age < 120000) { // 2 minutes
          console.log('Using cached buoy data');
          setBuoyData(data);
          return;
        }
      }

      // NOAA NDBC real-time data - last 45 days
      // Using CORS proxy to avoid browser CORS restrictions
      const response = await fetch(
        `https://corsproxy.io/?${encodeURIComponent(`https://www.ndbc.noaa.gov/data/realtime2/${NOAA_BUOY_46224.id}.txt`)}`
      );

      if (!response.ok) {
        console.warn('Buoy data not available');
        return;
      }

      const text = await response.text();
      const lines = text.split('\n');

      // Skip header lines (first two lines)
      if (lines.length < 3) return;

      const dataLine = lines[2].trim().split(/\s+/);

      // NDBC format: YY MM DD hh mm WDIR WSPD GST WVHT DPD APD MWD PRES ATMP WTMP DEWP VIS TIDE
      const buoy = {
        windDirection: parseFloat(dataLine[5]) || null,
        windSpeed: parseFloat(dataLine[6]) || null, // m/s
        windGust: parseFloat(dataLine[7]) || null, // m/s
        waveHeight: parseFloat(dataLine[8]) || null, // meters
        pressure: parseFloat(dataLine[12]) || null, // hPa
        airTemp: parseFloat(dataLine[13]) || null, // Celsius
        waterTemp: parseFloat(dataLine[14]) || null, // Celsius
        timestamp: `${dataLine[0]}-${dataLine[1]}-${dataLine[2]} ${dataLine[3]}:${dataLine[4]}`
      };

      // Convert to nautical units
      // Wind speed: m/s to knots (1 m/s = 1.94384 knots)
      if (buoy.windSpeed) buoy.windSpeed = (buoy.windSpeed * 1.94384).toFixed(1);
      if (buoy.windGust) buoy.windGust = (buoy.windGust * 1.94384).toFixed(1);
      // Wave height from meters to feet
      if (buoy.waveHeight) buoy.waveHeight = (buoy.waveHeight * 3.28084).toFixed(1);
      // Temps from C to F
      if (buoy.airTemp) buoy.airTemp = ((buoy.airTemp * 9/5) + 32).toFixed(1);
      if (buoy.waterTemp) buoy.waterTemp = ((buoy.waterTemp * 9/5) + 32).toFixed(1);

      // Cache the data
      localStorage.setItem(cacheKey, JSON.stringify({ data: buoy, timestamp: Date.now() }));

      setBuoyData(buoy);
    } catch (err) {
      console.warn('Failed to fetch buoy data, will retry on next interval:', err.message);
      // Silently fail - buoy data is optional
    }
  };

  const getWindDirection = (degrees) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  };

  const getBeaufortScale = (windSpeedKnots) => {
    if (windSpeedKnots < 1) return { scale: 0, description: 'Calm' };
    if (windSpeedKnots < 4) return { scale: 1, description: 'Light air' };
    if (windSpeedKnots < 7) return { scale: 2, description: 'Light breeze' };
    if (windSpeedKnots < 11) return { scale: 3, description: 'Gentle breeze' };
    if (windSpeedKnots < 17) return { scale: 4, description: 'Moderate breeze' };
    if (windSpeedKnots < 22) return { scale: 5, description: 'Fresh breeze' };
    if (windSpeedKnots < 28) return { scale: 6, description: 'Strong breeze' };
    if (windSpeedKnots < 34) return { scale: 7, description: 'Near gale' };
    if (windSpeedKnots < 41) return { scale: 8, description: 'Gale' };
    if (windSpeedKnots < 48) return { scale: 9, description: 'Strong gale' };
    if (windSpeedKnots < 56) return { scale: 10, description: 'Storm' };
    if (windSpeedKnots < 64) return { scale: 11, description: 'Violent storm' };
    return { scale: 12, description: 'Hurricane' };
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>Oceanside Marina - Wind Map</h1>
        {windData && !loading && (
          <>
            <div className="wind-info">
              <div className="wind-stat">
                <span className="label">Speed:</span>
                <span className="value">{(windData.wind.speed * 0.868976).toFixed(1)} kts</span>
              </div>
              <div className="wind-stat">
                <span className="label">Direction:</span>
                <span className="value">{getWindDirection(windData.wind.deg)} ({windData.wind.deg}°)</span>
              </div>
              <div className="wind-stat">
                <span className="label">Gusts:</span>
                <span className="value">{windData.wind.gust ? (windData.wind.gust * 0.868976).toFixed(1) : 'N/A'} kts</span>
              </div>
              <div className="wind-stat">
                <span className="label">Beaufort:</span>
                <span className="value">
                  {getBeaufortScale(windData.wind.speed * 0.868976).scale} - {getBeaufortScale(windData.wind.speed * 0.868976).description}
                </span>
              </div>
            </div>
            {windDataTimestamp && (
              <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '6px', textAlign: 'center' }}>
                Updated: {windDataTimestamp.toLocaleTimeString()} (OpenWeatherMap forecast)
              </div>
            )}
          </>
        )}
        {loading && <div className="loading">Loading wind data...</div>}
        {error && <div className="error">Error: {error}</div>}
      </header>

      <MapContainer
        center={[OCEANSIDE_MARINA.lat, OCEANSIDE_MARINA.lng]}
        zoom={14}
        style={{ height: 'calc(100vh - 100px)', width: '100%' }}
      >
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Standard Map">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="Satellite View">
            <TileLayer
              attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="NOAA Nautical Charts">
            <TileLayer
              attribution='&copy; <a href="https://www.nauticalcharts.noaa.gov/">NOAA</a>'
              url="https://seamlessrnc.nauticalcharts.noaa.gov/arcgis/rest/services/RNC/NOAA_RNC/MapServer/tile/{z}/{y}/{x}"
              maxZoom={18}
              minZoom={3}
            />
          </LayersControl.BaseLayer>

          <LayersControl.Overlay checked name="Seamarks (Buoys & Navigation)">
            <TileLayer
              attribution='&copy; <a href="http://www.openseamap.org">OpenSeaMap</a> contributors'
              url="https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png"
            />
          </LayersControl.Overlay>

          <LayersControl.Overlay checked name="Depth Contours">
            <TileLayer
              attribution='&copy; OpenSeaMap'
              url="https://tiles.openseamap.org/water/{z}/{x}/{y}.png"
              opacity={0.6}
            />
          </LayersControl.Overlay>
        </LayersControl>

        <MapEventHandler />

        <Marker position={[OCEANSIDE_MARINA.lat, OCEANSIDE_MARINA.lng]}>
          <Popup>
            <div className="popup-content">
              <strong>Oceanside Marina (Your Boat)</strong>
              {windData && (
                <>
                  <br />Wind: {(windData.wind.speed * 0.868976).toFixed(1)} kts {getWindDirection(windData.wind.deg)}
                  <br />Gusts: {windData.wind.gust ? (windData.wind.gust * 0.868976).toFixed(1) : 'N/A'} kts
                </>
              )}
            </div>
          </Popup>
        </Marker>

        {buoyData && (
          <Marker
            position={[NOAA_BUOY_46224.lat, NOAA_BUOY_46224.lng]}
            zIndexOffset={1000}
          >
            <Popup maxWidth={300}>
              <div className="popup-content">
                <strong>NOAA Buoy 46224 - {NOAA_BUOY_46224.name}</strong>
                <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                  Real-time offshore conditions
                </div>
                {buoyData.windSpeed && (
                  <>
                    <br /><strong>Wind:</strong> {buoyData.windSpeed} kts @ {getWindDirection(buoyData.windDirection)} ({buoyData.windDirection}°)
                    {buoyData.windGust && <><br /><strong>Gusts:</strong> {buoyData.windGust} kts</>}
                  </>
                )}
                {buoyData.waveHeight && (
                  <><br /><strong>Wave Height:</strong> {buoyData.waveHeight} ft</>
                )}
                {buoyData.waterTemp && (
                  <><br /><strong>Water Temp:</strong> {buoyData.waterTemp}°F</>
                )}
                {buoyData.airTemp && (
                  <><br /><strong>Air Temp:</strong> {buoyData.airTemp}°F</>
                )}
                {buoyData.pressure && (
                  <><br /><strong>Pressure:</strong> {buoyData.pressure} mb</>
                )}
                <div style={{ fontSize: '10px', color: '#888', marginTop: '6px' }}>
                  Updated: {buoyData.timestamp} UTC
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {buoyData && buoyData.windSpeed && (
          <WindArrow
            position={[NOAA_BUOY_46224.lat, NOAA_BUOY_46224.lng]}
            direction={buoyData.windDirection}
            speed={parseFloat(buoyData.windSpeed)}
          />
        )}

        {windData && (
          <WindArrow
            position={[OCEANSIDE_MARINA.lat, OCEANSIDE_MARINA.lng]}
            direction={windData.wind.deg}
            speed={windData.wind.speed}
          />
        )}
      </MapContainer>
    </div>
  );
}

export default App;
