
import React from 'react';
import {Button} from 'react-bootstrap';
import EpicComponent from 'epic-component';
import {use, defineSelector, defineView} from 'epic-linker';

export default function* (deps) {

  yield defineSelector('ActionsTabSelector', function (state, props) {
    return {};
  });

  yield defineView('ActionsTab', 'ActionsTabSelector', EpicComponent(self => {

    self.render = function () {
      return (
        <div className="row">
          <div className="col-md-12">
            <p>ip: action</p>
          </div>
        </div>
      );
    };

  }));

};
