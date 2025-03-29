import * as turf from '@turf/turf';
// in summary, rotation is calculated by first finding the longest edge relative to the positive x-axis

export type Coordinate = [number, number];

export const calculateOrientation = (coordinates: Coordinate[][]): number => {
    if (!coordinates || !Array.isArray(coordinates) || coordinates.length === 0) {
        console.warn("Invalid coordinates provided to calculateOrientation");
        return 0; // fallback angle
    }

    const ring = coordinates[0]; // picks outer ring

    if (!ring || ring.length < 2) {
        console.warn("Not enough points in coordinate ring to calculate orientation");
        return 0;
    }

    let maxLength = 0;
    let angle = 0;

    for (let i = 0; i < ring.length - 1; i++) {
        const p1 = ring[i];
        const p2 = ring[i + 1];

        const len = turf.distance(turf.point(p1), turf.point(p2));
        if (len > maxLength) {
            maxLength = len;
            const dx = p2[0] - p1[0];
            const dy = p2[1] - p1[1];
            angle = Math.atan2(dy, dx) * (180 / Math.PI);
        }
    }

    if (angle < 0) angle += 360;
    let quantized = Math.round(angle / 45) * 45; //ends up being 0, 45, 90, 135, 180, 225, 270, 315, (not 360, it turns to 0 degrees)
    if (quantized === 360) quantized = 0; // if quantized is 360, then it turns it to 0

    return quantized;
};
