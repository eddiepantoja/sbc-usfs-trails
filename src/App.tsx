import * as React from 'react';
import './App.css';

import MapScene from './Map/Map';

class App extends React.Component {
  public render() {
    return (
      <div id="map-wrapper">
        <MapScene />
      </div>
    );
  }
}

export default App;
