
import React from 'react';
import {Button} from 'react-bootstrap';
import EpicComponent from 'epic-component';
import {use, defineSelector, defineView} from 'epic-linker';

export default function* (deps) {

  yield use('Tabs', 'ActiveTab', 'refresh');

  yield defineSelector('AppSelector', function (state, props) {
    const {refreshedAt, isActive} = state;
    return {refreshedAt, isActive};
  });

  yield defineView('App', 'AppSelector', EpicComponent(self => {
    const onRefresh = function () {
      self.props.dispatch({type: deps.refresh});
    };
    self.render = function () {
      const {refreshedAt, isActive} = self.props;
      return (
        <div className="container">
          <div id="header">
            <div className="pull-right">
              {refreshedAt && <span className="refreshedAt">refreshed at {refreshedAt.toISOString()}</span>}
              <Button onClick={onRefresh} bsStyle={isActive ? 'default' : 'primary'}><i className="fa fa-refresh"/></Button>
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
