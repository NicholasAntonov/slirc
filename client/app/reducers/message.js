import {
    SEND_MESSAGE,
    JOIN_CHANNEL,
    LEAVE_CHANNEL,
    PRIVATE_MESSAGE,
    USER_LIST,
    CHANNEL_LIST,
    NEW_MESSAGE,
    JOINED_CANNELS
} from '../actions/types';
import _ from 'lodash';

const INITIAL_STATE = {
    messages: {},
    channelList: [],
    currentChannel: 'general'
};

export default function (state = INITIAL_STATE, action) {
    switch(action.type) {
    case CHANNEL_LIST:
        return {
            ...state,
            channelList: action.channels
        };
    case NEW_MESSAGE:
        const next = _.cloneDeep(state);
        if (!next.messages[action.channel]) {
            next.messages[action.channel] = [];
        }

        next.messages[action.channel].push(action);
        return next;
    }
    return state;
};
