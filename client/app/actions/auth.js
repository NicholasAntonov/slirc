import axios from 'axios';  
import { push } from 'react-router-redux';
import { AUTH_USER,  
         AUTH_ERROR,
         UNAUTH_USER,
         PROTECTED_TEST } from './types';
import { user_url } from '../config';

export function errorHandler(dispatch, error, type) {  
  let errorMessage = '';

  if (error.data.error) {
    errorMessage = error.data.error;
  } else if (error.data) {
    errorMessage = error.data;
  } else {
    errorMessage = error;
  }

  if(error.status === 401) {
    dispatch({
      type: type,
      payload: 'You are not authorized to do this. Please login and try again.'
    });
    logoutUser();
  } else {
    dispatch({
      type: type,
      payload: errorMessage
    });
  }
}

export function loginUser({ username, password }) {  
  return function(dispatch) {
    axios.post(`${user_url}/login`, { username, password })
    .then(response => {
      if (response.data.success) {
        // TODO: save user / token
        dispatch({ type: AUTH_USER });
        dispatch(push('/dashboard'));
      }
    })
    .catch((error) => {
      errorHandler(dispatch, error.response, AUTH_ERROR)
    });
    }
  }

export function registerUser({ username, password }) {  
  return function(dispatch) {
    axios.post(`${user_url}/create`, { username, password })
    .then(response => {
      return loginUser({username, password})(dispatch);
    })
    .catch((error) => {
      errorHandler(dispatch, error.response, AUTH_ERROR)
    });
  }
}

export function logoutUser() {  
  return function (dispatch) {
    dispatch({ type: UNAUTH_USER });
  }
}

export function protectedTest({user, token}) {  
  return function(dispatch) {
    // TODO: get user / token
    axios.get(`${user_url}/${user}`, {
      headers: { 'Authorization': token }
    })
    .then(response => {
      dispatch({
        type: PROTECTED_TEST,
        payload: response.data.content
      });
    })
    .catch((error) => {
      errorHandler(dispatch, error.response, AUTH_ERROR)
    });
  }
}