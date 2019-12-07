
import React from 'react';
import {connect} from 'react-redux';

class LogsTab extends React.PureComponent {
  render () {
    const {logs} = this.props;
    return (
      <div>
        <pre>{logs}</pre>
      </div>
    );
  }
}

function LogsTabSelector (state, props) {
  const {logs} = state;
  return {logs};
}

export default {
  views: {
    LogsTab: connect(LogsTabSelector)(LogsTab)
  }
};
