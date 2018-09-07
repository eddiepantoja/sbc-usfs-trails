// Internal dependecies
import config from "../config";
import { getTrailRenderer, getLabelingInfo, getUniqueValueInfos } from "./utils";
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
    this.view.when(() => { // executes when the instance of the class loads.
      this.view.map.add(this.trailsLayer); // add layer to the view.
    });

    this.view.on("click", (event) => { // Event on click
      this.onViewClick(event);
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

    // Updates basemmap when state changes.
    state.watch("currentBasemapId", (id) => {
      this.setCurrentBasemap(id);
    });
  }

  // Creates SceneView with widgets.
  private initView() {
    const webscene = new WebScene({
      // passes in the ID for the Webscene from config.ts
      portalItem: {
        id: config.scene.websceneItemId
      }
    });

    const view = new SceneView({
      // ID of the DOM element
      container: "scenePanel",

      // An instance of WebScene
      map: webscene,

      // Specifies a constraint on the amount of allowed tilting of the view.
      // Max: maximum tilt allowed in the view
      // Mode: maximum tilt is user defined
      constraints: {
        tilt: {
          max: 80,
          mode: "manual"
        }
      },
      // High quality with higher maximum amount of memeory which view is allowed to use.
      qualityProfile: "high",

      // Specified various environment properties in the view.
      environment: {
        // Enable shadow and ambient occlusion
        lighting: {
          directShadowsEnabled: true,
          ambientOcclusionEnabled: true
        },
        // Enable atmosphere
        atmosphereEnabled: true,

        atmosphere: {
          quality: "high"
        },
        starsEnabled: false
      },
      // Default widgets available in the view.
      ui: {
        components: ["attribution"]
      },

      padding: {
        right: 300
      },

      // Not docked to side view and only diplays the header.
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

  // Initialize Layer
  private initTrailsLayer() {
    // Creates the FeatureLayer.
    return new FeatureLayer({
      // URL for the REST enpoint for the layer.
      url: config.data.trailsServiceUrl,
      title: "San Bernardino County USFS Trails",
      // Gets all the fields in the layer.
      outFields: ["*"],
      // Must be specified in constructor when client-side graphic.
      renderer: getTrailRenderer(),
      // Graphics are draped on the terrain surface. Better for Polylines like the trail.
      elevationInfo: {
        mode: "on-the-ground"
      },
      labelsVisible: true,
      popupEnabled: false,
      // Sets label options.
      labelingInfo: getLabelingInfo({ selection: null })
    });
  }

  // Set Basemap
  private setCurrentBasemap(id) {
    const basemapGroup = <GroupLayer> this.view.map.layers.filter((layer) => {
      return (layer.title === "Basemap");
    }).getItemAt(0);

    const activateLayer = basemapGroup.layers.filter((layer) => {
      if (layer.id === id) {
        return true;
      }
      return false;
    }).getItemAt(0);

    activateLayer.visible = true;
  }

  // On Click functionality
  private onViewClick(event) {
    // check if the user is online
    if (this.state.online) {
      this.showLoadingIcon(event);
      this.view.hitTest(event)
        .then((response) => {
          const result = response.results[0]; // result of hitTest
          // Uses createQuery() from FeatureLayer
          const query = this.trailsLayer.createQuery();
          query.geometry = result.mapPoint;
          query.distance = 100; // creates a buffer at the specified size around the input geometry
          query.units = "meters";
          query.spatialRelationship = "intersects"; // Returns features from the layer or layer view that intersect the input geometry.
          // Query against the feature service
          this.trailsLayer.queryFeatures(query)
            .then((results) => {
              if (results.features.length > 0) {
                //console.log(JSON.stringify(results));
                // Selects the trail on success.
                this.state.setSelectedTrailId(results.features[0].attributes[config.data.trailAttributes.ID]);
              } else {
                this.state.setSelectedTrailId(null);
              }
              this.removeLoadingIcon();
            })
            .catch(err => console.log(err));
        });
    }
  }

  // Creates loading Icon on click
  private showLoadingIcon(event) {
    domConstruct.create("span", {
      class: "fa fa-spinner fa-spin",
      id: "loadingIcon",
      style: {
        position: "absolute",
        fontSize: "30px",
        top: `${event.screenPoint.y - 15}px`,
        left: `${event.screenPoint.x - 15}px`
      }
    }, document.body);
  }

  // Remove icon on load
  private removeLoadingIcon() {
    domConstruct.destroy("loadingIcon");
  }

  // Update selected trail
  private selectFeature(featureId): void {
    const renderer = (<UniqueValueRenderer> this.trailsLayer.renderer).clone();
    renderer.uniqueValueInfos = getUniqueValueInfos({ selection: featureId });
    this.trailsLayer.renderer = renderer;

    this.trailsLayer.labelingInfo = getLabelingInfo({ selection: featureId });

    const selectedTrail = this.state.trails.filter((trail) => {
      return (trail.ID === featureId);
    })[0];

    this.view.goTo(
      { target: selectedTrail.geometry, tilt: 60 },
      { speedFactor: .5 }
    );

    if (this.state.online) {
      selectedTrail.setElevationValuesFromService();
    }
  }

  // Remove preivously selected feature
  private unselectFeature(oldId): void {
    const renderer = (<UniqueValueRenderer> this.trailsLayer.renderer).clone();
    renderer.uniqueValueInfos = [];
    this.trailsLayer.renderer = renderer;

    this.trailsLayer.labelingInfo = getLabelingInfo({ selection: null });

    const selectedTrail = this.state.trails.filter((trail) => {
      return (trail.ID === oldId);
    })[0];
  }
}
