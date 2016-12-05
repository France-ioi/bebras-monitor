
import React from 'react';
import {Panel, Radio} from 'react-bootstrap';
import EpicComponent from 'epic-component';
import classnames from 'classnames';
import {use, defineView} from 'epic-linker';

export default function* (deps) {

  yield use('setEntryAction');

  const barKeys = [
    'loadPublicGroups',
    'loadSession',
    'checkPassword',
    'createTeam',
    'loadContestData',
    'getRemainingTime',
    'answer',
    'destroySession',
    'closeContest',
    'solutions'
  ];

  const keyColor = {
    loadPublicGroups: '#ff0000',
    loadSession: '#e2571e',
    checkPassword: '#ff7f00',
    createTeam: '#ffff00',
    loadContestData: '#00ff00',
    getRemainingTime: '#96bf33',
    answer: '#0000ff',
    destroySession: '#4b0082',
    closeContest: '#8b00ff',
    solutions: '#f0f0f0'
  };

  yield defineView('EntryPanel', EpicComponent(self => {

    const onActionChange = function (event) {
      const action = event.currentTarget.getAttribute('data-key');
      const key = self.props.entry.key;
      self.props.dispatch({type: deps.setEntryAction, key, action});
    };

    self.render = function () {
      const {entry} = self.props;
      const {domains, action} = entry;
      const updatedAt = entry.updatedAt && new Date(entry.updatedAt);
      let total = 0;
      barKeys.forEach(key => { total += entry[key]; });
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
      return (
        <Panel header={header} key={entry.key}>
          <p>
            {entry.ip}
            {' '}
            {Array.isArray(domains) ? domains.join(' ') : domains}
          </p>
          <div className="entry-hbars">
            <ul className="hbars">
              {barKeys.map(key => {
                let value = entry[key];
                return (
                  <li key={key}>
                    <div className="hbar-label">{key}</div>
                    <div className="hbar-value">
                      <div className="hbar-background" style={{width: `${value / 10}px`, backgroundColor: keyColor[key]}}></div>
                      <div className="hbar-number">{value}</div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="bars-container">
            <ul className="bars">
              {barKeys.map(key => {
                let value = entry[key];
                return (<li
                  key={key}
                  title={`${key}: ${value}`}
                  style={{
                    width: (value*100/total)+'%',
                    backgroundColor: keyColor[key]
                  }}></li>);
              })}
            </ul>
          </div>
          <div>
            <Radio inline checked={action === undefined} data-key='' onChange={onActionChange}>no action</Radio>
            <Radio inline checked={action === 'b'} data-key='b' onChange={onActionChange}>blacklist</Radio>
            <Radio inline checked={action === 'w'} data-key='w' onChange={onActionChange}>whitelist</Radio>
            <Radio inline checked={action === 'W'} data-key='W' onChange={onActionChange}>bypass</Radio>
          </div>
        </Panel>
      );
    };

  }));

};
