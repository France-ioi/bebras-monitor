
import {eventChannel, buffers} from 'redux-saga';
import {take, put} from 'redux-saga/effects';

// Event channel for focus/blur events.
// Only the most recent event is kept in the buffer.
const channel = eventChannel(function (listener) {
  function onFocus () {
    listener(true);
  }
  function onBlur () {
    listener(false);
  }
  window.addEventListener('focus', onFocus);
  window.addEventListener('blur', onBlur);
  // Make sure the window is initially focused so we get a blur event.
  window.focus()
  onFocus();
  return function () {
    window.removeEventListener('focus', onFocus);
    window.removeEventListener('blur', onBlur);
  };
}, buffers.sliding(1));

function setWindowActiveReducer (state, {payload: {isActive}}) {
  return {...state, isActive};
}

function isWindowActiveSelector (state) {
  return state.isActive;
}

// Lift focus/blur events into setWindowActive actions.
function* monitorWindowActive (actions) {
  while (true) {
    let isActive = yield take(channel);
    yield put(actions.setWindowActive(isActive));
  }
}

export default {
  actionBuilders: {
    setWindowActive: (isActive) => ({type: 'Window.SetActive', payload: {isActive}}),
  },
  actionReducers: {
    'Window.SetActive': setWindowActiveReducer,
  },
  selectors: {
    isWindowActive: isWindowActiveSelector,
  },
  sagas: [
    monitorWindowActive,
  ],
};
