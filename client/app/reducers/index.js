// @flow
import { combineReducers } from 'redux';
import { routerReducer as routing } from 'react-router-redux';
import { reducer as formReducer } from 'redux-form';
import auth from './auth';
import message from './message';

const rootReducer = combineReducers({
  auth: auth,
  routing,
  messages: message,
  form: formReducer
});

export default rootReducer;
