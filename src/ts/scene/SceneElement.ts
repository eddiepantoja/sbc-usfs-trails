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
import * as SceneView from "esri/views/SceneView";
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
    });

    // NOT SURE WHAT THIS IS DONG. DO MORE REASERCH
    (<any>window).view = this.view;

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
    const webscene = new WebScene({
      portalItem: {
        id: config.scene.websceneItemId
      }
    });

    const view = new SceneView({
      container: "scenePanel",
      map: webscene,
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
      padding: {
        right: 300
      },
      popup: {
        dockEnabled: false,
        collapsed: true
      }
    });

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
      popupEnabled: false,
      labelingInfo: getLabelingInfo({ selection: null })
    });
  }

  // On Click functionality
  private onViewClick(event) {
    // check if the user is online
    if (this.state.online) {
      this.view.hitTest(event).then(response => {
        console.log("Hit test result: ");
        console.log(response.results[0]);
        const result = response.results[0];
        const query = this.trailsLayer.createQuery();
        query.geometry = result.mapPoint;
        query.distance = 400;
        query.units = "meters";
        query.spatialRelationship = "intersects";
        this.trailsLayer
          .queryFeatures(query)
          .then(results => {
            console.log("Query Feature Success");
            console.log(results.features[0]);
            if (results.features.length > 0) {
              this.state.setSelectedTrailId(
                results.features[0].attributes[config.data.trailAttributes.id]
              );
            } else {
              this.state.setSelectedTrailId(null);
            }
          })
          .catch(err => console.log(err));
      });
    }
  }

  // Update selected trail
  private selectFeature(featureId): void {
    console.log("Selecting trail: " + featureId);

    const renderer = (<UniqueValueRenderer>this.trailsLayer.renderer).clone();
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
    console.log("removing trail: " + oldId);
    const renderer = (<UniqueValueRenderer>this.trailsLayer.renderer).clone();
    renderer.uniqueValueInfos = [];
    this.trailsLayer.renderer = renderer;

    this.trailsLayer.labelingInfo = getLabelingInfo({ selection: null });

    const selectedTrail = this.state.trails.filter(trail => {
      return trail.id === oldId;
    })[0];
  }
}
