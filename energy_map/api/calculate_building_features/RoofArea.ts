import * as turf from '@turf/turf';

export type Coordinate = [number, number];

/**
 * Calculates the roof area (in square meters) from GeoJSON-style coordinates
 * using Turf.js
 *
 * @param coordinates - A Coordinate[][] representing a polygon's rings
 * @returns Roof area in square meters
 */
export const calculateRoofArea = (coordinates: Coordinate[][]): number => {
    if (!coordinates || !Array.isArray(coordinates) || coordinates.length === 0) {
        console.warn("Invalid coordinates provided to calculateRoofArea");
        return 0;
    }

    try {
        const polygon = turf.polygon([coordinates[0]]);
        return turf.area(polygon);
    } catch (error) {
        console.error("Error calculating roof area with Turf:", error);
        return 0;
    }
};
