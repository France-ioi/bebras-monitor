
import React from 'react';
import {connect} from 'react-redux';

import NavigationBundle from './navigation';
import ActivityTabBundle from './activity_tab';
import ActionsTabBundle from './actions_tab';
import LogsTabBundle from './logs_tab';
import ConfigTabBundle from './config_tab';

class App extends React.PureComponent {
  render () {
    const {RefreshControl, Tabs, ActiveTab} = this.props;
    return (
      <div className="container">
        <div id="header">
          <div className="pull-right">
            <RefreshControl/>
          </div>
          <Tabs/>
        </div>
        <div id="content">
          <ActiveTab/>
        </div>
      </div>
    );
  }
}

function AppSelector ({views: {RefreshControl, Tabs, ActiveTab}}) {
  return {RefreshControl, Tabs, ActiveTab};
}

export default {
  views: {
    App: connect(AppSelector)(App),
  },
  includes: [
    NavigationBundle([
      {key: 'activity', label: "Activity", view: 'ActivityTab'},
      {key: 'actions', label: "Actions", view: 'ActionsTab'},
      {key: 'logs', label: "Logs", view: 'LogsTab'},
      {key: 'config', label: "Config", view: 'ConfigTab'}
    ]),
    ActivityTabBundle,
    ActionsTabBundle,
    ConfigTabBundle,
    LogsTabBundle,
  ]
};
