import React, { useState, useCallback } from 'react';
import MapContainer from './MapContainer';
import FeatureDisplay from './FeatureDisplay';

interface MapViewProps {
    setBuildingHeight: (height: number | null) => void;
    setSelectedFeature: (feature: any | null) => void;
    mode: 'cooling_load' | 'heating_load'; // Added mode prop
}

const MapView: React.FC<MapViewProps> = ({ setBuildingHeight, mode }) => {
    const [features, setFeatures] = useState<any[]>([]);

    // useCallback ensures this function doesn't change on every render
    const handleFeatureClick = useCallback(
        (features: any[]) => {
            console.log('Clicked features:', JSON.stringify(features, null, 2));

            setFeatures(features);

            if (features.length > 0 && features[0].properties) {
                const height = features[0].properties.height ?? 3; // Default height 3m
                console.log(`Building Height: ${height}m`);
                console.log(`Heating Load: ${features[0].properties.heating_load}`);
                console.log(`Cooling Load: ${features[0].properties.cooling_load}`);
                setBuildingHeight(height);
            }
        },
        [setBuildingHeight]
    );

    return (
        <div style={{ position: 'relative', height: '100vh', width: '100vw' }}>
            <MapContainer onFeatureClick={handleFeatureClick} mode={mode} />
            <FeatureDisplay features={features} mode={mode} />
        </div>
    );
};

export default MapView;