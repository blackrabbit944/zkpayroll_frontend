import {HYDRATE} from 'next-redux-wrapper';
import Immutable from "immutable";

import {LOGIN_SUCCESS,LOGOUT_SUCCESS,LOAD_LOGIN_USER_SUCCESS} from 'redux/reducer/user'
import {setJwtToken} from 'helper/cookie';
import {createAction} from 'helper/common'
import {httpRequest} from 'helper/http'
import {getConfig} from 'helper/config'
import {getCache} from 'helper/local'
import Cookies from 'universal-cookie';

import {userSchema,noteSchema} from 'redux/schema/index';
import { normalize, schema } from 'normalizr';


// import {LOAD_TOKEN_PAIR_INFO_SUCCESS} from 'redux/reducer/token_pair_info'

export const INIT_LOGIN_USER = 'INIT_LOGIN_USER'
export const initLoginUser = createAction('INIT_LOGIN_USER');

export const SET_GLOBAL_MODAL = 'SET_GLOBAL_MODAL'
export const setGlobalModal = createAction('SET_GLOBAL_MODAL');

export const SET_ACTIVE_CLUB_ID = 'SET_ACTIVE_CLUB_ID'
export const setActiveClub = createAction('SET_ACTIVE_CLUB_ID');


export const SET_SETTING = 'SET_SETTING'
export const setSetting = (payload) => {
    return {
        'type'      : SET_SETTING,
        'payload'   : {
            name  : payload.name,
            value : payload.value,
        }
    }
}
export const TOGGLE_SETTING = 'TOGGLE_SETTING'
export const toggleSetting = (name) => {
    return {
        'type'      : TOGGLE_SETTING,
        'payload'   : {
            name,
        }
    }
}

export const SET_SLIDER = 'SET_SLIDER'
export const setSlider = createAction('SET_SLIDER');

export const SET_LANGUAGE = 'SET_LANGUAGE'
export const setLanguage = createAction('SET_LANGUAGE');

// export const WALLET_LOGIN = 'WALLET_LOGIN'
// export const walletLogin = createAction('WALLET_LOGIN');

export const WALLET_LOGOUT = 'WALLET_LOGOUT'
export const walletLogout = createAction('WALLET_LOGOUT');

export const WALLET_CONNECT = 'WALLET_CONNECT'
export const walletConnect = createAction('WALLET_CONNECT');

// export const WALLET_ACCOUNT_CHANGE = 'WALLET_ACCOUNT_CHANGE'
// export const walletAccountChange = createAction('WALLET_ACCOUNT_CHANGE');

export const loginSuccess = createAction('LOGIN_SUCCESS');
export const mergeEntities = createAction('MERGE_ENTITES');
export const logoutSuccess = createAction('LOGOUT_SUCCESS');


export const BEFORE_INIT = 'BEFORE_INIT'
export const beforeInit = createAction('BEFORE_INIT');

export const AFTER_INIT = 'AFTER_INIT'
export const afterInit = createAction('AFTER_INIT');


export const BEFORE_INIT_APP = 'BEFORE_INIT_APP';
export const INIT_APP_SUCCESS = 'INIT_APP_SUCCESS';
export const INIT_APP_FAILED = 'INIT_APP_FAILED';

export function initApp() {

    return {
        // ?????????????????????????????? action types
        types: [BEFORE_INIT_APP, INIT_APP_SUCCESS, INIT_APP_FAILED],
        // ???????????? (??????):
        shouldCallAPI: (state)=> !state.getIn(['setting','is_initing']),
        // ????????????
        callAPI: () => {
            return httpRequest({
                'method'  : 'GET',
                'url'     : '/v1/init/login_user',
            })
        },
        data_format : (result) => {

            const tempSchame = new schema.Object({ login_user: userSchema });

            var output = normalize(result.data, tempSchame)
            return output

            // return result.data;
        },
        show_status : {
            'loading'   :    false,
            'success'   :    false,
            'error'     :    true
        },
        // ??? actions ?????????????????????????????????
        payload: {
        }
    };
}


export const BEFORE_LOAD_STATUS = 'BEFORE_LOAD_STATUS';
export const LOAD_STATUS_SUCCESS = 'LOAD_STATUS_SUCCESS';
export const LOAD_STATUS_FAILED = 'LOAD_STATUS_FAILED';

export function loadStatus() {

    return {
        // ?????????????????????????????? action types
        types: [BEFORE_LOAD_STATUS, LOAD_STATUS_SUCCESS, LOAD_STATUS_FAILED],
        // ???????????? (??????):
        shouldCallAPI: (state)=> !state.getIn(['setting','status','is_fetching']),
        // ????????????
        callAPI: () => {
            return httpRequest({
                'method'  : 'GET',
                'url'     : '/v1/status',
            })


        },
        data_format : (result) => {
            return result.data;
        },
        show_status : {
            'loading'   :    false,
            'success'   :    false,
            'error'     :    true
        },
        // ??? actions ?????????????????????????????????
        payload: {
        }
    };
}


export function reducer(state = Immutable.fromJS({
    'wallet'        : {
        'status'    : 'unconnected',    ///unconnected,connected
        'name'      : null,             ///metatmask,etc..
        'address'   : '',               ///wallet address
        'balance'   : 0,                ///wallet balance,
    },
    'active_club_id'        : null,
    'language'              : 'en',
    'global_modal'          : null,
    'login_user'            : null,
    'is_initing'            : false,
    'is_inited'             : false,
    'slider'                : true,
}), action) {

    switch (action.type) {

        case SET_ACTIVE_CLUB_ID:
            return state.setIn(['active_club_id'],action.payload);

        case BEFORE_INIT_APP:
            return state.setIn(['is_initing'],true)

        case INIT_APP_SUCCESS:
            return state
            .setIn(['is_initing'],false)
            .setIn(['is_inited'],true)
            .set('login_user',action.payload.response.result.login_user)

        case LOAD_LOGIN_USER_SUCCESS:
            return state.set('login_user',action.payload.response.result.login_user)

        case INIT_APP_FAILED:
            return state.setIn(['is_initing'],false)

        case BEFORE_LOAD_STATUS:
            return state.setIn(['status','is_fetching'],true);

        case LOAD_STATUS_SUCCESS:
            return state.setIn(['status','is_fetching'],false)
            .setIn(['status','is_fetched'],true)
            .setIn(['status','wallet_count'],action.payload.response.wallet_count)
            .setIn(['status','draw_count'],action.payload.response.draw_count)
            .setIn(['status','user_draw_count',action.payload.response.user_draw_count]);

        case LOAD_STATUS_FAILED:
            return state.setIn(['status','is_fetching'],false);


        case SET_SLIDER:
            return state.setIn(['slider'],action.payload);


        case SET_SETTING:
            return state.setIn([action.payload.name],action.payload.value);

        case TOGGLE_SETTING:
            var v = state.getIn([action.payload.name]);
            ///???????????????chat_box??????????????????
            // if (action.payload.name == 'is_show_chat_box' && !v) {
            //     state = state.set('unread_chat_message',0);
            // }
            return state.setIn([action.payload.name],!v);

        case WALLET_CONNECT:
            return state.setIn(['wallet'],Immutable.fromJS({
                'status'    : 'connected',
                'chain_id'  : action.payload.chain_id,
                'name'      : action.payload.name,
                'address'   : action.payload.address,
                'balance'   : action.payload.balance ? action.payload.balance : 0,
            }))

        // case WALLET_LOGIN: 
        //     return state.setIn(['wallet'],Immutable.fromJS({
        //         'status'    : 'connected',
        //         'chain_id'  : action.payload.chain_id,
        //         'name'      : action.payload.name,
        //         'address'   : action.payload.address,
        //         'balance'   : action.payload.balance ? action.payload.balance : 0,
        //     }))

        case WALLET_LOGOUT: 
            return state.setIn(['wallet','status'],'unconnected');

        case SET_LANGUAGE:
            return state.setIn(['language'],action.payload.toLowerCase());

        case SET_GLOBAL_MODAL:
            return state.setIn(['global_modal'],action.payload);

        case LOGIN_SUCCESS:
            if (action.payload && action.payload.response && action.payload.response.result) {
                return state.setIn(['login_user'],action.payload.response.result).setIn(['global_modal'],null);
            }else {
                return state;
            }

        case INIT_LOGIN_USER:
            return state.setIn(['login_user'],action.payload.result);

        case LOGOUT_SUCCESS:
            return state.setIn(['login_user'],null);

        case BEFORE_INIT:
            return state.setIn(['is_inited'],false)
                .setIn(['is_initing'],true);

        case AFTER_INIT:
            return state.setIn(['is_inited'],true)
                .setIn(['is_initing'],false);


        default:
            return state
    }
}

