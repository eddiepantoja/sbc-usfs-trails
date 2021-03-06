// Internal dependecies
import config from "../config";
import {
    getTrailRenderer,
    getLabelingInfo,
    getUniqueValueInfos
} from "./utils";
import { State } from "../types";

// Dojo dependencies
import * as domConstruct from "dojo/dom-construct";
import * as dom from "dojo/dom";
import * as on from "dojo/on";
import * as all from "dojo/promise/all";

// Esri dependecies
import * as WebScene from "esri/WebScene";
import * as Map from "esri/Map";
import * as SceneView from "esri/views/SceneView";
import * as Track from "esri/widgets/Track";
import * as BasemapToggle from "esri/widgets/BasemapToggle";
import * as FeatureLayer from "esri/layers/FeatureLayer";
import * as Query from "esri/tasks/support/Query";
import * as GroupLayer from "esri/layers/GroupLayer";
import * as UniqueValueRenderer from "esri/renderers/UniqueValueRenderer";
import * as NavigationToggle from "esri/widgets/NavigationToggle";
import * as Zoom from "esri/widgets/Zoom";
import * as Compass from "esri/widgets/Compass";
import * as esriConfig from "esri/config";
import * as watchUtils from "esri/core/watchUtils";

// CSS
import "../../style/scene.scss";

// URL for CORS enabled servers
esriConfig.request.corsEnabledServers.push("wtb.maptiles.arcgis.com");

export default class SceneElement {
    state: State;
    // Displays a 3D view of a Map on WebScene instance using WebGL.
    view: SceneView;
    // Single layer that can be created from a Map Service or Feature Service.
    trailsLayer: FeatureLayer;

    trails: Array<any>;

    // initilizes objects within SceneElement
    constructor(state: State) {
        this.state = state;
        this.view = this.initView(); // Creates ScenceView with buttons.
        this.state.view = this.view;

        this.trailsLayer = this.initTrailsLayer(); // Creates FeatureLayer
        this.view.when(() => {
            // executes when the instance of the class loads.
            this.view.map.add(this.trailsLayer); // add layer to the view.
        });

        this.view.on("click", event => {
            // Event on click
            this.onViewClick(event);
            this.trailsLayer;
        });

        // NOT SURE WHAT THIS IS DONG. DO MORE REASERCH
        (<any> window).view = this.view;

        // Updates selected trail when state changes.
        state.watch("selectedTrailId", (value, oldValue) => {
            if (oldValue) {
                this.unselectFeature(oldValue);
            }
            if (value) {
                this.selectFeature(value);
            }
        });
    }

    // Creates SceneView with widgets.
    private initView() {
        const map = new Map({
            basemap: "topo",
            ground: "world-elevation"
        });

        const view = new SceneView({
            container: "scenePanel",
            map: map,
            camera: {
                position: {
                    x: -116.9, // lon
                    y: 33.65,   // lat
                    z: 25000 // elevation in meters
                },
                tilt: 70
            },
            zoom: 10,
            constraints: {
                tilt: {
                    max: 80,
                    mode: "manual"
                }
            },
            qualityProfile: "high",
            environment: {
                lighting: {
                    directShadowsEnabled: true,
                    ambientOcclusionEnabled: true
                },
                atmosphereEnabled: true,
                atmosphere: {
                    quality: "high"
                },
                starsEnabled: false
            },
            ui: {
                components: ["attribution"]
            },
            popup: {
                visible: false
            }
        });

        // Basemap Toggle
        const basemapToggle = new BasemapToggle({
            view: view,  // The view that provides access to the map's "streets" basemap
            nextBasemap: "hybrid"  // Allows for toggling to the "hybrid" basemap
        });

        view.ui.add(basemapToggle, "bottom-left");

        // Add tracking
        const track = new Track({
            view: view
        });
        view.ui.add(track, "top-left");

        // Widget provides two buttons for the pan and rotate gestures.
        const navigationToggle = new NavigationToggle({
            view: view
        });

        // Widget provides zoom in and out buttons.
        const zoom = new Zoom({
            view: view
        });

        // Widget provides a compass button.
        const compass = new Compass({
            view: view
        });

        // Adds widgets to the view.
        view.ui.add([zoom, navigationToggle, compass], "top-left");
        return view;
    }

    // Initialize Trail Layer
    private initTrailsLayer() {
        return new FeatureLayer({
            url: config.data.trailsServiceUrl,
            title: "San Bernardino County USFS Trails",
            outFields: ["*"],
            renderer: getTrailRenderer(),
            elevationInfo: {
                mode: "on-the-ground"
            },
            labelsVisible: true,
            labelingInfo: getLabelingInfo({ selection: null }),
            popupEnabled: false
        });
    }

    // On Click functionality
    private onViewClick(event) {
        // check if the user is online
        if (this.state.online) {
            this.showLoadingIcon(event);
            this.view.hitTest(event)
                .then(response => {
                    this.view.popup.close();
                    const result = response.results[0];

                    const query = this.trailsLayer.createQuery();
                    query.geometry = result.mapPoint;
                    query.distance = 400;
                    query.units = "meters";
                    query.spatialRelationship = "intersects";
                    this.trailsLayer
                        .queryFeatures(query)
                        .then(results => {
                            if (results.features.length > 0) {
                                this.state.setSelectedTrailId(
                                    results.features[0].attributes[config.data.trailAttributes.id]
                                );
                            } else {
                                this.state.setSelectedTrailId(null);
                            }
                            this.removeLoadingIcon();
                        })
                        .catch(err => console.log(err));
                });
        }
    }

    // Loading Icon
    private showLoadingIcon(event) {
        domConstruct.create("span", {
            class: "fa fa-spinner fa-spin",
            id: "loadingIcon",
            style: {
                position: "absolute",
                fontSize: "40px",
                top: `${event.screenPoint.y - 15}px`,
                left: `${event.screenPoint.x - 15}px`
            }
        }, document.body);
    }

    private removeLoadingIcon() {
        domConstruct.destroy("loadingIcon");
    }

    // Update selected trail
    private selectFeature(featureId): void {
        const renderer = (<UniqueValueRenderer> this.trailsLayer.renderer).clone();
        renderer.uniqueValueInfos = getUniqueValueInfos({ selection: featureId });
        this.trailsLayer.renderer = renderer;

        this.trailsLayer.labelingInfo = getLabelingInfo({ selection: featureId });

        const selectedTrail = this.state.trails.filter(trail => {
            return trail.id === featureId;
        })[0];

        this.view.goTo(
            { target: selectedTrail.geometry, tilt: 60 },
            { speedFactor: 0.5 }
        );
    }

    // Remove preivously selected feature
    private unselectFeature(oldId): void {
        const renderer = (<UniqueValueRenderer> this.trailsLayer.renderer).clone();
        renderer.uniqueValueInfos = [];
        this.trailsLayer.renderer = renderer;

        this.trailsLayer.labelingInfo = getLabelingInfo({ selection: null });
        const selectedTrail = this.state.trails.filter(trail => {
            return trail.id === oldId;
        })[0];
    }
}
