import config from "../config";
import * as Polyline from "esri/geometry/Polyline";
import * as geometryEngine from "esri/geometry/geometryEngine";
import * as Deferred from "dojo/Deferred";
import State from "../State";

export default class Trail {

    geometry: Polyline;
    elevationIsSet;
    profileData: Array<any>;
    segments: any;
    state: State;
    minElevation: any;
    maxElevation: any;

    constructor(feature, state) {
        this.geometry = feature.geometry;
        this.state = state;
        this.elevationIsSet = null;
        // add attribute data based on the mapping in the configuration file
        const attributeMap = config.data.trailAttributes;
        for (const prop in attributeMap) {
            this[prop] = feature.attributes[attributeMap[prop]];
        }
    }

}
