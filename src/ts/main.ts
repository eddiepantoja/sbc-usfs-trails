/* entry point for the application */
import "../style/style.scss";

import esriConfig = require("esri/config");
esriConfig.request.useIdentity = false;

import State from "./State";
import ConnectionManager from "./ui/ConnectionManager";
import SceneElement from "./scene/SceneElement";
import trailManager from "./data/trailManager";
import SidePanel from "./ui/SidePanel";

import * as runtime from "serviceworker-webpack-plugin/lib/runtime";

if ("serviceWorker" in navigator) {
    runtime.register();
}

// Init state
const state = new State();
const connectionManager = new ConnectionManager(state);

// Create scene with state proprties
const sceneElement = new SceneElement(state);

// Init Trail and create menu
trailManager.initTrails(state)
    .then(() => {
        const sidePanel = new SidePanel(state, sceneElement);
    });
