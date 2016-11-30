
import React from 'react';
import EpicComponent from 'epic-component';
import {use, defineSelector, defineView} from 'epic-linker';

export default function* (deps) {

  yield use('Tabs', 'ActiveTab', 'Refresh');

  yield defineView('App', EpicComponent(self => {
    self.render = function () {
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
    };
  }));

};
