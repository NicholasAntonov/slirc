// @flow
import React from 'react';
import { Route, IndexRoute } from 'react-router';
import App from './containers/App';
import Dashboard from './containers/Dashboard';
import RegisterPage from './containers/RegisterPage';
import LoginPage from './containers/LoginPage';
import NotFoundPage from './containers/NotFoundPage';
import RequireAuth from './containers/RequireAuth';


export default (
  <Route path="/" component={App}>
    <IndexRoute component={RequireAuth(Dashboard)} />
    <Route path="/register" component={RegisterPage} />
    <Route path="/login" component={LoginPage} />
    <Route path="*" component={NotFoundPage} />
  </Route>
);
