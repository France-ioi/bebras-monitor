
import React from 'react';
import {Button} from 'react-bootstrap';
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

  yield defineView('ActionsTab', 'ActionsTabSelector', class ActionsTab extends React.PureComponent {

    onShowEntry = (event) => {
      const key = event.currentTarget.getAttribute('data-key');
      this.props.dispatch({type: deps.showEntry, key});
    };

    onSelectEntry = (event) => {
      const key = event.currentTarget.getAttribute('data-key');
      this.props.dispatch({type: deps.selectEntry, key});
    };

    _renderEntry = (entry) => {
      const {key, ip, action} = entry;
      return (
        <li key={key} onClick={this.onSelectEntry} onMouseOver={this.onShowEntry} data-key={key}>
          {ip}{' '}{action}
        </li>
      );
    };

    render () {
      const {entries, pointedEntry, selectedEntry, dispatch} = this.props;
      return (
        <div className="row">
          <div className="col-md-6">
            <ul>
              {entries.map(this._renderEntry)}
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
    }

  });

};
