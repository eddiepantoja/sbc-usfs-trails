// import * as Point from "esri/geometry/Point";
// import * as dom from "dojo/dom";
// import * as on from "dojo/on";
// import * as domConstruct from "dojo/dom-construct";
// import * as domClass from "dojo/dom-class";
// import config from "../config";

// declare const AmCharts: any;

// import "amcharts3";
// import "amcharts3/amcharts/serial";

// import "../../style/detail-panel.scss";

// import { State, Trail } from "../types";

// export default class DetailPanel {

//   trails: Array<Trail>;
//   state: State;
//   container: any;
//   detailTitle: any;
//   detailMeta: any;
//   detailElevationProfile: any;
//   detailDescription: any;

//   constructor(trails, state: State) {
//     this.state = state;
//     this.trails = trails;
//     this.container = dom.byId("detailPanel");
//     this.detailTitle = dom.byId("detailTitle");

//     this.emptyDetails();

//     // Watch selected trail and replaces details with new ones.
//     state.watch("selectedTrailId", (id) => {
//       this.emptyDetails();
//       if (id) {
//         const selectedTrail = this.trails.filter((trail) => { return trail.ID === id; })[0];
//         this.displayInfo(selectedTrail);
//       }
//     });
//   }

//   // Removes details
//   emptyDetails() {
//     domConstruct.empty(this.detailTitle);
//   }

//   // Populates data when trail is slected.
//   displayInfo(trail: Trail): void {
//     this.detailTitle.innerHTML = `<h3 class="card-title">${trail.NAME}<h3>`;
//   }

// }
