import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import { hashHistory } from 'react-router';
import { routerMiddleware, push } from 'react-router-redux';
import createLogger from 'redux-logger';
import rootReducer from '../reducers';

import createSocketIoMiddleware from 'redux-socket.io';
import io from 'socket.io-client';

import * as authActions from '../actions/auth';

let store;

const actionCreators = {
  ...authActions,
  push,
};

const logger = createLogger({
  level: 'info',
  collapsed: true
});

const router = routerMiddleware(hashHistory);

// If Redux DevTools Extension is installed use it, otherwise use Redux compose
/* eslint-disable no-underscore-dangle */
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
    // Options: http://zalmoxisus.github.io/redux-devtools-extension/API/Arguments.html
    actionCreators,
  }) :
  compose;
/* eslint-enable no-underscore-dangle */

const socket = io.connect('http://localhost:4000/chatns');
const socketIoMiddleware = createSocketIoMiddleware(socket, '', {execute: socketExecutor});

const enhancer = composeEnhancers(
  applyMiddleware(thunk, socketIoMiddleware, router, logger)
);

function socketExecutor (action, emit, next, dispatch) {
  console.log('executing');
  emit('authenticate', {token: store.getState().auth.token})
    .on('authenticated', function () {
      console.log('authed');
      emit('action', action);
    });
  next(action);
}

export default function configureStore(initialState: Object) {

  store = createStore(rootReducer, initialState, enhancer);

  if (module.hot) {
    module.hot.accept('../reducers', () =>
      store.replaceReducer(require('../reducers')) // eslint-disable-line global-require
    );
  }

  return store;
}
