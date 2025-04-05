import { calculateOrientation } from "./calculate_building_features/Rotation.ts";
import { calculateRoofArea } from "./calculate_building_features/RoofArea.ts";
import { mapBOCToModelIndex } from "./calculate_building_features/BuildingType.ts";
import { getDefaultHeight } from "./calculate_building_features/BuildingHeight.ts";
import { getDefaultStories } from "./calculate_building_features/BuildingStory.ts";
import { getHVACCategory } from "./calculate_building_features/HVACCategory.ts";
import { getEnergyCategory } from "./calculate_building_features/EnergyCode.ts";
import { calculateWallArea } from "./calculate_building_features/WallArea.ts";
import { calculateWindowArea } from "./calculate_building_features/WindowArea";
import { detectBuildingShape } from "./calculate_building_features/BuildingShape.ts";

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
        const height = getDefaultHeight(feature.properties);
        const buildingType = feature.properties.Building_Type ?? mapBOCToModelIndex();
        const stories = getDefaultStories(feature.properties);
        const hvacCategory = getHVACCategory(feature.properties);
        const energyCode = getEnergyCategory(feature.properties);
        const wallArea = calculateWallArea(coords, height);
        const windowArea = calculateWindowArea(feature.properties, wallArea);




        // Get building shape using the new detection function
        const shapeResult = detectBuildingShape(coords);
        const buildingShape = shapeResult.shapeType;

        alert(`Sending API request for building ${feature.properties.id}...`);

        const response = await fetch("http://localhost:5000/predict", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                Building_Type: buildingType,
                Building_Shape: buildingShape,
                Orientation: orientation,
                Building_Height: height,
                Building_Stories: stories,
                Wall_Area: wallArea,
                Window_Area: windowArea,
                Roof_Area: roofArea,
                energy_code: energyCode,
                hvac_category: hvacCategory,
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
            const buildingType = mapBOCToModelIndex();
            feature.properties.Building_Type = buildingType;
            const height = getDefaultHeight(feature.properties);
            const stories = getDefaultStories(feature.properties);
            const hvacCategory = getHVACCategory(feature.properties);
            const energyCode = getEnergyCategory(feature.properties);
            const wallArea = calculateWallArea(coords, height);
            const windowArea = calculateWindowArea(feature.properties, wallArea);



            // Get building shape using the new detection function
            const shapeResult = detectBuildingShape(coords);
            const buildingShape = shapeResult.shapeType;

            return {
                id: feature.properties.id,
                Building_Type: buildingType,
                Building_Shape: buildingShape,
                Orientation: orientation,
                Building_Height: height,
                Building_Stories: stories,
                Wall_Area: wallArea,
                Window_Area: windowArea,
                Roof_Area: roofArea,
                energy_code: energyCode,
                hvac_category: hvacCategory,
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


