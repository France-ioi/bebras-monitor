
import {eventChannel, buffers} from 'redux-saga';
import {take, put} from 'redux-saga/effects';
import {defineAction, addSaga, addReducer, defineSelector} from 'epic-linker';

export default function* (deps) {

  yield defineAction('setWindowActive', 'Window.SetActive');

  // Event channel for focus/blur events.
  // Only the most recent event is kept in the buffer.
  const channel = eventChannel(function (listener) {
    function onFocus () {
      listener(true);
    }
    function onBlur () {
      listener(false);
    }
    // Make sure the window is focused so we a blur event.
    window.focus()
    onFocus();
    window.addEventListener('focus', onFocus);
    window.addEventListener('blur', onBlur);
    return function () {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('blur', onBlur);
    };
  }, buffers.sliding(1));

  // Lift focus/blur events into setWindowActive actions.
  yield addSaga(function* monitorWindowActive () {
    while (true) {
      let isActive = yield take(channel);
      yield put({type: deps.setWindowActive, isActive});
    }
  });

  yield addReducer('setWindowActive', function (state, action) {
    const {isActive} = action;
    return {...state, isActive};
  });

  yield defineSelector('isWindowActive', function (state) {
    return state.isActive;
  });

};
