import axios from 'axios';
import { pushState } from 'redux-react-router';
import { user } from '../config';

function requestData() {
	return {type: types.REQ_DATA}
};

function receiveData(json) {
	return {
		type: types.RECV_DATA,
		data: json
	}
};

function receiveError(json) {
	return {
		type: types.RECV_ERROR,
		data: json
	}
};

export function createUser(user) {
  return (dispatch: Function) => {
      const { auth } = store.getState()
      dispatch(requestData());
      return axios.post(`${user}/create`, {
          username: user.username,
          password: user.password,
          bio: user.bio
      }, {auth: auth}).then(response => {
          dispatch(receiveData(response.data));
      }).catch(response => {
          dispatch(receiveError(response.data));
          dispatch(pushState(null,'/error'));
      });
  }
};