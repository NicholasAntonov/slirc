// @flow
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { Router, hashHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import routes from './routes';
import configureStore from './store/configureStore';
import './app.global.css';
import cookie from 'react-cookie';  

const store = configureStore();
const history = syncHistoryWithStore(hashHistory, store);
const token = cookie.load('token');

if (token) {  
  store.dispatch({ type: AUTH_USER });
}
render(
  <Provider store={store}>
    <Router history={history} routes={routes} />
  </Provider>,
  document.getElementById('root')
);
