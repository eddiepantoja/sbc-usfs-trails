import Accessor = require("esri/core/Accessor");
import SceneView = require("esri/views/SceneView");
import { Trail } from "./types";
import { subclass, declared, property } from "esri/core/accessorSupport/decorators";

@subclass()
export default class State extends declared(Accessor) {

    @property()
    displayLoading: boolean = true;

    @property()
    selectedTrailId: string = null;
    setSelectedTrailId(ID: string) {
        this.selectedTrailId = ID;
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
