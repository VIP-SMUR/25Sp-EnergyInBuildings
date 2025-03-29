import { calculateOrientation } from "./calculate_building_features/Rotation.ts";
import { calculateRoofArea } from "./calculate_building_features/RoofArea.ts";
import { mapBOCToModelIndex } from "./calculate_building_features/BuildingType.ts";


interface PredictionResponse {
    cooling_load_prediction?: number[];
    heating_load_prediction?: number[];
}


export const predict = async (
    feature: any // pass the whole feature, like those used in predictAll
): Promise<PredictionResponse> => {
    try {
        const coords =
            feature.geometry.type === "MultiPolygon"
                ? feature.geometry.coordinates[0]
                : feature.geometry.coordinates;

        const orientation = calculateOrientation(coords);
        const roofArea = calculateRoofArea(coords);
        const height = feature.properties.height || 3;
        const buildingType = mapBOCToModelIndex(feature.properties?.BOC);


        alert(`Sending API request for building ${feature.properties.id}...`);

        const response = await fetch("http://localhost:5000/predict", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                Building_Type: buildingType,
                Building_Shape: 1,
                Orientation: orientation,
                Building_Height: height,
                Building_Stories: 1,
                Wall_Area: 1,
                Window_Area: 1,
                Roof_Area: roofArea,
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



export const predictAll = async (
    geojsonInput?: string | GeoJSON.FeatureCollection
): Promise<{ geojsonData: any; results: any }> => {
    try {
        alert("Refreshing all building predictions...");

        let geojsonData: any;

        if (typeof geojsonInput === "string" || !geojsonInput) {
            const geoResponse = await fetch(geojsonInput || 'overture-building.geojson');
            geojsonData = await geoResponse.json();
        } else {
            geojsonData = geojsonInput;
        }

        const buildings = geojsonData.features.map((feature: any) => {
            const coords =
                feature.geometry.type === "MultiPolygon"
                    ? feature.geometry.coordinates[0]
                    : feature.geometry.coordinates;

            const orientation = calculateOrientation(coords);
            const roofArea = calculateRoofArea(coords);
            const buildingType = mapBOCToModelIndex(feature.properties?.BOC);

            return {
                id: feature.properties.id,
                Building_Type: buildingType,
                Building_Shape: 1,
                Orientation: orientation,
                Building_Height: feature.properties.height || 3,
                Building_Stories: 1,
                Wall_Area: 1,
                Window_Area: 1,
                Roof_Area: roofArea,
                energy_code: 1,
                hvac_category: 1,
            };
        });

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


