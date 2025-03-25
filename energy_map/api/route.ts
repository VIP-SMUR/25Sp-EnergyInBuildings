// api.ts

interface PredictionResponse {
    cooling_load_prediction?: number[];
    heating_load_prediction?: number[];
}

export const predict = async (buildingHeight: number): Promise<PredictionResponse> => {
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

        // Fetch the GeoJSON data
        const geoResponse = await fetch(geojsonUrl);
        const geojsonData = await geoResponse.json();

        // Extract building data for prediction
        const buildings = geojsonData.features.map((feature: any) => ({
            id: feature.properties.id,
            Building_Type: 1,
            Building_Shape: feature.properties.Shape__Area || 0,
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

        // Merge the predictions with the geojson data
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
