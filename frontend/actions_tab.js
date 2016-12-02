
import React from 'react';
import {Button} from 'react-bootstrap';
import EpicComponent from 'epic-component';
import {use, defineSelector, defineView} from 'epic-linker';

export default function* (deps) {

  yield use('EntryPanel', 'showEntry', 'selectEntry');

  yield defineSelector('ActionsTabSelector', function (state, props) {
    const {entries, selectedEntryKey, pointedEntryKey} = state;
    let pointedEntry, selectedEntry;
    const shownEntries = [];
    Object.keys(entries).forEach(function (key) {
      const entry = entries[key];
      if (entry.action) {
        shownEntries.push(entry);
      }
      if (key === pointedEntryKey) {
        pointedEntry = entry;
      }
      if (key === selectedEntryKey) {
        selectedEntry = entry;
      }
    });
    return {entries: shownEntries, pointedEntry, selectedEntry};
  });

  yield defineView('ActionsTab', 'ActionsTabSelector', EpicComponent(self => {

    const onShowEntry = function (event) {
      const key = event.currentTarget.getAttribute('data-key');
      self.props.dispatch({type: deps.showEntry, key});
    };

    const onSelectEntry = function (event) {
      const key = event.currentTarget.getAttribute('data-key');
      self.props.dispatch({type: deps.selectEntry, key});
    };

    const renderEntry = function (entry) {
      const {key, ip, action} = entry;
      return (
        <li key={key} onClick={onSelectEntry} onMouseOver={onShowEntry} data-key={key}>
          {ip}{' '}{action}
        </li>
      );
    };

    self.render = function () {
      const {entries, pointedEntry, selectedEntry, dispatch} = self.props;
      return (
        <div className="row">
          <div className="col-md-6">
            <ul>
              {entries.map(renderEntry)}
            </ul>
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
