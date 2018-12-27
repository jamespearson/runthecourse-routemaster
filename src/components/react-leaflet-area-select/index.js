import L from "leaflet";
import { MapLayer, withLeaflet } from "react-leaflet";
import AreaSelect from "./area-select";
import PropTypes from "prop-types";

// Converts leaflet-distance-marker to a React Component
class ReactLeafletAreaSelect extends MapLayer {
  constructor(props) {
    super(props);
  }
  createLeafletElement(props) {
    console.log("props :", props);
  }

  handleAreaChange() {}
  componentDidMount() {
    const { map } = this.props.leaflet;
    console.log("componentDidMount", this.props.leaflet);

    L.marker([51.5, -0.1]).addTo(this.props.leaflet.map);

    L.AreaSelect = AreaSelect;
    L.areaSelect = function(options) {
      return new L.AreaSelect(options);
    };

    var areaSelect = L.areaSelect({
      width: 1189 / 2,
      height: 1189 / 2,
      keepAspectRatio: true
    });
    areaSelect.on("change", () => {
      var bounds = areaSelect.getBounds();

      this.props.onChange({
        minLng: Math.min(bounds.getNorthEast().lng, bounds.getSouthWest().lng),
        minLat: Math.min(bounds.getNorthEast().lat, bounds.getSouthWest().lat),
        maxLng: Math.max(bounds.getNorthEast().lng, bounds.getSouthWest().lng),
        maxLat: Math.max(bounds.getNorthEast().lat, bounds.getSouthWest().lat)
      });
    });

    areaSelect.addTo(map);
  }
}

export default withLeaflet(ReactLeafletAreaSelect);
