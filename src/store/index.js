import { applyMiddleware, createStore, compose } from "redux";

import thunk from "redux-thunk";

import createRootReducer from "../reducers";

export const store = createStore(
  createRootReducer(), // root reducer with router state
  {},
  compose(applyMiddleware(thunk))
);
