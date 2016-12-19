import axios from 'axios';
import { push } from 'react-router-redux';
import {
    SEND_MESSAGE,
    JOIN_CHANNEL,
    LEAVE_CHANNEL,
    PRIVATE_MESSAGE,
    USER_LIST,
    CHANNEL_LIST,
    JOINED_CANNELS
} from './types';
import { user_url } from '../config';

export function sendMessage(channel, message) {
    return function(dispatch) {
        dispatch({
            type: SEND_MESSAGE, msg: {
                channelName: channel,
                text: message
            }
        });
    };
}

