import * as geometryEngine from "esri/geometry/geometryEngine";
import * as Graphic from "esri/Graphic";

export function getIntersectingTrails(trails) {
    const intersections = [];
    const groups = [];
    const groupedIds = [];
    const noGroups = [];
    const visited = {};
    let v;

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
        // Group trails based on connectivity and return ID
        const adjlist = convert_edgelist_to_adjlist(intersections);
        for (v in adjlist) {
            if (adjlist.hasOwnProperty(v) && !visited[v]) {
                groupedIds.push(bfs(v, adjlist, visited));
            }
        }

        // ID trail id to retrieve trail.
        groupedIds.forEach(group => {
            const singleGroup = [];
            for (const trailid of group) {
                for (const trail of trails) {
                    if (trail.id === trailid) {
                        singleGroup.push(trail);
                        break;
                    }
                }
            }
            groups.push(singleGroup);
        });

        // Find values in trail that are not grouped.
        const flatGroup = [].concat.apply([], groupedIds);
        trails.forEach(trail => {
            if (!flatGroup.includes(trail.id)) {
                noGroups.push(trail);
            }
        });
    } else {
        if (trails.length === 1) {
            noGroups.push(trails[0]);
        }
    }

    return {
        intersections: {
            "groups": groups,
            "noGroups": noGroups
        }
    };

}
const convert_edgelist_to_adjlist = function(edgelist) {
    const adjlist = {};
    let i, len, pair, u, v;
    for (i = 0, len = edgelist.length; i < len; i += 1) {
        pair = edgelist[i];
        u = pair[0];
        v = pair[1];
        if (adjlist[u]) {
            // append vertex v to edgelist of vertex u
            adjlist[u].push(v);
        } else {
            // vertex u is not in adjlist, create new adjacency list for it
            adjlist[u] = [v];
        }
        if (adjlist[v]) {
            adjlist[v].push(u);
        } else {
            adjlist[v] = [u];
        }
    }
    return adjlist;
};
// Breadth First Search using adjacency list
const bfs = function(v, adjlist, visited) {
    const q = [];
    const current_group = [];
    let i, len, adjV, nextVertex;
    q.push(v);
    visited[v] = true;
    while (q.length > 0) {
        v = q.shift();
        current_group.push(v);
        // Go through adjacency list of vertex v, and push any unvisited
        // vertex onto the queue.
        // This is more efficient than our earlier approach of going
        // through an edge list.
        adjV = adjlist[v];
        for (i = 0, len = adjV.length; i < len; i += 1) {
            nextVertex = adjV[i];
            if (!visited[nextVertex]) {
                q.push(nextVertex);
                visited[nextVertex] = true;
            }
        }
    }
    return current_group;
};

export function createRouteSymbol(node, trails) {
    let route = [];
    let routeIds = node.target.dataset.routeids;
    routeIds = routeIds.split(',');

    routeIds.forEach((id) => {
        route.push(trails.filter((trail) => { return trail.id === id; })[0].geometry);
    });

    const routeGeometry = geometryEngine.union(route);

    const polylineSymbol = {
        type: "simple-line",  // autocasts as SimpleLineSymbol()
        color: [255, 221, 0],
        width: 4
    };

    const polylineAtt = {
        Name: "Keystone Pipeline",
        Owner: "TransCanada"
    };

    const polylineGraphic = new Graphic({
        geometry: routeGeometry,
        symbol: polylineSymbol,
        attributes: polylineAtt
    });
    return polylineGraphic;
}

