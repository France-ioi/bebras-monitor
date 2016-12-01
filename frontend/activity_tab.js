
import React from 'react';
import {Button} from 'react-bootstrap';
import EpicComponent from 'epic-component';
import classnames from 'classnames';
import {include, use, defineAction, defineSelector, defineView, addReducer} from 'epic-linker';

import EntryPanel from './entry_panel';

export default function* (deps) {

  yield include(EntryPanel)
  yield use('EntryPanel');

  yield defineAction('showEntry', 'ActivityTab.Entry.Show');
  yield defineAction('selectEntry', 'ActivityTab.Entry.Select');

  yield addReducer('showEntry', function (state, action) {
    return {...state, pointedEntryKey: action.key};
  });

  yield addReducer('selectEntry', function (state, action) {
    if (action.key === state.selectedEntryKey) {
      return {...state, selectedEntryKey: undefined};
    }
    return {...state, selectedEntryKey: action.key};
  });

  yield defineSelector('ActivityTabSelector', function (state, props) {
    const {topEntries, selectedEntryKey, pointedEntryKey} = state;
    let pointedEntry, selectedEntry;
    const nEntries = topEntries.length;
    for (let i = 0; i < nEntries; i += 1) {
      let entry = topEntries[i];
      if (entry.key === pointedEntryKey) {
        pointedEntry = entry;
      }
      if (entry.key === selectedEntryKey) {
        selectedEntry = entry;
      }
    }
    return {topEntries, pointedEntry, selectedEntry};
  });

  yield defineView('ActivityTab', 'ActivityTabSelector', EpicComponent(self => {

    const onShowEntry = function (event) {
      const key = event.currentTarget.getAttribute('data-key');
      self.props.dispatch({type: deps.showEntry, key});
    };

    const onSelectEntry = function (event) {
      const key = event.currentTarget.getAttribute('data-key');
      self.props.dispatch({type: deps.selectEntry, key});
    };

    const renderEntry = function (entry, isSelected) {
      const {key, ip, total, domains} = entry;
      return (
        <div className={classnames(["entry-table", isSelected && "entry-selected"])} key={key} onClick={onSelectEntry} onMouseOver={onShowEntry} data-key={key}>
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
      const {topEntries, pointedEntry, selectedEntry} = self.props;
      // <span className="entry-key">{key}</span>
      return (
        <div className="row">
          <div className="col-md-6">
            {topEntries && <div>{topEntries.map(entry =>
              renderEntry(entry, selectedEntry === entry)
            )}</div>}
          </div>
          <div className="col-md-6">
            {selectedEntry &&
              <deps.EntryPanel entry={selectedEntry}/>}
            {pointedEntry && pointedEntry !== selectedEntry &&
              <deps.EntryPanel entry={pointedEntry}/>}
          </div>
        </div>
      );
    };

  }));

};
