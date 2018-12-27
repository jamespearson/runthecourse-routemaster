import { compose } from "redux";
import { connect } from "react-redux";

import RouteMapView from "./components/RouteMapView";

const mapDispatchToProps = {};

const mapStateToProps = ({ route: { center, boundingBox, geoJSON } }) => ({});

export default compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(RouteMapView);
