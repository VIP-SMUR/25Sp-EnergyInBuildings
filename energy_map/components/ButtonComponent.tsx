import { useEffect } from "react";

interface ButtonComponentProps {
    buildingHeight: number | null;
}

const ButtonComponent: React.FC<ButtonComponentProps> = ({ buildingHeight }) => {
    useEffect(() => {
        const handleClick = async () => {
            if (buildingHeight === null) {
                alert("Please click on a building first!");
                return;
            }

            try {
                alert(`Sending API request with Building Height: ${buildingHeight}m...`);
                const response = await fetch("http://localhost:5000/predict", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        Building_Type: 1,
                        Building_Shape: 1,
                        Orientation: 1,
                        Building_Height: buildingHeight, // pass clicked building height
                        Building_Stories: 1,
                        Wall_Area: 1,
                        Window_Area: 1,
                        Roof_Area: 1,
                        energy_code: 1,
                        hvac_category: 1,
                    }),
                });

                if (!response.ok) {
                    throw new Error("Failed to get prediction from Flask API");
                }

                const result = await response.json();
                const coolingLoad = result.cooling_load_prediction?.[0] ?? "N/A";
                const heatingLoad = result.heating_load_prediction?.[0] ?? "N/A";

                alert(
                    `Energy Load Predictions:\n\n` +
                    `Cooling Load: ${coolingLoad.toFixed(2)} kWh\n` +
                    `Heating Load: ${heatingLoad.toFixed(2)} kWh`
                );

            } catch (error: any) {
                alert(`Error during API call:\n${error.message}`);
            }
        };

        // Re-fetch all predictions without page reload
        const handleRefreshClick = async () => {
            try {
                alert("Refreshing all building predictions...");

                // Fetch the GeoJSON data
                const geoResponse = await fetch('overture-building.geojson');
                const geojsonData = await geoResponse.json();

                // Extract building data for prediction
                const buildings = geojsonData.features.map((feature: any) => ({
                    id: feature.properties.id,
                    Building_Type: 1,
                    Building_Shape: 1,
                    Orientation: 1,
                    Building_Height: feature.properties.height || 3,
                    Building_Stories: 1,
                    Wall_Area: 1,
                    Window_Area: 1,
                    Roof_Area: 1,
                    energy_code: 1,
                    hvac_category: 1,
                }));

                // Call the predict_all endpoint
                const response = await fetch("http://localhost:5000/predict_all", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ buildings }),
                });

                if (!response.ok) {
                    throw new Error("Failed to refresh predictions");
                }

                const results = await response.json();
                console.log("API Results:", results);

                // Instead of reloading the page, update the map source
                // First, merge the predictions with the geojson data
                const predictionMap = new Map();
                results.forEach((pred: any) => {
                    predictionMap.set(pred.id, {
                        heating_load: pred.heating_load_prediction,
                        cooling_load: pred.cooling_load_prediction
                    });
                });

                // Update the geojson data with the predictions
                geojsonData.features.forEach((feature: any) => {
                    const prediction = predictionMap.get(feature.properties.id);
                    if (prediction) {
                        feature.properties.heating_load = prediction.heating_load;
                        feature.properties.cooling_load = prediction.cooling_load;
                    }
                });

                // Get the map instance from maplibregl
                const map = window.mapInstance;
                if (map && map.getSource('custom-buildings')) {
                    // Update the source data
                    (map.getSource('custom-buildings') as any).setData(geojsonData);

                    // Create a custom event to notify that predictions have been updated
                    const event = new CustomEvent('predictionsUpdated', {
                        detail: { geojsonData }
                    });
                    document.dispatchEvent(event);

                    alert(`Successfully refreshed predictions for ${results.length} buildings. Data updated on map.`);
                } else {
                    console.error("Map or custom-buildings source not found");
                    alert("Could not update map data. Try reloading the page.");
                }

            } catch (error: any) {
                console.error("Error in handleRefreshClick:", error);
                alert(`Error refreshing predictions:\n${error.message}`);
            }
        };

        const button = document.getElementById("hello-button");
        if (button) {
            button.addEventListener("click", handleClick);
        }

        // Add a refresh button
        const refreshButton = document.getElementById("refresh-button");
        if (refreshButton) {
            refreshButton.addEventListener("click", handleRefreshClick);
        }

        return () => {
            if (button) {
                button.removeEventListener("click", handleClick);
            }
            if (refreshButton) {
                refreshButton.removeEventListener("click", handleRefreshClick);
            }
        };
    }, [buildingHeight]);

    return null;
};

export default ButtonComponent;