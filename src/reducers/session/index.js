//import { REHYDRATE } from "redux-persist/constants";

// ------------------------------------
// Constants
// ------------------------------------
const SESSION_SET_FILE = "session:file:set";

export const constants = {
  SESSION_SET_FILE
};

// ------------------------------------
// Actions
// ------------------------------------
const fileSet = filePath => ({
  type: SESSION_SET_FILE,
  filePath
});

// const postScrollingSet = block => ({
//   type: block ? SESSION_POST_SCROLLING_BLOCK : SESSION_POST_SCROLLING_RELEASE
// });

// const userPropertySet = (key, value) => ({
//   type: SESSION_USER_PROPERTY_SET,
//   key,
//   value
// });

// export const actions = {
//   currentPostSet,
//   postScrollingSet,
//   userPropertySet
// };

// ------------------------------------
// Functions
// ------------------------------------
export const setFile = filePath => dispatch => {
  dispatch(fileSet(filePath));
};

// export const setUserProperty = (key, value) => dispatch => {
//   dispatch(userPropertySet(key, value));
// };

// export const postShouldBlockScrolling = shouldBlock => dispatch => {
//   dispatch(postScrollingSet(shouldBlock));
// };
// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [SESSION_SET_FILE]: (state, { filePath }) => {
    return { ...state, filePath };
  }
};

// ------------------------------------
// Reducer
// ------------------------------------
export const initialState = {
  filePath: null
};

export default (state = initialState, action) => {
  const handler = ACTION_HANDLERS[action.type];
  return handler ? handler(state, action) : state;
};
