
import React from 'react';
import {Button} from 'react-bootstrap';
import EpicComponent from 'epic-component';
import classnames from 'classnames';
import {include, use, defineAction, defineSelector, defineView, addReducer} from 'epic-linker';

export default function* (deps) {

  yield use('EntryPanel', 'showEntry', 'selectEntry');

  yield defineSelector('ActivityTabSelector', function (state, props) {
    const {entries, topKeys, selectedEntryKey, pointedEntryKey} = state;
    let pointedEntry, selectedEntry;
    const topEntries = [];
    if (topKeys !== undefined) {
      const nEntries = topKeys.length;
      for (let i = 0; i < nEntries; i += 1) {
        let key = topKeys[i];
        let entry = entries[key];
        topEntries.push(entry);
        if (key === pointedEntryKey) {
          pointedEntry = entry;
        }
        if (key === selectedEntryKey) {
          selectedEntry = entry;
        }
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
          <span className="entry-action">
            {entry.action}
          </span>
          <span className="entry-domain number">
            {domains === undefined ? 'unknown' :
             domains === false ? 'not found' :
             domains.join(',')}</span>
        </div>
      );
    };

    self.render = function () {
      const {topEntries, pointedEntry, selectedEntry, dispatch} = self.props;
      return (
        <div className="row">
          <div className="col-md-6">
            {topEntries && <div>{topEntries.map(entry =>
              renderEntry(entry, selectedEntry === entry)
            )}</div>}
          </div>
          <div className="col-md-6">
            {selectedEntry &&
              <deps.EntryPanel entry={selectedEntry} dispatch={dispatch}/>}
            {pointedEntry && pointedEntry !== selectedEntry &&
              <deps.EntryPanel entry={pointedEntry} dispatch={dispatch}/>}
          </div>
        </div>
      );
    };

  }));

};
