import Accessor = require("esri/core/Accessor");
import SceneView = require("esri/views/SceneView");
import { Trail } from "./types";
import {
    subclass,
    declared,
    property
} from "esri/core/accessorSupport/decorators";

@subclass()
export default class State extends declared(Accessor) {

    @property()
    displayLoading: boolean = true;

    @property()
    selectedTrailId: string = null;
    setSelectedTrailId(id: string) {
        this.selectedTrailId = id;
    }

    @property()
    trailRoute: Array<Trail> = null;

    setTrailRoutes(value: Array<Trail>) {
        const oldValue = this._get<Array<Trail>>("trailRoute");
        if (oldValue !== value) {
            this._set("trailRoute", value);
        }
    }

    @property()
    currentBasemapId: string = null;

    @property()
    view: SceneView = null;

    @property()
    trails: Array<Trail> = null;

    @property()
    online: boolean = true;
}
