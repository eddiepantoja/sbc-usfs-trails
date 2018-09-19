import * as dom from "dojo/dom";
import * as on from "dojo/on";
import * as domConstruct from "dojo/dom-construct";
import * as domClass from "dojo/dom-class";
import * as array from "dojo/_base/array";
import config from "../config";
import { State, Trail } from "../types";
import trailRoute from "../data/trailRoute";
import * as SceneView from "esri/views/SceneView";
import * as WebScene from "esri/WebScene";

import "../../style/side-panel.scss";

export default class SidePanel {
    trails: Array<Trail>;
    state: State;
    container: any;

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

              // Add trails to trailRoute
              this.addRouteEvent(this.state, this.trails);
            }
        });

        state.watch("trailRoute", (Trail) => {
          console.log("Trail updated: " + Trail);
        });

    }

    // Add trail to Route
    addRouteEvent(state, trails) {
      on(document.querySelector("#addRoute"), "click", (evt) => {
        const trailID = evt.target.dataset.trailid;
        const selectedTrail = trails.filter((trail) => { return trail.id === trailID; })[0];
        const trailRoute = state.trailRoute;

        if ( !trailRoute ) {
          state.trailRoute = [selectedTrail];
        } else {
          const found = trailRoute.some( function(el) {
            return el.id === trailID;
          });

          if (!found) {
            trailRoute.push(selectedTrail);
            state.trailRoute = trailRoute;
          }
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
                <button id="addRoute" data-trailId="${trail.id}">Add to Route</button>
            </div>
        `;
    }

    displayRoutes(trails) {
      console.log(trails);
    }
}
