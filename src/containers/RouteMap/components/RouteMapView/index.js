import React, { Component } from "react";
import { Map, TileLayer, Marker, Popup, GeoJSON } from "react-leaflet";

import toGeoJSON from "@mapbox/togeojson";

import TurfCenter from "@turf/center";
import TurfDistance from "@turf/distance";
import TurfBBox from "@turf/bbox";
import TurnBBoxPolyGon from "@turf/bbox-polygon";
import TurfBuffer from "@turf/buffer";

import AreaSelect from "../../../../components/react-leaflet-area-select";

import MapboxUploads from "@mapbox/mapbox-sdk/services/uploads";

const addMarkers = geoJSON => {
  let previous = null;
  let total = 0;

  const coordinates = geoJSON.features["0"].geometry.coordinates;

  const markers = coordinates.reduce(
    (markers, current) => {
      if (previous != null) {
        // Distance since previous marker
        const distance = TurfDistance(current, previous);

        const previousKM = parseInt(total);
        const previousMile = parseInt(total * 0.621371);
        total += distance;

        const currentKM = parseInt(total);
        const currentMile = parseInt(total * 0.621371);

        if (currentKM > previousKM) {
          markers.km[currentKM] = current;
          markers.km[currentKM].distance = "km";
          markers.km[currentKM].size = currentKM % 5 === 0 ? "large" : "small";
        }

        if (currentMile > previousMile) {
          markers.mile[currentMile] = current;
          markers.mile[currentMile].distance = "mile";
          markers.mile[currentMile].size =
            currentMile % 5 === 0 ? "large" : "small";
        }

        if (!markers.halfMarathon && total > 21.0975) {
          markers.halfMarathon = current;
          markers.halfMarathon.distance = "half";
          markers.halfMarathon.size = "large";
        }
      }
      previous = current;
      return markers;
    },
    { km: [], mile: [] }
  );

  markers.start = coordinates[0];
  markers.start.distance = "start";
  markers.start.size = "large";

  markers.finish = coordinates[coordinates.length - 1];
  markers.finish.distance = "finish";
  markers.finish.size = "large";

  [
    markers.start,
    markers.finish,
    markers.halfMarathon,
    ...markers.km,
    ...markers.mile
  ].forEach(marker => {
    if (marker) {
      const features = geoJSON.features;

      features.push({
        type: "Feature",
        properties: {
          distanceType: marker.distance,
          title: marker.title,
          size: marker.size
        },
        geometry: {
          type: "Point",
          coordinates: [marker[0], marker[1]]
        }
      });

      geoJSON = { ...geoJSON, features };
    }
  });
  return geoJSON;
};

class RouteMapView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      lat: 51.505,
      lng: -0.09,
      zoom: 13
    };
    this.handleFileOpen = this.handleFileOpen.bind(this);

    this.addRoute = this.addRoute.bind(this);
    this.addBoundingBox = this.addBoundingBox.bind(this);

    this.handleDownload = this.handleDownload.bind(this);
    this.handleDownloadGeoJSON = this.handleDownloadGeoJSON.bind(this);
    this.handleAreaChange = this.handleAreaChange.bind(this);

    this.handleUpload = this.handleUpload.bind(this);
  }

  componentDidMount() {}

  handleFileOpen(event) {
    var input = event.target;
    var text = "";
    var reader = new FileReader();
    var onload = event => {
      text = reader.result;
      var parser = new DOMParser();
      var xmlDoc = parser.parseFromString(text, "application/xml");
      const geoJSON = addMarkers(toGeoJSON.gpx(xmlDoc));

      this.addRoute(geoJSON);
      this.addBoundingBox(geoJSON);
    };

    reader.onload = onload;
    reader.readAsText(input.files[0]);
  }

  addRoute(geoJSON) {
    const center = TurfCenter(geoJSON).geometry.coordinates;

    this.setState({
      routeGeoJSON: geoJSON,
      lat: center[1],
      lng: center[0]
    });
  }

  addBoundingBox(geoJSON) {
    const center = TurfCenter(geoJSON).geometry.coordinates;

    const buffered = TurfBuffer(geoJSON, 5, { units: "miles" });
    const bbox = TurfBBox(buffered);
    const boundingBoxGeoJSON = TurnBBoxPolyGon(bbox);

    this.setState({
      boundingBoxGeoJSON
    });
  }

  handleDownload() {
    const { selectedArea, routeGeoJSON: geoJSON } = this.state;
    var element = document.createElement("a");

    const contents = {
      boundingBox: {
        ...selectedArea
      },
      geoJSON
    };

    var file = new Blob([JSON.stringify(contents)], {
      type: "application/json"
    });
    element.href = URL.createObjectURL(file);
    element.download = "settings.json";
    element.click();
  }

  handleAreaChange(bbox) {
    console.log("handleAreaChange :", bbox);
    this.setState({
      selectedArea: bbox
    });
  }

  async handleUpload() {
    const { routeGeoJSON } = this.state;

    const uploadClient = MapboxUploads({
      accessToken:
        "sk.eyJ1IjoicHJpbnRtZXRyaWNzIiwiYSI6ImNqcHNzZ3g1NDA4NXA0Mm8xaTN0YWF5a3UifQ.Xkws6-4j8Ddj59pmZoKw8Q"
    });

    const credentials = await uploadClient
      .createUploadCredentials()
      .send()
      .then(response => {
        return response.body;
      });

    const { accessKeyId, secretAccessKey } = credentials;
    console.log("accessKeyId, secretAccessKey :", accessKeyId, secretAccessKey);
    const AWS = require("aws-sdk");
    AWS.config.update({
      accessKeyId,
      secretAccessKey
    });

    const s3 = new AWS.S3(credentials);

    s3.putObject({
      Bucket: credentials.bucket,
      Key: credentials.key,
      Body: JSON.stringify(routeGeoJSON)
    })
      .promise()
      .then(() => {
        console.log("UPLOAD SUCCESS");

        console.log("credentials.url :", credentials.url);
        uploadClient
          .createUpload({
            mapId: "printmetrics.cj2udwd8u007l32pedh6w8d0i-7fn1y",
            url: credentials.url,
            tilesetName: "Routes"
          })
          .send()
          .then(response => {
            console.log(response);
            return response.body;
          });
      })
      .then(() => console.log("MISSION SUCCESS"));
  }

  handleDownloadGeoJSON() {
    const { routeGeoJSON } = this.state;
    var element = document.createElement("a");

    var file = new Blob([JSON.stringify(routeGeoJSON)], {
      type: "application/json"
    });
    element.href = URL.createObjectURL(file);
    element.download = "route.geojson";
    element.click();
  }

  render() {
    const position = [this.state.lat, this.state.lng];
    const { boundingBoxGeoJSON, routeGeoJSON } = this.state;
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%"
        }}
      >
        <div style={{ flex: 1, position: "relative" }}>
          <Map
            ref={map => {
              this.map = map;
            }}
            center={position}
            zoom={this.state.zoom}
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              right: 0
            }}
          >
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {routeGeoJSON && (
              <GeoJSON
                data={routeGeoJSON}
                style={{ color: "#ff7800", weight: 5, opacity: 0.65 }}
              />
            )}
            {boundingBoxGeoJSON && (
              <GeoJSON
                data={boundingBoxGeoJSON}
                style={{ color: "#ff7800", weight: 5, opacity: 0.65 }}
              />
            )}
            } )}
            <Marker position={position} />
            <AreaSelect onChange={this.handleAreaChange} />
          </Map>
        </div>
        <footer
          style={{
            height: 50,
            backgroundColor: "pink"
          }}
        >
          <input type="file" onChange={this.handleFileOpen} />

          <button onClick={this.handleDownloadGeoJSON}>Dowload GeoJSON</button>
          <button onClick={this.handleDownload}>Download settings.json</button>
        </footer>
      </div>
    );
  }
}

export default RouteMapView;
