import * as React from 'react';
import { Scene } from 'react-arcgis';

class MapScene extends React.Component {
  public render() {
    return (
      <Scene
        style={{ width: '100vw', height: '100vh' }}
        mapProperties={{ basemap: 'satellite' }}
        viewProperties={{
            center: [-116.887856, 34.170952],
            zoom: 6
        }}
      />
    );
  }
}

export default MapScene;