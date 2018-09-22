export function getIntersectingTrails(trails) {
  const intersections = [];

  // if (trails.length > 1) {
  //   trails.forEach(function(trail, i) {
  //     if (i !== (trails.length - 1) ) {
  //       const comparision = findOne(trail.geometry.paths[0], trails[i + 1].geometry.paths[0]);
  //       if (comparision) {
  //         intersections.push( [trail[i], trail[i + 1]] );
  //       }
  //     }
  //   });
  // }

  return {
    trails: trails,
    intersections: intersections
  };
}

const findOne = function(haystack, arr) {
  return arr.some( function(v) {
      return haystack.indexOf(v) >= 0;
  });
};
