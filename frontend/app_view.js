
import React from 'react';
import {use, defineSelector, defineView} from 'epic-linker';

export default function* (deps) {

  yield use('Tabs', 'ActiveTab', 'Refresh');

  yield defineView('App', class App extends React.PureComponent {
    render () {
      return (
        <div className="container">
          <div id="header">
            <div className="pull-right">
              <deps.Refresh/>
            </div>
            <deps.Tabs/>
          </div>
          <div id="content">
            <deps.ActiveTab/>
          </div>
        </div>);
    }
  });

};
