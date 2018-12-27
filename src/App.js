import React, { Component } from "react";
import { Provider } from "react-redux";

import { store } from "./store";

import RouteMap from "./containers/RouteMap";

class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <div style={{ width: "100vw", height: "100vh" }}>
          <RouteMap />
        </div>
      </Provider>
    );
  }
}

export default App;
