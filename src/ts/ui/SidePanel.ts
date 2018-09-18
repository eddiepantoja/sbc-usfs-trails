import * as on from "dojo/on";
import * as dom from "dojo/dom";
import { State } from "../types";
import * as SceneView from "esri/views/SceneView";
import * as WebScene from "esri/WebScene";

import "../../style/side-panel.scss";

export default class SidePanel {
  state: State;
  container: HTMLElement;

  constructor(state: State) {
    const trails = state.trails;
    this.state = state;
    this.container = <HTMLElement> document.querySelector(".sidePanel");
  }
}