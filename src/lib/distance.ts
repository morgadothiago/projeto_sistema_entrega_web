export interface Point {
    latitude: number
    longitude: number
}

// Converts numeric degrees to radians
function toRad(value: number): number {
    return (value * Math.PI) / 180
}

/**
 * Calculates the distance between two points using the Haversine formula.
 * Returns the distance in kilometers.
 */
export function calculateDistanceBetweenPoints(
    start: Point,
    end: Point
): number {
    const R = 6371 // Earth radius in km

    const dLat = toRad(end.latitude - start.latitude)
    const dLon = toRad(end.longitude - start.longitude)

    const lat1 = toRad(start.latitude)
    const lat2 = toRad(end.latitude)

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c
}

/**
 * Calculates the total distance of a route composed of multiple points.
 * Returns the distance in kilometers.
 */
export function calculateTotalDistance(points: Point[]): number {
    if (points.length < 2) return 0

    let totalDistance = 0
    for (let i = 0; i < points.length - 1; i++) {
        totalDistance += calculateDistanceBetweenPoints(points[i], points[i + 1])
    }

    return totalDistance
}
