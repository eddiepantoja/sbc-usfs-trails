import * as dom from "dojo/dom";
import * as on from "dojo/on";
import * as domConstruct from "dojo/dom-construct";
import * as domClass from "dojo/dom-class";
import config from "../config";
import { State, Trail } from "../types";
import * as SceneView from "esri/views/SceneView";
import * as WebScene from "esri/WebScene";

import "../../style/side-panel.scss";

export default class SidePanel {
    trails: Array<Trail>;
    state: State;
    container: any;
    detailName: any;
    detailClass: any;
    detailSteps: any;
    detailLength: any;

    constructor(state: State) {

        this.state = state;
        this.trails = state.trails;

        this.container = dom.byId("detailPanel");

        this.emptyDetails();

        state.watch("selectedTrailId", (id) => {
            this.emptyDetails();
            if (id) {
                const selectedTrail = this.trails.filter((trail) => { return trail.id === id; })[0];
                this.displayInfo(selectedTrail);
            }
        });

    }

    emptyDetails() {
        domConstruct.empty(this.container);

        this.displayAppInfo();
    }

    displayAppInfo() {
        this.container.innerHTML = "<div class='detail-placeholder'>Select a hike in the map to see details.</div>";
    }

    displayInfo(trail: Trail): void {
        this.container.innerHTML = `
            <div class="detailContent">
                <div id="detailTitle">${trail.name}</div>
                <div id="detailClass"><b>Class: </b> ${trail.trail_class}</div>
                <div id="detailSteps"><b>Steps: </b> ${trail.steps_to_travel}</div>
                <div id="detailLength"><b>Distance: </b> ${trail.length_miles} mi</div>
                <button id="addRoute" trail-id="${trail.id}">Add to Route</button>
            </div>
        `;
    }
}
