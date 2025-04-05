import { calculateOrientation } from '../../api/calculate_building_features/Rotation';
import { calculateRoofArea } from '../../api/calculate_building_features/RoofArea';
import { getDefaultHeight } from '../../api/calculate_building_features/BuildingHeight';
import { getDefaultStories } from '../../api/calculate_building_features/BuildingStory';
import { getHVACCategory } from '../../api/calculate_building_features/HVACCategory';
import { getEnergyCategory } from "../../api/calculate_building_features/EnergyCode";
import { calculateWallArea } from "../../api/calculate_building_features/WallArea";
import { calculateWindowArea } from "../../api/calculate_building_features/WindowArea";
import { indexToBuildingType } from '../../api/calculate_building_features/BuildingType';
import { defaultBuildingShape, detectBuildingShape } from '../../api/calculate_building_features/BuildingShape';

export function parseFeature(feature: any) {
  const id = feature?.properties?.id ?? 'Unknown';
  const properties = feature?.properties ?? {};
  const geometry = feature?.geometry;

  const height = getDefaultHeight(properties);
  const stories = getDefaultStories(properties);
  const hvacCategory = getHVACCategory(properties);
  const energyCode = getEnergyCategory(properties);
  const buildingTypeName = indexToBuildingType[properties.Building_Type] ?? "Unknown";

  let orientation = 0;
  let roofArea = 0;
  let wallArea = 0;
  let windowArea = 0;
  let buildingShape = defaultBuildingShape();

  if (geometry?.coordinates && geometry.type) {
    const coords =
      geometry.type === 'MultiPolygon'
        ? geometry.coordinates[0]
        : geometry.coordinates;

    orientation = calculateOrientation(coords);
    roofArea = calculateRoofArea(coords);
    wallArea = calculateWallArea(coords, height);
    windowArea = calculateWindowArea(properties, wallArea);
    buildingShape = detectBuildingShape(coords);
  }

  return {
    id,
    height,
    stories,
    hvacCategory,
    energyCode,
    roofArea,
    wallArea,
    orientation,
    windowArea,
    buildingShape,
    buildingTypeName,
  };
}


export const getMinMaxForMode = (data: any, mode: "cooling_load" | "heating_load") => {
  const values = data.features
    .map((f: any) => f.properties?.[mode])
    .filter((val: any) => typeof val === "number" && !isNaN(val));

  const min = Math.min(...values);
  const max = Math.max(...values);

  return { min, max };
};
