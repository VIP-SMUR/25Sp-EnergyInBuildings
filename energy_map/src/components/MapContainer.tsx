import React, { useEffect, useRef, useState } from "react";
import { predictAll } from "../../api/route";
import maplibregl from "maplibre-gl";
// import { getMinMaxForMode } from "../utils/building.tsx";

// Declare the window property for TypeScript
declare global {
  interface Window {
    mapInstance: maplibregl.Map | null;
  }
}

const MAPTILER_KEY = "ixxHuwQrBFlQ9PcwEp0D"; // Replace with your actual MapTiler key

interface MapContainerProps {
  onFeatureClick: (features: any[]) => void;
  mode: "cooling_load" | "heating_load"; // Add mode prop
}

const MapContainer: React.FC<MapContainerProps> = ({
  onFeatureClick,
  mode,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const [, setGeojsonData] = useState<any>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  // Function to update the layer style based on mode
  const updateLayerStyle = (
    map: maplibregl.Map,
    currentMode: "cooling_load" | "heating_load"
  ) => {
    if (!map.getLayer("3d-buildings")) return;

    map.setPaintProperty("3d-buildings", "fill-extrusion-color", [
      "case",
      ["has", currentMode],
      [
        "interpolate",
        ["linear"],
        ["get", currentMode],
        -10000,
        "#ffffff", // Out of range (too low) → White
        -9999,
        currentMode === "cooling_load" ? "#b3d9ff" : "#ffb3b3", // Light blue/pink
        10,
        currentMode === "cooling_load" ? "#6699ff" : "#ff6666", // Medium blue/red
        50,
        currentMode === "cooling_load" ? "#000066" : "#8b0000", // Dark blue/red
        101,
        currentMode === "cooling_load" ? "#01012e" : "#320101", // Out of range (too high) → White
      ],
      [
        "case",
        ["has", "height"],
        [
          "interpolate",
          ["linear"],
          ["get", "height"],
          0,
          "lightgray",
          10,
          "lightblue",
          20,
          "royalblue",
        ],
        "darkgray",
      ],
    ]);
  };

  // Initial map setup
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: `https://api.maptiler.com/maps/basic-v2/style.json?key=${MAPTILER_KEY}`,
      center: [-84.39876992901, 33.77620715314],
      zoom: 16,
      pitch: 70,
      bearing: 0, //-17.6
    });

    mapRef.current = map;
    window.mapInstance = map;

    // Function to handle predictions updated event
    const handlePredictionsUpdated = (event: any) => {
      const updatedData = event.detail.geojsonData;
      console.log("Predictions updated, refreshing clicked features");

      // Force an update of any displayed feature info
      const displayedFeature = document.querySelector(
        ".feature-display-container"
      );
      if (displayedFeature) {
        const featureId = displayedFeature.getAttribute("data-feature-id");
        if (featureId) {
          // Find the updated feature data
          const feature = updatedData.features.find(
            (f: any) => f.id === featureId
          );
          if (feature) {
            onFeatureClick([
              {
                id: feature.properties.id,
                properties: feature.properties,
                type: "Feature",
                layer: { id: "3d-buildings" },
                source: "custom-buildings",
              },
            ]);
          }
        }
      }
    };

    document.addEventListener("predictionsUpdated", handlePredictionsUpdated);

    map.on("load", async () => {
      try {
        // Fetch the building geojson data
        const response = await fetch("overture-building.geojson");
        const data = await response.json();
        setGeojsonData(data);

        // Destructure `results` from the object returned by predictAll
        const { results } = await predictAll(data);

        // Make sure results is an array
        if (results && results.length > 0) {
          // Create a map of id -> prediction
          const predictionMap = new Map();
          results.forEach((pred: any) => {
            predictionMap.set(pred.id, {
              heating_load: pred.heating_load_prediction,
              cooling_load: pred.cooling_load_prediction,
            });
          });

          // Add predictions to each feature's properties
          data.features.forEach((feature: any) => {
            const prediction = predictionMap.get(feature.properties.id);
            if (prediction) {
              feature.properties.heating_load = prediction.heating_load;
              feature.properties.cooling_load = prediction.cooling_load;
            } else {
              // Set default values to ensure all buildings have these properties
              feature.properties.heating_load = 0;
              feature.properties.cooling_load = 0;
            }
          });
        } else {
          // If no predictions were fetched, set default values
          data.features.forEach((feature: any) => {
            if (!feature.properties.heating_load)
              feature.properties.heating_load = 0;
            if (!feature.properties.cooling_load)
              feature.properties.cooling_load = 0;
          });
        }

        // Add the enriched data source
        map.addSource("custom-buildings", {
          type: "geojson",
          data: data,
        });

        map.addLayer({
          id: "3d-buildings",
          type: "fill-extrusion",
          source: "custom-buildings",
          paint: {
            "fill-extrusion-height": [
              "case",
              ["has", "height"],
              ["*", ["get", "height"], 2], // multiply height by 2

              6, // Default to 3 meters if height is missing
            ],
            "fill-extrusion-base": 0,
            "fill-extrusion-opacity": 0.8,
          },
        });

        // Set initial colors based on mode
        updateLayerStyle(map, mode);
      } catch (error) {
        console.error("Error loading data or predictions:", error);
      }
    });

    map.on("click", (e) => {
      const clickedFeatures = map.queryRenderedFeatures(e.point, {
        layers: ["3d-buildings"],
      });

      const displayProperties = [
        "type",
        "properties",
        "id",
        "layer",
        "source",
        "sourceLayer",
        "state",
      ];

      const displayFeatures = clickedFeatures.map((feat) => {
        const displayFeat: any = {};
        displayProperties.forEach((prop) => {
          displayFeat[prop] = (feat as any)[prop];
        });
        return displayFeat;
      });

      // Log the complete feature data including heating and cooling properties
      if (clickedFeatures.length > 0) {
        //console.log('Clicked Feature Properties:', clickedFeatures[0].properties);
      }

      onFeatureClick(displayFeatures);
    });

    return () => {
      document.removeEventListener(
        "predictionsUpdated",
        handlePredictionsUpdated
      );
      window.mapInstance = null;
      if (mapRef.current) mapRef.current.remove();
    };
  }, [onFeatureClick]); // Only run this effect once on mount

  // Effect to update the map when mode changes
  useEffect(() => {
    const map = mapRef.current;
    if (map && map.loaded()) {
      console.log(`Updating map style for mode: ${mode}`);
      updateLayerStyle(map, mode);
    }
  }, [mode]); // Run this effect when mode changes

  return (
    <div ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />
  );
};

export default MapContainer;
