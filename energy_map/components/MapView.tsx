import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const MAPTILER_KEY = 'ixxHuwQrBFlQ9PcwEp0D'; // Replace with your actual MapTiler key

const MapView: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const [features, setFeatures] = useState<any[]>([]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: `https://api.maptiler.com/maps/basic-v2/style.json?key=${MAPTILER_KEY}`,
      center: [-76.4986, 42.4396],
      zoom: 18,
      pitch: 45,
      bearing: -17.6,
      antialias: true,
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
                'interpolate',
                ['linear'],
                ['get', 'height'],
                0, 'lightgray',
                10, 'lightblue',
                20, 'royalblue',
              ],
              'fill-extrusion-height': ['get', 'height'],
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

      setFeatures(displayFeatures);
    });

    return () => map.remove(); // Cleanup on unmount
  }, []);

  return (
    <div style={{ position: 'relative', height: '100vh', width: '100vw' }}>
      {/* Map Container */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Feature Data Display */}
      <pre
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: '50%',
          overflow: 'auto',
          background: '#fff',
          padding: '10px',
        }}
      >
        {JSON.stringify(features, null, 2)}
      </pre>
    </div>
  );
};

export default MapView;
