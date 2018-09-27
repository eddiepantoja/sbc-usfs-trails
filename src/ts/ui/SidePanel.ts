import * as dom from "dojo/dom";
import * as on from "dojo/on";
import * as domConstruct from "dojo/dom-construct";
import * as domClass from "dojo/dom-class";
import * as query from "dojo/query";
import * as mouse from "dojo/mouse";

import config from "../config";
import { State, Trail } from "../types";
import * as SceneView from "esri/views/SceneView";
import * as WebScene from "esri/WebScene";
import * as GraphicsLayer from "esri/layers/GraphicsLayer";
import * as Graphic from "esri/Graphic";

import {
    getIntersectingTrails,
    createRouteSymbol
} from "./utils";

import "../../style/side-panel.scss";

export default class SidePanel {
    trails: Array<Trail>;
    state: State;
    detailsContainer: any;
    routesContainer: any;

    constructor(state: State, scene) {

        this.state = state;
        this.trails = state.trails;

        this.detailsContainer = dom.byId("detailPanel");
        this.routesContainer = dom.byId("routesPanel");

        this.emptyDetails();
        const graphicsLayer = new GraphicsLayer();
        scene.view.map.add(graphicsLayer);

        state.watch("selectedTrailId", (id) => {
            graphicsLayer.removeAll();
            this.emptyDetails();
            if (id) {
                const selectedTrail = this.trails.filter((trail) => { return trail.id === id; })[0];
                this.displayInfo(selectedTrail);

                // Add trails to trailRoute
                this.addRouteEvent(this.state, this.trails);
            }
        });

        // Watches for changes in trailRoute and executes dispalyRoutes
        state.watch("trailRoute", (value) => {
            // TODO: sort and do magic before routes are disalyed
            this.displayRoutes(getIntersectingTrails(value));
        });

        on(document.querySelector("#routesPanel"), ".removeTrail:click", function(evt) {
            const trailid = evt.target.dataset.trailid;
            const trailRoute = state.trailRoute;

            if (trailRoute) {
                trailRoute.forEach(function(value, i) {
                    if (value.id === trailid) {
                        trailRoute.splice(i, 1);
                    }
                });
                state.setTrailRoutes(trailRoute.slice());
            }
        });

        on(document.querySelector("#routesPanel"), ".no-group:click", function(evt) {
            const trailid = evt.target.dataset.trailid;
            state.setSelectedTrailId(trailid);
        });

        on(document.querySelector("#routesPanel"), ".group:click", function(evt) {
            const trailid = evt.target.dataset.trailid;
            if (trailid) {
                state.setSelectedTrailId(trailid);
            } else {
                graphicsLayer.removeAll();
                const geometry = createRouteSymbol(evt, state.trails);
                graphicsLayer.add(geometry);
                scene.view.goTo(
                    { target: geometry, tilt: 60 },
                    { speedFactor: 0.5 }
                );
            }
        });
    }

    // Add trail to Route
    addRouteEvent(state, trails) {
        on(document.querySelector("#addRoute"), "click", (evt) => {
            const trailid = evt.target.dataset.trailid;
            const selectedTrail = trails.filter((trail) => { return trail.id === trailid; })[0];
            const trailRoute = state.trailRoute;

            if (!trailRoute) {
                // Add trail to route.
                state.setTrailRoutes(new Array(selectedTrail));
            } else {
                // Check to see if trial in Route.
                const found = trailRoute.some(function(el) {
                    return el.id === trailid;
                });

                if (!found) {
                    trailRoute.push(selectedTrail);
                    state.setTrailRoutes(trailRoute.slice());
                }
            }
        });
    }

    // removes active trail in dom and cshows displayAppInfo
    emptyDetails() {
        domConstruct.empty(this.detailsContainer);
        this.displayAppInfo();
    }

    // Updates dom to show when trail is not selected
    displayAppInfo() {
        this.detailsContainer.innerHTML = "<div class='detail-placeholder'>Select a trail to see details.</div>";
    }

    // Updates Currently selected trail in dom
    displayInfo(trail: Trail): void {
        this.detailsContainer.innerHTML = `
            <div class="detailContent">
                <div id="detailTitle">${trail.name}</div>
                <div id="detailClass">Class: ${trail.trail_class}</div>
                <div class="row">
                  <div id="detailLength" class="column"><i class="fas fa-route"></i><br />${trail.length_miles.toLocaleString("en", { maximumFractionDigits: 2 })} mi</div>
                  <div id="detailSteps" class="column"><i class="fas fa-shoe-prints"></i><br />${trail.steps_to_travel.toLocaleString("en", { maximumFractionDigits: 2 })}</div>
                </div>
                <button id="addRoute" data-trailId="${trail.id}">Add to Route</button>
            </div>
        `;
    }

    // Updates Routes in Dom
    displayRoutes(value) {
        const noGroups = value.intersections.noGroups;
        const groups = value.intersections.groups;
        let content = "";
        if (groups.length >= 1) {
            groups.forEach((group, index) => {
                let routeLength = 0;
                let routeSteps = 0;
                const routeArray = [];

                group.forEach((trail) => {
                    routeArray.push(trail.id);
                });

                content += `
                  <div class="route group group-${index + 1}" data-routeIDs="${routeArray}">
                    <div class="route-heading">Route ${index + 1}</div>
                `;

                group.forEach((trail) => {
                    routeLength += trail.length_miles;
                    routeSteps += trail.steps_to_travel;

                    content += `
                      <div class="group-single" data-trailID="${trail.id}">
                        <div class="routeTitle">${trail.name}</div>
                        <i class="far fa-window-close removeTrail" data-trailID="${trail.id}"></i>
                      </div>`;
                });
                content += `
                    <div class="row">
                      <div class="routeLength column"><i class="fas fa-route"></i><br />${routeLength.toLocaleString("en", { maximumFractionDigits: 2 })} mi</div>
                      <div class="routeSteps column"><i class="fas fa-shoe-prints"></i><br />${routeSteps.toLocaleString("en", { maximumFractionDigits: 2 })}</div>
                    </div>
                  </div>
                `;
            });
        }
        if (noGroups.length >= 1) {
            content += `<div class="route-heading no-route">Not in Route</div>`;
            noGroups.forEach((trail, index) => {
                content += `
                  <div class="route no-group no-group-${index + 1}" data-trailID="${trail.id}">
                    <div class="routeTitle">${trail.name}</div>
                    <div class="routeClass">Class: ${trail.trail_class}</div>
                    <div class="row">
                      <div class="routeLength column"><i class="fas fa-route"></i><br />${trail.length_miles.toLocaleString("en", { maximumFractionDigits: 2 })} mi</div>
                      <div class="routeSteps column"><i class="fas fa-shoe-prints"></i><br />${trail.steps_to_travel.toLocaleString("en", { maximumFractionDigits: 2 })}</div>
                    </div>
                    <i class="far fa-window-close removeTrail" data-trailID="${trail.id}"></i>
                  </div>
                `;
            });
        }
        this.routesContainer.innerHTML = content;
    }
}
