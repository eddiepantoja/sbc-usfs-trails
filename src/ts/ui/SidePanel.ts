import * as dom from "dojo/dom";
import * as on from "dojo/on";
import * as domConstruct from "dojo/dom-construct";
import * as domClass from "dojo/dom-class";
import * as query from "dojo/query";

import config from "../config";
import { State, Trail } from "../types";
import * as SceneView from "esri/views/SceneView";
import * as WebScene from "esri/WebScene";

import "../../style/side-panel.scss";

export default class SidePanel {
    trails: Array<Trail>;
    state: State;
    detailsContainer: any;
    routesContainer: any;

    constructor(state: State) {

        this.state = state;
        this.trails = state.trails;

        this.detailsContainer = dom.byId("detailPanel");
        this.routesContainer = dom.byId("routesPanel");

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

        // TODO: Add Observable
        state.watch("trailRoute", (trails) => {
          this.displayRoutes(trails);
        });

        on(document.querySelector("#routesPanel"), '.removeTrail:click', function(evt) {
          const trailid = evt.target.dataset.trailid;
          const trailRoute = state.trailRoute;

          if ( trailRoute ) {
            for (const i in trailRoute) {
              if (trailRoute[i].id === trailid) {
                delete trailRoute[i];
              }
            }
            state.set("trailRoute", trailRoute);
            query('[data-trailID|=\"' + trailid + '\"]').style("display", "none");
          }
        });
    }

    // Add trail to Route
    addRouteEvent(state, trails) {
      on(document.querySelector("#addRoute"), "click", (evt) => {
        const trailID = evt.target.dataset.trailid;
        const selectedTrail = trails.filter((trail) => { return trail.id === trailID; })[0];
        const trailRoute = state.trailRoute;

        if ( !trailRoute ) {
          // Add trail to route.
          state.setTrailRoutes([selectedTrail]);
        } else {
          // Check to see if trial in Route.
          const found = trailRoute.some( function(el) {
            return el.id === trailID;
          });

          if (!found) {
            trailRoute.push(selectedTrail);
            state.setTrailRoutes(trailRoute);
            this.displayRoutes(state.trailRoute);
          }
        }
      });
    }

    emptyDetails() {
        domConstruct.empty(this.detailsContainer);
        this.displayAppInfo();
    }

    displayAppInfo() {
        this.detailsContainer.innerHTML = "<div class='detail-placeholder'>Select a hike in the map to see details.</div>";
    }

    displayInfo(trail: Trail): void {
        this.detailsContainer.innerHTML = `
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
      let content = "";
      trails.forEach(function(trail) {
        content +=  `<div class="route" data-trailID="${trail.id}">`;
          content +=  `<span class="routeTitle">${trail.name}</span><br />`;
          content +=  `<span class="routeClass">${trail.trail_class}</span><br />`;
          content +=  `<span class="routeSteps">${trail.steps_to_travel}</span><br />`;
          content +=  `<span class="routeLength">${trail.length_miles}</span><br />`;
          content +=  `<button class="removeTrail" data-trailID="${trail.id}">Remove Trail</button>`;
        content +=  `</div>`;
      });
      this.routesContainer.innerHTML = content;
    }
}
