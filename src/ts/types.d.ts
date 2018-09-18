import Accessor = require("esri/core/Accessor");
import Polyline = require("esri/geometry/Polyline");
import SceneView = require("esri/views/SceneView");

export interface State extends Accessor {
    displayLoading: boolean;
    selectedTrailId: string;
    setSelectedTrailId: (id: string) => void;
    currentBasemapId: string;
    view: SceneView;
    trails: Array<Trail>;
    online: boolean;
    trailCart: Array<Trail>;
}

export interface Trail {
    geometry: Polyline;
    name: string;
    trail_class: string;
    length_miles: number;
    steps_to_travel: number;
    id: string;
    hasZ: boolean;
    setZValues: (view: SceneView) => IPromise;
    createFlickrLayer: () => IPromise;
    setElevationValuesFromService: () => IPromise;
}
