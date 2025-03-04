import React, { useState, useCallback } from 'react';
import MapContainer from './MapContainer';
import FeatureDisplay from './FeatureDisplay';

interface MapViewProps {
  setBuildingHeight: (height: number | null) => void;
}

const MapView: React.FC<MapViewProps> = ({ setBuildingHeight }) => {
  const [features, setFeatures] = useState<any[]>([]);

  // useCallback ensures this function doesn't change on every render
  const handleFeatureClick = useCallback((features: any[]) => {
    setFeatures(features);

    if (features.length > 0 && features[0].properties) {
      const height = features[0].properties.height ?? 3; // Default height 3m
      setBuildingHeight(height);
    }
  }, [setBuildingHeight]);

  return (
    <div style={{ position: 'relative', height: '100vh', width: '100vw' }}>
      <MapContainer onFeatureClick={handleFeatureClick} />
      <FeatureDisplay features={features} />
    </div>
  );
};

export default MapView;
