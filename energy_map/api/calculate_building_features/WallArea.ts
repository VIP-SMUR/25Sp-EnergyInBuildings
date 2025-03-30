import * as turf from "@turf/turf";

export type Coordinate = [number, number];

// calculates wall area by summing edge lengths × height around the perimeter of the building

export const calculateWallArea = (
    coordinates: Coordinate[][],
    height: number
): number => {
    if (
        !coordinates ||
        !Array.isArray(coordinates) ||
        coordinates.length === 0
    ) {
        console.warn("Invalid coordinates provided to calculateWallArea");
        return 1; // fallback wall area
    }

    const ring = coordinates[0]; // outer ring of footprint

    if (!ring || ring.length < 2) {
        console.warn("Not enough points in coordinate ring to calculate wall area");
        return 1;
    }

    let wallArea = 0;

    for (let i = 0; i < ring.length - 1; i++) {
        const p1 = ring[i];
        const p2 = ring[i + 1];

        const edgeLength = turf.distance(turf.point(p1), turf.point(p2), {
            units: "meters",
        });

        wallArea += edgeLength * height;
    }

    return wallArea;
};
