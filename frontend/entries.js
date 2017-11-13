
import React from 'react';
import classnames from 'classnames';
import {takeEvery, call, fork} from 'redux-saga/effects'

import {asyncPostJson} from './backend_api';

class EntryList extends React.PureComponent {
  render () {
    const {entries, selectedEntry} = this.props;
    return (
      <div>
        {entries && entries.map(entry =>
          <EntryItem key={entry.key} entry={entry} isSelected={selectedEntry === entry}
            onClick={this._onSelectEntry} onHover={this._onShowEntry} />)}
      </div>
    );
  }
  _onSelectEntry = (entry) => {
    this.props.selectEntry(entry.key);
  };
  _onShowEntry = (entry) => {
    this.props.showEntry(entry.key);
  };
}

class EntryItem extends React.PureComponent {
  render () {
    const {entry: {key, ip, total, action, domains}, isSelected, onClick, onHover} = this.props;
    const entryClasses = ["entry-table", isSelected && "entry-selected"];
    return (
      <div className={classnames(entryClasses)} onClick={onClick && this._onClick} onMouseOver={onHover && this._onHover}>
        <span className="entry-ip number">{ip}</span>
        <span className="entry-total number">{total}</span>
        <span className="entry-action">{action}</span>
        <span className="entry-domain number">
          {domains === undefined ? 'unknown' :
           domains === false ? 'not found' :
           domains.join(',')}
         </span>
      </div>
    );
  }
  _onClick = (event) => {
    this.props.onClick(this.props.entry);
  };
  _onHover = (event) => {
    this.props.onHover(this.props.entry);
  };
}

function showEntryReducer (state, {payload: {key}}) {
  return {...state, pointedEntryKey: key};
}

function selectEntryReducer (state, {payload: {key}}) {
  if (key === state.selectedEntryKey) {
    return {...state, selectedEntryKey: undefined};
  }
  return {...state, selectedEntryKey: key};
}

function* setEntryActionSaga ({payload: {key, action}}) {
  try {
    yield call(asyncPostJson, '/setAction', {key, action});
    // TODO: success feedback / refresh entry
  } catch (ex) {
    // TODO: error feedback
    console.log('setAction failed', ex);
  }
}

export default {
  actionBuilders: {
    setEntryAction: (key, action) => ({type: 'Entry.SetAction', payload: {key, action}}),
    showEntry: (key) => ({type: 'Entry.Show', payload: {key}}),
    selectEntry: (key) => ({type: 'Entry.Select', payload: {key}})
  },
  actionReducers: {
    'Entry.Show': showEntryReducer,
    'Entry.Select': selectEntryReducer,
  },
  lateReducer: (state) => {
    const pointedEntry = state.entries && state.entries[state.pointedEntryKey];
    const selectedEntry = state.entries && state.entries[state.selectedEntryKey];
    return {...state, pointedEntry, selectedEntry};
  },
  sagas: [
    function* () {
      yield takeEvery('Entry.SetAction', setEntryActionSaga);
    }
  ],
  views: {
    EntryList
  },
};
