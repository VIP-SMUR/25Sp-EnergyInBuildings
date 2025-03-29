import { calculateOrientation } from '../../api/calculate_building_features/Rotation';
import { calculateRoofArea } from '../../api/calculate_building_features/RoofArea';

export function parseFeature(feature: any) {
  const id = feature?.properties?.id ?? 'Unknown';
  const height = feature?.properties?.height ?? 3;
  const geometry = feature?.geometry;

  let orientation = 0;
  let roofArea = 0;

  if (geometry?.coordinates && geometry.type) {
    const coords =
      geometry.type === 'MultiPolygon'
        ? geometry.coordinates[0]
        : geometry.coordinates;

    orientation = calculateOrientation(coords);
    roofArea = calculateRoofArea(coords); // ✅ Always calculated from geometry
  }

  return { id, height, shapeArea: roofArea, orientation };
}
