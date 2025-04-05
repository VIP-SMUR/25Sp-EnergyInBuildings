import React from "react";
import { parseFeature} from "../utils/building"; // ⬅️ import the shared helper

interface FeatureDisplayProps {
  features: any[];
  mode?: "cooling_load" | "heating_load";
}

const FeatureDisplay: React.FC<FeatureDisplayProps> = ({
  features,
  mode = "cooling_load",
}) => {
  if (features.length === 0)
    return <div>Click on a building to see details.</div>;

  const feature = features[0];
  const { properties } = feature;
  const { id, height, roofArea, orientation, stories, hvacCategory, energyCode, wallArea, windowArea,buildingShape, buildingTypeName } = parseFeature(feature);

  return (
    <div
      className="feature-display-container"
      data-feature-id={id}
      style={{
        position: "absolute",
        bottom: 20,
        left: 20,
        background: "white",
        padding: "10px",
        borderRadius: "5px",
        boxShadow: "0 0 10px rgba(0,0,0,0.5)",
        zIndex: 100,
        minWidth: "200px",
      }}
    >
      <h4>Building {id}</h4>
      <p>
        <strong>Height:</strong> {height ? `${height.toFixed(2)}m` : "3m*"}
      </p>
      <p>
        <strong>Floors:</strong> {stories}
      </p>

      <p>
        <strong>Roof Area:</strong>{" "}
        {roofArea !== undefined ? `${roofArea.toFixed(2)} m²` : "N/A"}
      </p>
      <p>
        <strong>Wall Area:</strong> {wallArea ? `${wallArea.toFixed(2)} m²` : "N/A"}
      </p>
      <p>
        <strong>Window Area:</strong> {windowArea ? `${windowArea.toFixed(2)} m²` : "N/A"}
      </p>


      <p>
        <strong>Orientation:</strong> {`${orientation}°`}
      </p>
      <p>
        <strong>Shape Type:</strong> {`${buildingShape.shapeTypeName} (${buildingShape.shapeType})`}
      </p>
      <p>
      <strong>Building Type:</strong> {buildingTypeName}
    </p>

      <p>
        <strong>HVAC Category:</strong> {hvacCategory}
      </p>
      <p>
        <strong>Energy Code:</strong> {energyCode}
      </p>

      {properties.heating_load !== undefined && (
        <p>
          <strong>
            {mode === "heating_load" ? "▶️ " : ""}
            Heating Load:
          </strong>
          <span
            style={{
              color: getColorForValue(properties.heating_load, 0, 10),
              fontWeight: mode === "heating_load" ? "bold" : "normal",
            }}
          >
            {` ${properties.heating_load.toFixed(2)} kWh/m² per year`}
          </span>
        </p>
      )}
      {properties.cooling_load !== undefined && (
        <p>
          <strong>
            {mode === "cooling_load" ? "▶️ " : ""}
            Cooling Load:
          </strong>
          <span
            style={{
              color: getColorForValue(properties.cooling_load, 0, 10),
              fontWeight: mode === "cooling_load" ? "bold" : "normal",
            }}
          >
            {` ${properties.cooling_load.toFixed(2)} kWh/m² per year`}

          </span>
              </p>
          )}
          {!properties.heating_load && !properties.cooling_load && (
              <p>
                  <em>
                      No energy data available. Click "Refresh All Predictions" to load
                      data.
                  </em>
              </p>
          )}
      </div>
  );
};

function getColorForValue(value: number, min: number, max: number): string {
    const clampedValue = Math.max(min, Math.min(max, value));
  const position = (clampedValue - min) / (max - min);

  if (position < 0.33) return "green";
  if (position < 0.66) return "orange";
  return "red";
}

export default FeatureDisplay;
