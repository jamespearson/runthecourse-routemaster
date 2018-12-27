import { compose } from "redux";
import { connect } from "react-redux";

import { setFile } from "../../reducers/session";

import WelcomeView from "./components/WelcomeView";

const mapDispatchToProps = {
  setFile
};

const mapStateToProps = props => {
  return {};
};

export default compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(WelcomeView);
