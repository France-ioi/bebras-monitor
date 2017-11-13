
import React from 'react';
import {Nav, NavItem} from 'react-bootstrap';
import {connect} from 'react-redux';

export default function (tabs) {

  const tabByKey = {};
  tabs.forEach(function (tab) {
    tabByKey[tab.key] = tab;
  });

  function tabsSelector ({activeTabKey, actions: {setActiveTab}}, props) {
    return {activeTabKey, setActiveTab};
  }

  function activeTabSelector ({activeTabKey, views}, props) {
    const tab = activeTabKey && tabByKey[activeTabKey];
    const View = tab && tab.view && views[tab.view];
    return {View};
  }

  class Tabs extends React.PureComponent {
    render () {
      let {activeTabKey} = this.props;
      const items = tabs.map(function (tab) {
        const {key, label} = tab;
        const enabled = true; // add logic here if tabs can be disabled
        return <NavItem key={key} eventKey={key} disabled={!enabled}>{label}</NavItem>;
      });
      return <Nav bsStyle="pills" onSelect={this._setActiveTab} activeKey={activeTabKey}>{items}</Nav>;
    }
    _setActiveTab = (key) => {
      this.props.setActiveTab(key);
    };
  }

  class ActiveTab extends React.PureComponent {
    render () {
      const {View} = this.props;
      return View ? <View/> : false;
    }
  }

  return {
    actionBuilders: {
      setActiveTab: (key) => ({type: 'Navigation.SetActiveTab', payload: {key}})
    },
    actionReducers: {
      'Navigation.SetActiveTab': (state, {payload: {key}}) =>
        ({...state, activeTabKey: key})
    },
    views: {
      Tabs: connect(tabsSelector)(Tabs),
      ActiveTab: connect(activeTabSelector)(ActiveTab),
    }
  };

};
