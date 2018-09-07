import Accessor = require("esri/core/Accessor");
import Polyline = require("esri/geometry/Polyline");
import SceneView = require("esri/views/SceneView");

export interface State extends Accessor {
  displayLoading: boolean;
  selectedTrailId: number;
  setSelectedTrailId: (id: number) => void;
  currentBasemapId: string;
  view: SceneView;
  trails: Array<Trail>;
  online: boolean;
}

export interface Trail {
  geometry: Polyline;
  NAME: string;
  TRAIL_CLASS: string;
  Length_Miles: number;
  Steps_to_Travel: number;
  ID: string;
  profileData: Array<Object>;
  minElevation: number;
  maxElevation: number;
  hasZ: boolean;
  setZValues: (view: SceneView) => IPromise;
  createFlickrLayer: () => IPromise;
  setElevationValuesFromService: () => IPromise;
}
