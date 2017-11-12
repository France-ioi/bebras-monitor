
import React from 'react';
import {Button} from 'react-bootstrap';
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

  yield defineView('ActivityTab', 'ActivityTabSelector', class ActivityTab extends React.PureComponent {

    onShowEntry = (event) => {
      const key = event.currentTarget.getAttribute('data-key');
      this.props.dispatch({type: deps.showEntry, key});
    };

    onSelectEntry = (event) => {
      const key = event.currentTarget.getAttribute('data-key');
      this.props.dispatch({type: deps.selectEntry, key});
    };

    _renderEntry = (entry, isSelected) => {
      const {key, ip, total, domains} = entry;
      return (
        <div className={classnames(["entry-table", isSelected && "entry-selected"])} key={key} onClick={this.onSelectEntry} onMouseOver={this.onShowEntry} data-key={key}>
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
    }

    render () {
      const {topEntries, pointedEntry, selectedEntry, dispatch} = this.props;
      return (
        <div className="row">
          <div className="col-md-6">
            {topEntries && <div>{topEntries.map(entry =>
              this._renderEntry(entry, selectedEntry === entry)
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
    }

  });

};
