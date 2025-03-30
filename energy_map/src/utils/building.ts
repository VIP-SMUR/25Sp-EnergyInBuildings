import { calculateOrientation } from '../../api/calculate_building_features/Rotation';
import { calculateRoofArea } from '../../api/calculate_building_features/RoofArea';
import { getDefaultHeight } from '../../api/calculate_building_features/BuildingHeight';
import { getDefaultStories } from '../../api/calculate_building_features/BuildingStory';

export function parseFeature(feature: any) {
  const id = feature?.properties?.id ?? 'Unknown';
  const properties = feature?.properties ?? {};
  const geometry = feature?.geometry;

  const height = getDefaultHeight(properties);
  const stories = getDefaultStories(properties);

  let orientation = 0;
  let roofArea = 0;

  if (geometry?.coordinates && geometry.type) {
    const coords =
      geometry.type === 'MultiPolygon'
        ? geometry.coordinates[0]
        : geometry.coordinates;

    orientation = calculateOrientation(coords);
    roofArea = calculateRoofArea(coords);
  }

  return { id, height, stories, shapeArea: roofArea, orientation };
}
