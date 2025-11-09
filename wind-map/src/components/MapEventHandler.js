import { useEffect } from 'react';
import { useMap, useMapEvents } from 'react-leaflet';

const MapEventHandler = () => {
  const map = useMap();

  // Restore saved position on mount
  useEffect(() => {
    const savedPosition = localStorage.getItem('mapPosition');
    if (savedPosition) {
      try {
        const { center, zoom } = JSON.parse(savedPosition);
        map.setView(center, zoom);
      } catch (e) {
        console.error('Failed to restore map position', e);
      }
    }
  }, [map]);

  // Save position when user moves/zooms
  useMapEvents({
    moveend: () => {
      const center = map.getCenter();
      const zoom = map.getZoom();
      localStorage.setItem('mapPosition', JSON.stringify({
        center: [center.lat, center.lng],
        zoom
      }));
    }
  });

  return null;
};

export default MapEventHandler;
