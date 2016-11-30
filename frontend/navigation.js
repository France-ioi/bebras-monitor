
import React from 'react';
import {Nav, NavItem} from 'react-bootstrap';
import EpicComponent from 'epic-component';
import {defineAction, addReducer, defineSelector, defineView, use} from 'epic-linker';

export default tabs => function* (deps) {

  const tabByKey = {};
  const viewNames = [];
  tabs.forEach(function (tab) {
    tabByKey[tab.key] = tab;
    if (tab.view) {
      viewNames.push(tab.view);
    }
  });

  // Declare dependencies on all declared views.
  yield use.apply(null, viewNames);

  yield defineAction('setActiveTab', 'Navigation.ActiveTab.Set');

  yield addReducer('setActiveTab', function (state, action) {
    const {key} = action;
    return {...state, activeTabKey: key};
  });

  yield defineSelector('TabsSelector', function (state, props) {
    const {activeTabKey} = state;
    return {activeTabKey};
  });

  yield defineView('Tabs', 'TabsSelector', EpicComponent(self => {

    const setActiveTab = function (key) {
      self.props.dispatch({type: deps.setActiveTab, key});
    };

    self.render = function () {
      let {activeTabKey} = self.props;
      const items = tabs.map(function (tab) {
        const {key, label} = tab;
        const enabled = true; // add logic here if tabs can be disabled
        return <NavItem key={key} eventKey={key} disabled={!enabled}>{label}</NavItem>;
      });
      return <Nav bsStyle="pills" onSelect={setActiveTab} activeKey={activeTabKey}>{items}</Nav>;
    };

  }));

  yield defineView('ActiveTab', 'TabsSelector', EpicComponent(self => {

    self.render = function () {
      const {activeTabKey} = self.props;
      const viewName = tabByKey[activeTabKey].view;
      let content = false;
      if (viewName) {
        const View = deps[viewName];
        content = <View/>;
      }
      return content;
    };

  }));

};
