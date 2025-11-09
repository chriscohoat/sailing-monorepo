import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

const WindArrow = ({ position, direction, speed }) => {
  const map = useMap();

  useEffect(() => {
    if (!position || direction === undefined) return;

    // Create a custom SVG arrow that points in the wind direction
    const svgArrow = `
      <svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(30, 30)">
          <g transform="rotate(${direction})">
            <!-- Arrow shaft -->
            <line x1="0" y1="-20" x2="0" y2="15" stroke="#2196F3" stroke-width="3" />
            <!-- Arrow head -->
            <polygon points="0,-25 -6,-15 6,-15" fill="#2196F3" />
            <!-- Speed indicator circles -->
            ${speed > 10 ? '<circle cx="0" cy="5" r="2" fill="#2196F3" />' : ''}
            ${speed > 20 ? '<circle cx="0" cy="10" r="2" fill="#2196F3" />' : ''}
          </g>
        </g>
      </svg>
    `;

    const arrowIcon = L.divIcon({
      html: svgArrow,
      className: 'wind-arrow-icon',
      iconSize: [60, 60],
      iconAnchor: [30, 30],
    });

    const marker = L.marker(position, { icon: arrowIcon }).addTo(map);

    // Add tooltip with wind info
    marker.bindTooltip(
      `Wind: ${speed.toFixed(1)} mph at ${direction}°`,
      { permanent: false, direction: 'top', offset: [0, -20] }
    );

    return () => {
      map.removeLayer(marker);
    };
  }, [map, position, direction, speed]);

  return null;
};

export default WindArrow;
