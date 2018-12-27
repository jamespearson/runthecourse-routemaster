import React, { Component } from "react";
import styles from "./index.module.scss";
const electron = window.require("electron").remote;
const { dialog } = electron;

class WelcomeView extends Component {
  constructor(props) {
    super(props);

    this.state = {};

    this.handleNew = this.handleNew.bind(this);
    this.handleOpen = this.handleOpen.bind(this);
    this.handleFileSelect = this.handleFileSelect.bind(this);
  }

  handleNew() {
    const filename = dialog.showSaveDialog();
    this.handleFileSelect(filename);
  }
  handleOpen() {
    const filename = dialog.showOpenDialog({
      properties: ["openFile"]
    });
    this.handleFileSelect(filename);
  }

  handleFileSelect(filename) {
    const { history, setFile } = this.props;

    setFile(filename[0]);

    history.push("/route");
  }

  render() {
    console.log("this.props :", this.props);
    return (
      <div className={styles.container}>
        <div onClick={this.handleOpen}>Open Existing</div>

        <div onClick={this.handleNew}>Create New</div>
      </div>
    );
  }
}

export default WelcomeView;
