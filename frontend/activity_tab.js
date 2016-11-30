
import React from 'react';
import {Button} from 'react-bootstrap';
import EpicComponent from 'epic-component';
import classnames from 'classnames';
import {defineAction, defineSelector, defineView, addReducer} from 'epic-linker';

export default function* (deps) {

  yield defineAction('selectEntry', 'ActivityTab.Entry.Select');

  yield addReducer('selectEntry', function (state, action) {
    return {...state, selectedEntryKey: action.key};
  });

  yield defineSelector('ActivityTabSelector', function (state, props) {
    const {topEntries, selectedEntryKey} = state;
    let selectedEntry;
    const nEntries = topEntries.length;
    for (let i = 0; i < nEntries; i += 1) {
      let entry = topEntries[i];
      if (entry.key === selectedEntryKey) {
        selectedEntry = entry;
      }
    }
    return {topEntries, selectedEntry};
  });

  yield defineView('ActivityTab', 'ActivityTabSelector', EpicComponent(self => {

    const onSelectEntry = function (event) {
      const key = event.currentTarget.getAttribute('data-key');
      self.props.dispatch({type: deps.selectEntry, key});
    };

    const renderEntry = function (entry, isSelected) {
      const {key, ip, total, domains} = entry;
      return (
        <div className={classnames(["entry-table", isSelected && "entry-selected"])} key={key} onClick={onSelectEntry} data-key={key}>
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
      const {topEntries, selectedEntry} = self.props;
      // <span className="entry-key">{key}</span>
      return (
        <div className="row">
          <div className="col-md-6">
            {topEntries && <div>{topEntries.map(entry =>
              renderEntry(entry, selectedEntry === entry)
            )}</div>}
          </div>
          <div className="col-md-6">
            <div style={{wordBreak: 'break-word'}}>{JSON.stringify(selectedEntry)}</div>
          </div>
        </div>
      );
    };

  }));

};
