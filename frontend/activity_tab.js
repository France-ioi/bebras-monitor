
import React from 'react';
import {connect} from 'react-redux';

import {EntryList} from './entries';

class ActivityTab extends React.PureComponent {
  render () {
    const {entries, pointedEntry, selectedEntry, selectEntry, showEntry, EntryList, EntryPanel} = this.props;
    return (
      <div className="row">
        <div className="col-md-6">
          <EntryList entries={entries} selectedEntry={selectedEntry}
            selectEntry={selectEntry} showEntry={showEntry} />
        </div>
        <div className="col-md-6">
          {selectedEntry &&
            <EntryPanel entry={selectedEntry} />}
          {pointedEntry && pointedEntry !== selectedEntry &&
            <EntryPanel entry={pointedEntry} />}
        </div>
      </div>
    );
  }
}

function ActivityTabSelector (state, props) {
  const {actions: {selectEntry, showEntry}, views: {EntryList, EntryPanel}, topEntries: entries, selectedEntry, pointedEntry} = state;
  return {selectEntry, showEntry, EntryList, EntryPanel, entries, selectedEntry, pointedEntry};
}

function selectTopEntries ({entries, topKeys}) {
  const topEntries = [];
  if (entries && topKeys) {
    let pointedEntry, selectedEntry;
    const nEntries = topKeys.length;
    for (let i = 0; i < nEntries; i += 1) {
      let key = topKeys[i];
      let entry = entries[key];
      topEntries.push(entry);
    }
  }
  return topEntries;
}

export default {
  views: {
    ActivityTab: connect(ActivityTabSelector)(ActivityTab)
  },
  lateReducer: (state, _action) => ({...state, topEntries: selectTopEntries(state)})
};
