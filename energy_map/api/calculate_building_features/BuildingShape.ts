import * as turf from '@turf/turf';

export type Coordinate = [number, number];
type BuildingShape = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

/**
 * Shape Type Legend:
 * 0 -> Square
 * 1 -> Wide Rectangle
 * 2 -> Narrow Rectangle
 * 3 -> Rectangle/Square with courtyard
 * 4 -> H shaped
 * 5 -> U Shaped
 * 6 -> E Shaped
 * 7 -> T Shaped
 * 8 -> L Shaped
 * 9 -> +/Cross Shaped
 * 10 -> Other
 */

export interface ShapeDetectionResult {
    shapeType: BuildingShape;
    shapeTypeName: string;
    aspectRatio: number;
    complexity: number;
    convexityRatio: number;
    hasCourtyard: boolean;
}

export const defaultBuildingShape = (): ShapeDetectionResult => ({
    shapeType: 10, // Default to "Other"
    shapeTypeName: "Default Other",
    aspectRatio: 0,
    complexity: 0,
    convexityRatio: 0,
    hasCourtyard: false
});


/**
 * Determines building shape type based on polygon geometry
 * @param coordinates The coordinates of the building polygon
 * @returns The detected building shape type (0-10)
 */
export const detectBuildingShape = (coordinates: Coordinate[][]): ShapeDetectionResult => {
    if (!coordinates || !coordinates[0] || coordinates[0].length < 4) {
        //console.warn("Invalid coordinates provided to detectBuildingShape");
        return {
            shapeType: 10, // Other
            shapeTypeName: "Other No Coords",
            aspectRatio: 0,
            complexity: 0,
            convexityRatio: 0,
            hasCourtyard: false
        };
    }

    // Create a polygon from coordinates
    const polygon = turf.polygon([coordinates[0]]);

    // Get the minimum bounding rectangle
    const bbox = turf.bbox(polygon);
    // const minBoundingRect = turf.bboxPolygon(bbox); //Use in later iterations of detections

    // Calculate aspect ratio (width/height)
    const width = bbox[2] - bbox[0];
    const height = bbox[3] - bbox[1];
    const aspectRatio = width / height;

    // Get area and perimeter
    const area = turf.area(polygon);
    const perimeter = turf.length(turf.polygonToLine(polygon), { units: 'meters' });

    // Calculate complexity ratio (perimeter^2 / area)
    // High values indicate complex shapes with many corners
    const complexity = Math.pow(perimeter, 2) / area;

    // Calculate convexity - ratio of area to convex hull area
    // Lower values indicate shapes with indentations
    const convexHull = turf.convex(turf.explode(polygon));
    const convexHullArea = convexHull ? turf.area(convexHull) : area;
    const convexityRatio = area / convexHullArea;

    // Check for courtyard by looking for holes
    const hasCourtyard = coordinates.length > 1;

    // Determine shape type based on calculated metrics
    let shapeType: BuildingShape;
    let shapeTypeName: string;

    // Courtyard check
    if (hasCourtyard) {
        shapeType = 3; // Rectangle/Square with courtyard
        shapeTypeName = "Rectangle/Square with courtyard";
    }
    // Square check - aspect ratio close to 1 and high convexity
    else if (0.9 <= aspectRatio && aspectRatio <= 1.1 && convexityRatio > 0.9) {
        shapeType = 0; // Square
        shapeTypeName = "Square";
    }
    // Wide Rectangle
    else if (aspectRatio > 1.5 && convexityRatio > 0.9) {
        shapeType = 1; // Wide Rectangle
        shapeTypeName = "Wide Rectangle";
    }
    // Narrow Rectangle
    else if (aspectRatio < 0.67 && convexityRatio > 0.9) {
        shapeType = 2; // Narrow Rectangle
        shapeTypeName = "Narrow Rectangle";
    }
    // Regular Rectangle (not square, wide or narrow)
    else if (convexityRatio > 0.9) {
        shapeType = 1; // Default to Wide Rectangle for regular rectangles
        shapeTypeName = "Rectangle";
    }
    // L-shaped (specific convexity range and complexity)
    else if (0.7 <= convexityRatio && convexityRatio <= 0.85 && complexity > 16) {
        shapeType = 8; // L Shaped
        shapeTypeName = "L Shaped";
    }
    // T-shaped
    else if (0.75 <= convexityRatio && convexityRatio <= 0.85 && complexity > 18) {
        shapeType = 7; // T Shaped
        shapeTypeName = "T Shaped";
    }
    // U-shaped (more indented)
    else if (0.6 <= convexityRatio && convexityRatio <= 0.75) {
        shapeType = 5; // U Shaped
        shapeTypeName = "U Shaped";
    }
    // H-shaped (complex with specific convexity)
    else if (0.6 <= convexityRatio && convexityRatio <= 0.7 && complexity > 20) {
        shapeType = 4; // H shaped
        shapeTypeName = "H Shaped";
    }
    // E-shaped (very complex)
    else if (0.5 <= convexityRatio && convexityRatio <= 0.65 && complexity > 22) {
        shapeType = 6; // E Shaped
        shapeTypeName = "E Shaped";
    }
    // Cross/+ shaped
    else if (0.4 <= convexityRatio && convexityRatio <= 0.7 && complexity > 24) {
        shapeType = 9; // +/Cross Shaped
        shapeTypeName = "Cross Shaped";
    }
    // Default to "Other" for shapes that don't match defined categories
    else {
        shapeType = 10; // Other
        shapeTypeName = "Other";
    }

    return {
        shapeType,
        shapeTypeName,
        aspectRatio,
        complexity,
        convexityRatio,
        hasCourtyard
    };
};