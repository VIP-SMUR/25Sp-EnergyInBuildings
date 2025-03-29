import React, { useState, useCallback } from "react";
import MapContainer from "./MapContainer";
import FeatureDisplay from "./FeatureDisplay";
import { parseFeature } from "../utils/building";

interface MapViewProps {
  setBuildingHeight: (height: number | null) => void;
  setSelectedFeature: (feature: any | null) => void;
  mode: "cooling_load" | "heating_load";
}

const MapView: React.FC<MapViewProps> = ({
  setBuildingHeight,
  setSelectedFeature,
  mode,
}) => {
  const [features, setFeatures] = useState<any[]>([]);

  const handleFeatureClick = useCallback(
    (features: any[]) => {
      const clicked = features?.[0];
      const id = clicked?.properties?.id;

      if (id) {
        const map = (window as any).mapInstance;
        const allFeatures = map?.getSource("custom-buildings")?._data?.features;

        const fullFeature = allFeatures?.find(
          (f: any) => f.properties?.id === id
        );
        if (fullFeature) {
          setSelectedFeature(fullFeature);
          setFeatures([fullFeature]);

          const { height } = parseFeature(fullFeature);
          setBuildingHeight(height);
        } else {
          setSelectedFeature(null);
          setFeatures([]);
          setBuildingHeight(null);
        }
      } else {
        setSelectedFeature(null);
        setFeatures([]);
        setBuildingHeight(null);
      }
    },
    [setBuildingHeight, setSelectedFeature]
  );

  return (
    <div style={{ position: "relative", height: "100vh", width: "100vw" }}>
      <MapContainer onFeatureClick={handleFeatureClick} mode={mode} />
      <FeatureDisplay features={features} mode={mode} />
    </div>
  );
};

export default MapView;
