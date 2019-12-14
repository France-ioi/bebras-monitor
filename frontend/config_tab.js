
import React from 'react';
import {connect} from 'react-redux';

class ConfigTab extends React.PureComponent {
  render () {
    const {config} = this.props;
    return (
      <div>
        {Object.keys(config).map(key => {
          return (
          <div className="input-group input-group-sm">
            <span className="input-group-addon">{key}</span>
            <input type="text" className="form-control config-input" data-configkey={key} placeholder={config[key]}></input>
          </div>
          )
        })}
        <button className="btn btn-warning" onClick={this.configReset}>Reset</button>
        <button className="btn btn-primary" onClick={this.configSave}>Save</button>
      </div>
    );
  }

  configReset() {
  }
}

function ConfigTabSelector (state, props) {
  const {config} = state;
  return {config};
}

export default {
  views: {
    ConfigTab: connect(ConfigTabSelector)(ConfigTab)
  }
};
