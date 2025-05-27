import { useState, useEffect } from "react";
import MapView from "./components/MapView"; // Adjust path if needed
import ButtonComponent from "./components/ButtonComponent";

function App() {
  // Store building height state here so it doesn't cause re-renders of MapView
  const [buildingHeight, setBuildingHeight] = useState<number | null>(null);

  // Cooling/Heating mode state
  const [mode, setMode] = useState<"cooling_load" | "heating_load">(
    "cooling_load"
  );
  const [selectedFeature, setSelectedFeature] = useState<any | null>(null);

  useEffect(() => {
    console.log(`Mode switched to: ${mode}`);
  }, [mode]);
  useEffect(() => {
    // Ensure App is rendered properly when buildingHeight is updated
    if (buildingHeight !== null) {
      console.log(`Building Height: ${buildingHeight} meters`);
    }
  }, [buildingHeight]);

  return (
    <div style={{ position: "relative", height: "100vh", width: "100vw" }}>
      {/* Pass the setBuildingHeight function and mode to MapView */}
      <MapView
        setSelectedFeature={setSelectedFeature}
        setBuildingHeight={setBuildingHeight}
        mode={mode}
      />

      {/* UI Elements */}
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          zIndex: 10,
          display: "flex",
          gap: "10px",
        }}
      >
        <button type="button" id="hello-button">
          Predict for Current Building
        </button>
        <button type="button" id="refresh-button">
          Refresh All Predictions
        </button>
        <ButtonComponent
          buildingHeight={buildingHeight}
          selectedFeature={selectedFeature}
        />

        {/* Toggle button for Cooling/Heating mode */}
        <button
          onClick={() =>
            setMode(mode === "cooling_load" ? "heating_load" : "cooling_load")
          }
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            backgroundColor: mode === "cooling_load" ? "red" : "blue",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          {mode === "cooling_load" ? "Switch to Heating" : "Switch to Cooling"}
        </button>
      </div>
    </div>
  );
}

export default App;
