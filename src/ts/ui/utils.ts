import * as geometryEngine from "esri/geometry/geometryEngine";

export function getIntersectingTrails(trails) {
    const intersections = [];
    const groups = [];
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
    }

    // Group trails based on connectivity
    const adjlist = convert_edgelist_to_adjlist(intersections);
    for (v in adjlist) {
        if (adjlist.hasOwnProperty(v) && !visited[v]) {
            groups.push(bfs(v, adjlist, visited));
        }
    }

    // Find values in trail that are not grouped.
    trails.forEach(trail => {
        for (const group of groups) {

            if (!group.includes(trail.id)) {
                noGroups.push(trail.id);
                break;
            }
        }
    });


    return {
        trails: trails,
        intersections: {
            "groups": groups,
            "no-groups": noGroups
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
