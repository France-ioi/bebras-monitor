
import React from 'react';
import {Panel, Radio} from 'react-bootstrap';
import classnames from 'classnames';
import {connect} from 'react-redux';

const keySubkeys = {
    activity: ['pass'],
    answer: ['pass'],
    checkPassword: ['pass', 'fail'],
    closeContest: ['pass'],
    createTeam: ['private', 'public'],
    destroySession: [''],
    error: [''],
    getRemainingTime: ['pass', 'fail'],
    loadContestData: ['pass'],
    loadIndex: [''],
    loadOther: ['data', 'fail'],
    loadPublicGroups : [''],
    loadSession: ['found', 'new'],
    request: ['total'],
    solutions: ['pass']
};

const barKeys = [
  'loadIndex',
  'loadPublicGroups',
  'loadSession',
  'checkPassword',
  'createTeam',
  'loadContestData',
  'getRemainingTime',
  'answer',
  'destroySession',
  'closeContest',
  'solutions',
  'loadOther',
  'request',
  'error'
];

const keyColor = {
  loadIndex: '#66ff66',
  loadPublicGroups: '#33cc33',
  loadSession: '#009933',
  checkPassword: '#00ffff',
  checkPassword_fail: '#ff3300',
  createTeam: '#00ccff',
  loadContestData: '#0066cc',
  getRemainingTime: '#ffcc99',
  getRemainingTime_fail: '#ff3300',
  answer: '#ffcc66',
  destroySession: '#cc99ff',
  closeContest: '#cc66ff',
  solutions: '#cc33ff',
  loadOther: '#ff99cc',
  loadOther_fail: '#ff3300',
  request: '#ff9933',
  error: '#ff3300'
};

const getKeyColor = key => {
    return keyColor[key] || keyColor[key.split('_')[0]];
    }

const getKeyLabel = key => keySubkeys[key].length > 1 ? key + ' ' + keySubkeys[key].join('/') : key;

const getCounterKey = (key, subkey) => subkey ? key + '_' + subkey : key;

const allKeys = (ks => {
    var ak = [];
    barKeys.forEach(key => {
        ks[key].forEach(subkey => {
            ak.push(getCounterKey(key, subkey));
        });
    });
    return ak;
    })(keySubkeys);

class EntryPanel extends React.PureComponent {
  render () {
    const {entry} = this.props;
    const {domains, action} = entry;
    const updatedAt = entry.updatedAt && new Date(entry.updatedAt);
    var total = 0;
    allKeys.forEach(key => { total += entry.counters[key]; });
    // <span className="entry-key">{key}</span>
    const header = (
      <div>
        <div className="pull-right">
          {updatedAt && <span className="has-tooltip">
            {updatedAt.toLocaleString()}
            <span className="tooltip">{updatedAt.toISOString()}</span>
          </span>}
        </div>
        <span>{entry.key}</span>
      </div>);
    const renderKeyBars = key => {
      let key1 = getCounterKey(key, keySubkeys[key][0]);
      let value1 = entry.counters[key1];
      let key2 = keySubkeys[key][1] ? getCounterKey(key, keySubkeys[key][1]) : '';
      let value2 = key2 ? entry.counters[key2] : 0;
      let bar1 = (
          <div className="hbar-value">
            <div className="hbar-background" style={{width: `${value1*100/total}%`, backgroundColor: getKeyColor(key1)}}></div>
            <div className="hbar-number">{value1}</div>
          </div>)
      let bar2 = key2 ? (
          <div className="hbar-value">
            <div className="hbar-background" style={{width: `${value2*100/total}%`, backgroundColor: getKeyColor(key2)}}></div>
            <div className="hbar-number">{value2}</div>
          </div>) : '';
      return (
        <li key={key}>
          <div className="hbar-label">{getKeyLabel(key)}</div>
          {bar1}
          {bar2}
        </li>
      );
    }
    return (
      <Panel header={header} key={entry.key}>
        <p>
          {entry.ip}
          {' '}
          {Array.isArray(domains) ? domains.join(' ') : domains}
        </p>
        <div className="entry-hbars">
          <ul className="hbars">
            {barKeys.map(renderKeyBars)}
          </ul>
        </div>
        <div className="bars-container">
          <ul className="bars">
            {allKeys.map(key => {
              let value = entry.counters[key];
              return (<li
                key={key}
                title={`${key}: ${value}`}
                style={{
                  width: (value*100/total)+'%',
                  backgroundColor: getKeyColor(key)
                }}></li>);
            })}
          </ul>
        </div>
        <div>
          <Radio inline checked={action === undefined} data-key='' onChange={this.onActionChange}>{"no action"}</Radio>
          <Radio inline checked={action === 'r'} data-key='r' onChange={this.onActionChange}>{"rate-limit"}</Radio>
          <Radio inline checked={action === 'b'} data-key='b' onChange={this.onActionChange}>{"blacklist"}</Radio>
          <Radio inline checked={action === 'w'} data-key='w' onChange={this.onActionChange}>{"whitelist"}</Radio>
          <Radio inline checked={action === 'W'} data-key='W' onChange={this.onActionChange}>{"bypass"}</Radio>
        </div>
      </Panel>
    );
  }
  onActionChange = (event) => {
    const action = event.currentTarget.getAttribute('data-key');
    const key = this.props.entry.key;
    this.props.setEntryAction(key, action);
  };
}

function EntryPanelSelector ({actions: {setEntryAction}}, props) {
  return {setEntryAction};
}

export default {
  views: {
    EntryPanel: connect(EntryPanelSelector)(EntryPanel)
  }
};
