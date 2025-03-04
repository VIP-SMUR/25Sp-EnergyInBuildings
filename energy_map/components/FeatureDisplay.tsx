import React from 'react';

interface FeatureDisplayProps {
  features: any[];
}

const FeatureDisplay: React.FC<FeatureDisplayProps> = ({ features }) => {
  return (
    <pre
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        width: '20%',
        overflow: 'auto',
        background: '#fff',
        padding: '10px',
      }}
    >
      {features.length > 0 ? JSON.stringify(features, null, 2) : "Click on a building to see details."}
    </pre>
  );
};

export default FeatureDisplay;
