# NOAA ENC Charts Setup Guide

This guide shows you how to integrate FREE NOAA Electronic Navigational Charts (ENCs) into your wind-map application.

## Why NOAA Charts?

- **FREE**: No cost, official government data
- **Detailed**: High-resolution depth contours, navigation aids, obstructions
- **Official**: Updated regularly by NOAA
- **Legal**: No DRM, can be used in your own software
- **Coverage**: Complete US coastal waters including Southern California

## Step 1: Find Your Charts

### For Oceanside, CA Area:

1. Visit the [NOAA Chart Locator](https://www.charts.noaa.gov/InteractiveCatalog/nrnc.shtml)
2. Zoom to Oceanside Marina (33°12'22"N 117°23'26"W)
3. Click "ENC" tab
4. You'll see chart cells like:
   - **US5CA52M** - Harbor scale (most detailed for marinas)
   - **US4CA52M** - Approach scale
   - **US3CA52M** - Coastal scale

### Direct Download Links:

Visit: https://charts.noaa.gov/ENCs/ENCs.shtml

Download the **Region 5 - Pacific Coast** charts which include Southern California.

## Step 2: Download Charts

### Option A: Individual Charts (Recommended for Testing)

1. Go to https://www.charts.noaa.gov/ENCs/ENCs.shtml
2. Download individual cells for Oceanside area
3. Files come as `.zip` containing `.000` files (S-57 format)

### Option B: Bulk Download

Download entire regions:
```bash
# Pacific Coast (includes SoCal)
wget https://charts.noaa.gov/ENCs/All_ENCs.zip
```

## Step 3: Convert Charts to Map Tiles

You have several options for using NOAA ENCs in your web app:

### Option 1: Use a Chart Tile Server (Easiest)

#### Install seachart-server (Node.js)

```bash
npm install -g seachart-server
```

Then run:
```bash
seachart-server --charts /path/to/ENC/files --port 8080
```

This creates a tile server at `http://localhost:8080/tiles/{z}/{x}/{y}.png`

Add to your wind-map:
```javascript
<TileLayer
  attribution='NOAA ENC Charts'
  url="http://localhost:8080/tiles/{z}/{x}/{y}.png"
/>
```

### Option 2: Use OpenCPN (Free Desktop Software)

1. **Download OpenCPN**: https://opencpn.org/
2. **Install**: Available for Mac, Windows, Linux
3. **Load NOAA Charts**:
   - Open OpenCPN
   - Go to Options → Charts
   - Add chart directory containing your `.000` files
   - OpenCPN will index and display them

4. **Export Tiles**: OpenCPN can create chart tiles for offline use

### Option 3: Convert with GDAL (Advanced)

GDAL can convert S-57 to various formats:

```bash
# Install GDAL (Mac)
brew install gdal

# Convert S-57 to GeoJSON
ogr2ogr -f GeoJSON output.geojson US5CA52M.000

# Convert to Shapefile
ogr2ogr -f "ESRI Shapefile" output.shp US5CA52M.000
```

**Important**: You need S-57 lookup tables:
```bash
export S57_CSV=/usr/local/share/gdal/
```

### Option 4: Use SMAC-M (Automated Pipeline)

GitHub: https://github.com/LarsSchy/SMAC-M

Automated scripts to:
- Convert S-57 → Shapefiles → Map tiles
- Uses OpenCPN configuration
- Creates styled nautical charts

## Step 4: Integration Options

### Quick Test (No Conversion Needed)

Use NOAA's WMS service for testing:

```javascript
<TileLayer
  attribution='NOAA RNC Charts'
  url="https://gis.charttools.noaa.gov/arcgis/rest/services/MCS/NOAAChartDisplay/MapServer/exts/MaritimeChartService/MapServer/tile/{z}/{y}/{x}"
/>
```

Add this to your `wind-map/src/App.js` LayersControl:

```javascript
<LayersControl.BaseLayer name="NOAA Charts (WMS)">
  <TileLayer
    attribution='NOAA Raster Navigational Charts'
    url="https://gis.charttools.noaa.gov/arcgis/rest/services/MCS/NOAAChartDisplay/MapServer/exts/MaritimeChartService/MapServer/tile/{z}/{y}/{x}"
  />
</LayersControl.BaseLayer>
```

### Local Hosting (Best Performance)

1. Download and convert charts to tiles
2. Host tiles locally or on S3/CDN
3. Point TileLayer to your tile directory

## Recommended Approach for Your Boat

For Oceanside Marina specifically:

1. **Download these charts**:
   - US5CA52M (Harbor - most detailed)
   - US4CA52M (Approach)
   - US3CA52M (Coastal)

2. **Use OpenCPN** (free, easy):
   - Install OpenCPN
   - Load the charts
   - Use for navigation planning
   - Can export/screenshot areas you need

3. **For Web App**: Start with NOAA WMS service (no setup required)
   - Later, set up local tile server for better performance

## Chart Update Schedule

NOAA updates ENCs weekly (every weekday evening).

Download new charts regularly:
```bash
# Check for updates
https://charts.noaa.gov/ENCs/ENCsUpdate.shtml
```

## What You'll Get

With NOAA ENCs for Oceanside, you'll see:

- **Depth contours** with actual depths in feet/fathoms
- **Navigation aids**: Buoys, markers, lights
- **Obstructions**: Wrecks, rocks, pilings
- **Marina facilities**: Docks, ramps, anchorages
- **Bottom type**: Sand, rock, mud, etc.
- **Restricted areas**: No-wake zones, prohibited areas
- **Cables and pipelines**: Underwater hazards

## Next Steps

Want me to:
1. Add NOAA WMS layer to your wind-map right now? (Quick, no downloads)
2. Help you set up OpenCPN on your machine? (Best for offline use)
3. Create a tile server setup script? (Best for production)

Let me know which approach you prefer!

## Resources

- **NOAA Chart Catalog**: https://charts.noaa.gov/
- **OpenCPN**: https://opencpn.org/
- **ENC Spec**: https://iho.int/en/s-57-encs
- **GDAL S-57 Driver**: https://gdal.org/drivers/vector/s57.html
