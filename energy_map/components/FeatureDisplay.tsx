import React from 'react';
import { calculateOrientation } from '../api/calculate_building_features/Rotation';

interface FeatureDisplayProps {
    features: any[];
    mode?: 'cooling_load' | 'heating_load';
}

const FeatureDisplay: React.FC<FeatureDisplayProps> = ({ features, mode = 'cooling_load' }) => {
    if (features.length === 0) return <div>Click on a building to see details.</div>;

    const feature = features[0];
    const { properties } = feature;
    const id = properties?.id ?? 'Unknown';


    // Debug logging
    console.log('Feature display properties:', properties);

    // Parse bbox if it exists and is a string.
    let orientation = 0;

    if (feature?.geometry?.coordinates && feature.geometry.type) {
        const coords =
            feature.geometry.type === "MultiPolygon"
                ? feature.geometry.coordinates[0]
                : feature.geometry.coordinates;

        orientation = calculateOrientation(coords);
    } else {
        console.warn("Missing geometry in feature:", feature);
    }



    return (
        <div
            className="feature-display-container"
            data-feature-id={id}
            style={{
                position: 'absolute',
                bottom: 20,
                left: 20,
                background: 'white',
                padding: '10px',
                borderRadius: '5px',
                boxShadow: '0 0 10px rgba(0,0,0,0.5)',
                zIndex: 100,
                minWidth: '200px'
            }}
        >
            <h4>Building {id}</h4>
            <p>
                <strong>Height:</strong> {properties.height !== undefined ? `${properties.height.toFixed(2)}m` : '3m*'}
            </p>
            <p>
                <strong>Roof Area:</strong> {properties.Shape__Area !== undefined ? `${properties.Shape__Area.toFixed(2)} m²` : 'N/A'}
            </p>
            <p>
                <strong>Orientation:</strong> {`${orientation}°`}
            </p>
            {properties.heating_load !== undefined && (
                <p>
                    <strong>
                        {mode === 'heating_load' ? '▶️ ' : ''}
                        Heating Load:
                    </strong>
                    <span style={{
                        color: getColorForValue(properties.heating_load, 0, 10),
                        fontWeight: mode === 'heating_load' ? 'bold' : 'normal'
                    }}>
                        {` ${properties.heating_load.toFixed(2)} kWh`}
                    </span>
                </p>
            )}
            {properties.cooling_load !== undefined && (
                <p>
                    <strong>
                        {mode === 'cooling_load' ? '▶️ ' : ''}
                        Cooling Load:
                    </strong>
                    <span style={{
                        color: getColorForValue(properties.cooling_load, 0, 10),
                        fontWeight: mode === 'cooling_load' ? 'bold' : 'normal'
                    }}>
                        {` ${properties.cooling_load.toFixed(2)} kWh`}
                    </span>
                </p>
            )}
            {(!properties.heating_load && !properties.cooling_load) && (
                <p><em>No energy data available. Click "Refresh All Predictions" to load data.</em></p>
            )}
        </div>
    );
};

// Helper function to get a color based on a value within a range
function getColorForValue(value: number, min: number, max: number): string {
    const clampedValue = Math.max(min, Math.min(max, value));
    const position = (clampedValue - min) / (max - min);

    if (position < 0.33) {
        return 'green';
    } else if (position < 0.66) {
        return 'orange';
    } else {
        return 'red';
    }
}

export default FeatureDisplay;
