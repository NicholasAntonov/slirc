import {
    SEND_MESSAGE,
    JOIN_CHANNEL,
    LEAVE_CHANNEL,
    PRIVATE_MESSAGE,
    USER_LIST,
    CHANNEL_LIST,
    JOINED_CANNELS
} from '../actions/types';

const INITIAL_STATE = {
    channels: {}
};

export default function (state = INITIAL_STATE, action) {
    return state;
};
