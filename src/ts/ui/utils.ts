import * as geometryEngine from "esri/geometry/geometryEngine";

export function getIntersectingTrails(trails) {
    const intersections = [];

    if (trails.length > 1) {
        for (let i = 0; i < trails.length - 1; i++) {
            for (let j = i + 1; j < trails.length; j++) {
                const val1 = trails[i].geometry;
                const val2 = trails[j].geometry;
                const comparision = geometryEngine.intersects(val1, val2);
                if (comparision) {
                    intersections.push([trails[i].id, trails[j].id]);
                }
            }
        }
    }

    if (intersections) {
        for (let i = 0; i < intersections.length - 1; i++) {
            for (let j = i + 1; j < intersections.length; j++) {
                const val1 = intersections[i];
                const val2 = intersections[j];
                // TODO: Combine Arrays if shared values

            }
        }
    }

    return {
        trails: trails,
        intersections: intersections
    };

}