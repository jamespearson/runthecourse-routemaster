import { combineReducers } from "redux";

import route from "./route";
import session from "./session";

export default () => {
  return combineReducers({
    route,
    session
  });
};
