import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';

const MAPTILER_KEY = 'ixxHuwQrBFlQ9PcwEp0D'; // Replace with your actual MapTiler key

interface MapContainerProps {
  onFeatureClick: (features: any[]) => void;
}

const MapContainer: React.FC<MapContainerProps> = ({ onFeatureClick }) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: `https://api.maptiler.com/maps/basic-v2/style.json?key=${MAPTILER_KEY}`,
      center: [-76.4986, 42.4396],
      zoom: 18,
      pitch: 45,
      bearing: -17.6,
    });

    map.on('load', () => {
      fetch('overture-building.geojson')
        .then((response) => response.json())
        .then((geojsonData) => {
          map.addSource('custom-buildings', {
            type: 'geojson',
            data: geojsonData,
          });

          map.addLayer({
            id: '3d-buildings',
            type: 'fill-extrusion',
            source: 'custom-buildings',
            paint: {
              'fill-extrusion-color': [
                'case',
                ['has', 'height'],
                [
                  'interpolate',
                  ['linear'],
                  ['get', 'height'],
                  0, 'lightgray',
                  10, 'lightblue',
                  20, 'royalblue',
                ],
                'darkgray', // Default color if height is missing
              ],
              'fill-extrusion-height': [
                'case',
                ['has', 'height'], ['get', 'height'],
                3, // Default to 3 meters if height is missing
              ],
              'fill-extrusion-base': 0,
              'fill-extrusion-opacity': 0.8,
            },
          });
        })
        .catch((error) => console.error('Error loading GeoJSON:', error));
    });

    map.on('click', (e) => {
      const clickedFeatures = map.queryRenderedFeatures(e.point, {
        layers: ['3d-buildings'],
      });

      const displayProperties = [
        'type',
        'properties',
        'id',
        'layer',
        'source',
        'sourceLayer',
        'state',
      ];

      const displayFeatures = clickedFeatures.map((feat) => {
        const displayFeat: any = {};
        displayProperties.forEach((prop) => {
          displayFeat[prop] = feat[prop];
        });
        return displayFeat;
      });

      onFeatureClick(displayFeatures);
    });

    return () => map.remove(); // Cleanup on unmount
  }, [onFeatureClick]);

  return <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />;
};

export default MapContainer;
