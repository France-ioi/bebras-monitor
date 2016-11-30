
import React from 'react';
import {Button} from 'react-bootstrap';
import EpicComponent from 'epic-component';
import {use, defineSelector, defineView} from 'epic-linker';

export default function* (deps) {

  yield defineSelector('ActivityTabSelector', function (state, props) {
    const {topEntries} = state;
    return {topEntries};
  });

  yield defineView('ActivityTab', 'ActivityTabSelector', EpicComponent(self => {

    const renderEntry = function (entry) {
      const {key, ip, total, domains} = entry;
      return (
        <div className="entry-table" key={key}>
          <span className="entry-key">{key}</span>
          <span className="entry-ip number">{ip}</span>
          <span className="entry-total number">{total}</span>
          <span className="entry-domain number">
            {domains === undefined ? 'unknown' :
             domains === false ? 'not found' :
             domains.join(',')}</span>
        </div>
      );
    };

    self.render = function () {
      const {topEntries} = self.props;
      return (
        <div className="row">
          <div className="col-md-12">
            {topEntries && <div>{topEntries.map(renderEntry)}</div>}
          </div>
        </div>
      );
    };

  }));

};
