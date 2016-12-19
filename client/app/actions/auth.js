import axios from 'axios';
import { push } from 'react-router-redux';
import { AUTH_USER,
         AUTH_ERROR,
         UNAUTH_USER,
         PROTECTED_TEST } from './types';
import { user_url } from '../config';

export function loginUser({ username, password }) {
  return function(dispatch) {
    axios.post(`${user_url}/login`, { username, password })
      .then(response => {
        if (!response.data.success) {
          throw new Error("Failed to log in");
        }
        dispatch({ type: AUTH_USER, payload: {user: username, token: response.data.token}});
        dispatch(push('/'));
      })
      .catch((error) => {
        logoutUser()(dispatch);
        dispatch({type: AUTH_ERROR, payload: error.message});
      });
  };
}

export function registerUser({ username, password }) {
  return function(dispatch) {
    axios.post(`${user_url}/create`, { username, password })
      .then(response => {
        if (!response.data.success)
          throw new Error(response.data.message);
        loginUser({username, password})(dispatch);
      })
      .catch((error) => {
        dispatch({type: AUTH_ERROR, payload: error.message});
      });
  };
}

export function logoutUser() {
  return function (dispatch) {
    dispatch({ type: UNAUTH_USER });
  };
}
