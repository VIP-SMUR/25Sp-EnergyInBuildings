import { calculateOrientation } from '../../api/calculate_building_features/Rotation';
import { calculateRoofArea } from '../../api/calculate_building_features/RoofArea';
import {defaultBuildingShape, detectBuildingShape} from '../../api/calculate_building_features/BuildingShape';

export function parseFeature(feature: any) {
  const id = feature?.properties?.id ?? 'Unknown';
  const height = feature?.properties?.height ?? 3;
  const geometry = feature?.geometry;

  let orientation = 0;
  let roofArea = 0;
  let buildingShape = defaultBuildingShape();

  if (geometry?.coordinates && geometry.type) {
    const coords =
      geometry.type === 'MultiPolygon'
        ? geometry.coordinates[0]
        : geometry.coordinates;

    orientation = calculateOrientation(coords);
    roofArea = calculateRoofArea(coords); // ✅ Always calculated from geometry

    // Detect BuildingShape
    buildingShape = detectBuildingShape(coords);
  }

  return { id, height, shapeArea: roofArea, orientation, buildingShape};
}
