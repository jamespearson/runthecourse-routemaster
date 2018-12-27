//import { REHYDRATE } from "redux-persist/constants";
import toGeoJSON from "@mapbox/togeojson";
import afar from "@turf/distance";

// ------------------------------------
// Constants
// ------------------------------------
const ROUTE_SET_BOUNDING_BOX = "route:bbox:set";
const ROUTE_SET_CENTER = "route:center:set";
const ROUTE_SET_ZOOM = "route:zoom:set";
const ROUTE_SET_GEOJSON = "route:geoJSON:set";

const ROUTE_IMPORT_GPX = "route:gpx:import";

const ROUTE_MAPBOX_EXPORT_REQUEST = "route:mapbox:export";
const ROUTE_MAPBOX_EXPORT_SUCCESS = `${ROUTE_MAPBOX_EXPORT_REQUEST}:success`;
const ROUTE_MAPBOX_EXPORT_ERROR = `${ROUTE_MAPBOX_EXPORT_REQUEST}:success`;

export const constants = {
  ROUTE_SET_BOUNDING_BOX,
  ROUTE_SET_CENTER,
  ROUTE_SET_GEOJSON,
  ROUTE_SET_ZOOM,
  ROUTE_IMPORT_GPX,
  ROUTE_MAPBOX_EXPORT_REQUEST,
  ROUTE_MAPBOX_EXPORT_SUCCESS,
  ROUTE_MAPBOX_EXPORT_ERROR
};

const addMarkers = geoJSON => {
  let previous = null;
  let total = 0;

  const coordinates = geoJSON.features["0"].geometry.coordinates;

  const markers = coordinates.reduce(
    (markers, current) => {
      if (previous != null) {
        // Distance since previous marker
        const distance = afar(current[1], current[0], previous[1], previous[0]);

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

// ------------------------------------
// Actions
// ------------------------------------

const boundingBoxSet = (minLng, maxLng, minLat, maxLat) => ({
  type: ROUTE_SET_BOUNDING_BOX,
  minLng,
  maxLng,
  minLat,
  maxLat
});

const gpxImport = content => ({
  type: ROUTE_IMPORT_GPX,
  content
});

const geoJSONSet = geoJSON => ({
  type: ROUTE_SET_GEOJSON,
  geoJSON
});

const centerSet = (longitude, latitude) => ({
  type: ROUTE_SET_CENTER,
  longitude,
  latitude
});

const zoomSet = zoomLevel => ({
  type: ROUTE_SET_ZOOM,
  zoomLevel
});
// ------------------------------------
// Functions
// ------------------------------------

export const importGPX = gpx => dispatch => {
  dispatch(gpxImport(gpx));
};
export const setGeoJSON = geoJSON => dispatch => {
  dispatch(geoJSONSet(geoJSON));
};

export const setCenter = (lng, lat) => dispatch => {
  dispatch(centerSet(lng, lat));
};

export const setZoomLevel = zoom => dispatch => {
  dispatch(zoomSet(zoom));
};

export const setBoundingBox = (minLng, maxLng, minLat, maxLat) => dispatch => {
  dispatch(boundingBoxSet(minLng, maxLng, minLat, maxLat));
};

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [ROUTE_IMPORT_GPX]: (state, { content }) => {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(content, "application/xml");

    const geoJSON = addMarkers(toGeoJSON.gpx(xmlDoc));

    // Content
    return { ...state, geoJSON };
  },

  [ROUTE_SET_BOUNDING_BOX]: (state, { minLng, maxLng, minLat, maxLat }) => {
    return { ...state, boundingBox: { minLng, maxLng, minLat, maxLat } };
  },

  [ROUTE_SET_CENTER]: (state, { longitude, latitude }) => {
    return { ...state, longitude, latitude };
  },

  [ROUTE_SET_GEOJSON]: (state, { geoJSON: rawGeoJSON }) => {
    const geoJSON = addMarkers(JSON.parse(rawGeoJSON));
    return { ...state, geoJSON };
  },

  [ROUTE_SET_ZOOM]: (state, { zoomLevel }) => {
    return { ...state, zoomLevel };
  }
};

// ------------------------------------
// Reducer
// ------------------------------------
export const initialState = {
  geoJSON: {},
  longitude: null,
  latitude: null,
  boundingBox: {},
  zoomLevel: 8
};

export default (state = initialState, action) => {
  const handler = ACTION_HANDLERS[action.type];
  return handler ? handler(state, action) : state;
};
