
import React from 'react';
import {connect} from 'react-redux';

class ActionsTab extends React.PureComponent {
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
  _onSelectEntry = (entry) => {
    this.props.selectEntry(entry.key);
  };
  _onShowEntry = (entry) => {
    this.props.showEntry(entry.key);
  };
}

function ActionsTabSelector (state, props) {
  const {actions: {selectEntry, showEntry}, views: {EntryList, EntryPanel}, actionEntries: entries, selectedEntry, pointedEntry} = state;
  return {selectEntry, showEntry, EntryList, EntryPanel, entries, selectedEntry, pointedEntry};
}

function selectActionEntries ({entries}) {
  const actionEntries = [];
  if (entries) {
    Object.keys(entries).forEach(function (key) {
      const entry = entries[key];
      if (entry.action) {
        actionEntries.push(entry);
      }
    });
  }
//  console.log('entries', entries, 'actionEntries', actionEntries);
  return actionEntries;
}

export default {
  views: {
    ActionsTab: connect(ActionsTabSelector)(ActionsTab)
  },
  lateReducer: (state, _action) => ({...state, actionEntries: selectActionEntries(state)})
};
