import { calculateOrientation } from "./calculate_building_features/Rotation.ts";

interface PredictionResponse {
    cooling_load_prediction?: number[];
    heating_load_prediction?: number[];
}

// Helper to compute orientation from bbox, parsing if necessary.
function getOrientation(bbox: any): number {
    if (bbox) {
        const parsedBbox = typeof bbox === "string" ? JSON.parse(bbox) : bbox;
        return calculateOrientation(parsedBbox);
    }
    return 1;
}

/**
 * Single building prediction.
 * @param buildingHeight - The height of the building.
 * @param buildingShape - The shape area of the building.
 * @param bbox - Optional bounding box to compute orientation.
 */
export const predict = async (
    buildingHeight: number,
    buildingShape: number = 0,
    bbox?: any
): Promise<PredictionResponse> => {
    try {
        // Compute orientation using the same logic as predictAll.
        const orientation = getOrientation(bbox);

        alert(`Sending API request with Building Height: ${buildingHeight}m...`);

        const response = await fetch("http://localhost:5000/predict", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                Building_Type: 1,
                // Use the updated shape area rather than hard-coded 1.
                Building_Shape: buildingShape,
                Orientation: orientation,
                Building_Height: buildingHeight,
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

        return await response.json();
    } catch (error: any) {
        throw new Error(`Error during API call: ${error.message}`);
    }
};

export const predictAll = async (geojsonUrl: string = 'overture-building.geojson'): Promise<{ geojsonData: any; results: any; }> => {
    try {
        alert("Refreshing all building predictions...");

        // Fetch the GeoJSON data.
        const geoResponse = await fetch(geojsonUrl);
        const geojsonData = await geoResponse.json();

        // Extract building data for prediction.
        const buildings = geojsonData.features.map((feature: any) => {
            // Compute orientation: if bbox exists (as string or object), use it.
            // Get coordinates from MultiPolygon or Polygon
            const coords =
                feature.geometry.type === "MultiPolygon"
                    ? feature.geometry.coordinates[0] // Use first polygon
                    : feature.geometry.coordinates;

            const orientation = calculateOrientation(coords);

            return {
                id: feature.properties.id,
                Building_Type: 1,
                // Use the shape area from the geojson, falling back to 0 if not present.
                Building_Shape: feature.properties.Shape__Area || 0,
                Orientation: orientation,
                Building_Height: feature.properties.height || 3,
                Building_Stories: 1,
                Wall_Area: 1,
                Window_Area: 1,
                Roof_Area: 1,
                energy_code: 1,
                hvac_category: 1,
            };
        });

        // Call the predict_all endpoint.
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

        // Merge the predictions with the geojson data.
        const predictionMap = new Map();
        results.forEach((pred: any) => {
            predictionMap.set(pred.id, {
                heating_load: pred.heating_load_prediction,
                cooling_load: pred.cooling_load_prediction,
            });
        });

        geojsonData.features.forEach((feature: any) => {
            const prediction = predictionMap.get(feature.properties.id);
            if (prediction) {
                feature.properties.heating_load = prediction.heating_load;
                feature.properties.cooling_load = prediction.cooling_load;
            }
        });

        return { geojsonData, results };
    } catch (error: any) {
        throw new Error(`Error refreshing predictions: ${error.message}`);
    }
};
