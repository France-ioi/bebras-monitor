
import React from 'react';
import {Panel, Radio} from 'react-bootstrap';
import EpicComponent from 'epic-component';
import classnames from 'classnames';
import {defineView} from 'epic-linker';

export default function* (deps) {

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
    solutions: '#ffffff'
  };

  yield defineView('EntryPanel', EpicComponent(self => {

    self.render = function () {
      const {entry} = self.props;
      const {domains} = entry;
      const updatedAt = new Date(entry.updatedAt);
      let total = 0;
      barKeys.forEach(key => { total += entry[key]; });
      // <span className="entry-key">{key}</span>
      const header = (
        <div>
          <div className="pull-right">
            <span title={updatedAt.toISOString()}>{updatedAt.toLocaleString()}</span>
          </div>
          <span>{entry.key}</span>
        </div>);
      return (
        <Panel header={header}>
          <p>
            {entry.ip}
            {' '}
            {Array.isArray(domains) ? domains.join(' ') : domains}
          </p>
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
            <Radio inline checked={false}>no action</Radio>
            <Radio inline checked={false}>blacklist</Radio>
            <Radio inline checked={false}>whitelist</Radio>
            <Radio inline checked={false}>bypass</Radio>
          </div>
        </Panel>
      );
    };

  }));

};
