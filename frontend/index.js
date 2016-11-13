
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import EpicComponent from 'epic-component';
import {link, defineAction, addReducer, defineView} from 'epic-linker';

import 'font-awesome/css/font-awesome.min.css!';
// import '../style.scss!';

const {store, scope, start} = link(function* () {

  yield defineAction('init', 'System.Init');
  yield addReducer('init', _ => {});

  yield defineView('App', EpicComponent(self => {

    self.render = function () {
      return <p>It works!</p>;
    };

  }));

});

store.dispatch({type: scope.init});
start();

const container = document.getElementById('react-container');
ReactDOM.render(<Provider store={store}><scope.App/></Provider>, container);
