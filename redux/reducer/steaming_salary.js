import { normalize } from 'normalizr';
import Immutable from 'immutable';
import {httpRequest} from 'helper/http'
import { getHashByData,removeValueEmpty,sortArray} from 'helper/common'

import { steamingSalaryListSchema ,steamingSalarySchema } from 'redux/schema/index'

export const BEFORE_LOAD_STEAMING_SALARY_LIST = 'BEFORE_LOAD_STEAMING_SALARY_LIST'
export const LOAD_STEAMING_SALARY_LIST_SUCCESS = 'LOAD_STEAMING_SALARY_LIST_SUCCESS'
export const LOAD_STEAMING_SALARY_LIST_FAILURE = 'LOAD_STEAMING_SALARY_LIST_FAILURE'

export function loadSteamingSalaryList(condition) {

    condition = removeValueEmpty(condition);
    var hash = getHashByData(condition)
    return {
        // 要在之前和之后发送的 action types
        types: ['BEFORE_LOAD_STEAMING_SALARY_LIST', 'LOAD_STEAMING_SALARY_LIST_SUCCESS', 'LOAD_STEAMING_SALARY_LIST_FAILURE'],
        // 检查缓存 (可选):
        shouldCallAPI:  (state) => !state.getIn(['steaming_salary',hash,'is_fetching']),
        // 进行取：
        callAPI: () => {
            return httpRequest({
                'method'  : 'GET',
                'url'     : '/v1/steaming_salary/list',
                'data'    : condition
            })
        },

        data_format : (result) => {
            var output = normalize(result.data, steamingSalaryListSchema)
            return output
        },

        show_status : {
            'loading'   :    false,
            'success'   :    false,
            'error'     :    false
        },

        payload: {
            hash : hash
        }
    };
}



//添加
export const BEFORE_ADD_STEAMING_SALARY  = 'BEFORE_ADD_STEAMING_SALARY'
export const ADD_STEAMING_SALARY_SUCCESS = 'ADD_STEAMING_SALARY_SUCCESS'
export const ADD_STEAMING_SALARY_FAILURE = 'ADD_STEAMING_SALARY_FAILURE'

export function addSteamingSalary(data) {
    // var hash = getHashByData(data)
    console.log('addSteamingSalary',data)
    return {
        // 要在之前和之后发送的 action types
        types: ['BEFORE_ADD_STEAMING_SALARY', 'ADD_STEAMING_SALARY_SUCCESS', 'ADD_STEAMING_SALARY_FAILURE'],
        // 检查缓存 (可选):
        shouldCallAPI:  (state) => { 
            if (state.getIn(['steaming_salary',data.club_id,'is_adding']) == true) {
                return false;
            }else {
                return true;
            }
        },
        // 进行取：
        callAPI: () => {
            return httpRequest({
                'url'    : '/v1/steaming_salary/add',
                'method' : 'POST', 
                'data'   : data
            })
        },
        data_format : (data) => normalize(data.data, steamingSalarySchema),

        show_status : {
            'loading'   :    false,
            'success'   :    false,
            'error'     :    true
        },
        payload: {
            club_id : data.club_id
        }
    };
}


//添加
export const BEFORE_UPDATE_STEAMING_SALARY  = 'BEFORE_UPDATE_STEAMING_SALARY'
export const UPDATE_STEAMING_SALARY_SUCCESS = 'UPDATE_STEAMING_SALARY_SUCCESS'
export const UPDATE_STEAMING_SALARY_FAILURE = 'UPDATE_STEAMING_SALARY_FAILURE'

export function updateSteamingSalary(steaming_salary_id,data) {
    // var hash = getHashByData(data)

    return {
        // 要在之前和之后发送的 action types
        types: ['BEFORE_UPDATE_STEAMING_SALARY', 'UPDATE_STEAMING_SALARY_SUCCESS', 'UPDATE_STEAMING_SALARY_FAILURE'],
        // 检查缓存 (可选):
        shouldCallAPI:  (state) => { 
            if (state.getIn(['steaming_salary','updating',steaming_salary_id]) == true) {
                return false;
            }else {
                return true;
            }
        },
        // 进行取：
        callAPI: () => {
            return httpRequest({
                'url'    : '/v1/steaming_salary/update',
                'method' : 'PATCH', 
                'data'   : {
                    id : steaming_salary_id,
                    ...data
                }
            })
        },
        data_format : (data) => normalize(data.data, steamingSalarySchema),

        show_status : {
            'loading'   :    'updating',
            'success'   :    'update success',
            'error'     :    true
        },
        payload: {
            'steaming_salary_id' : steaming_salary_id
        }
    };
}

//载入
export const BEFORE_LOAD_STEAMING_SALARY  = 'BEFORE_LOAD_STEAMING_SALARY'
export const LOAD_STEAMING_SALARY_SUCCESS = 'LOAD_STEAMING_SALARY_SUCCESS'
export const LOAD_STEAMING_SALARY_FAILURE = 'LOAD_STEAMING_SALARY_FAILURE'

export function loadSteamingSalary(contract_address) {

    return {
        // 要在之前和之后发送的 action types
        types: ['BEFORE_LOAD_STEAMING_SALARY', 'LOAD_STEAMING_SALARY_SUCCESS', 'LOAD_STEAMING_SALARY_FAILURE'],
        // 检查缓存 (可选):
        shouldCallAPI:  (state) => { 
            if (state.getIn(['steaming_salary',contract_address,'is_fetching']) == true) {
                return false;
            }else {
                return true;
            }
        },
        // 进行取：
        callAPI: () => {
            return httpRequest({
                'url'    : '/v1/steaming_salary/load',
                'method' : 'GET', 
                'data'   : {
                    'contract_address' : contract_address
                }
            })
        },
        data_format : (data) => normalize(data.data, steamingSalarySchema),

        show_status : {
            'loading'   :    false,
            'success'   :    false,
            'error'     :    false
        },
        payload: {
            'contract_address' : contract_address
        }
    };
}


//载入
export const BEFORE_DELETE_STEAMING_SALARY  = 'BEFORE_DELETE_STEAMING_SALARY'
export const DELETE_STEAMING_SALARY_SUCCESS = 'DELETE_STEAMING_SALARY_SUCCESS'
export const DELETE_STEAMING_SALARY_FAILURE = 'DELETE_STEAMING_SALARY_FAILURE'

export function deleteSteamingSalary(steaming_salary_id) {

    return {
        // 要在之前和之后发送的 action types
        types: ['BEFORE_DELETE_STEAMING_SALARY', 'DELETE_STEAMING_SALARY_SUCCESS', 'DELETE_STEAMING_SALARY_FAILURE'],
        // 检查缓存 (可选):
        shouldCallAPI:  (state) => { 
            if (state.getIn(['steaming_salary',steaming_salary_id,'is_deleting']) == true) {
                return false;
            }else {
                return true;
            }
        },
        // 进行取：
        callAPI: () => {
            return httpRequest({
                'url'    : '/v1/steaming_salary/delete',
                'method' : 'DELETE', 
                'is_api' : false,
                'data'   : {
                    'id' : steaming_salary_id
                }
            })
        },
        // data_format : (data) => normalize(data, steamingSalarySchema),

        show_status : {
            'loading'   :    true,
            'success'   :    "delete success",
            'error'     :    true
        },
        payload: {
            'steaming_salary_id' : steaming_salary_id
        }
    };
}


export function initSteamingSalary(steaming_salary_id,response) {
    console.log('debug008,call init club');
    return {
        type             : LOAD_STEAMING_SALARY_SUCCESS,
        payload : {
            steaming_salary_id     : steaming_salary_id,
            response        : response
        }
    }
}





export function reducer(state = Immutable.fromJS({
    'list' : {},
    'updating' : {},
    'map' : {}
}), action) {
    switch (action.type) {
        case BEFORE_ADD_STEAMING_SALARY:
            return state.setIn([action.payload.club_id,'is_adding'],true)

        case ADD_STEAMING_SALARY_SUCCESS:
        case ADD_STEAMING_SALARY_FAILURE:
            return state.setIn([action.payload.club_id,'is_adding'],false)

        case BEFORE_UPDATE_STEAMING_SALARY:
            return state.setIn(['updating',action.payload.steaming_salary_id],true)

        case UPDATE_STEAMING_SALARY_SUCCESS:
        case UPDATE_STEAMING_SALARY_FAILURE:
            return state.deleteIn(['updating',action.payload.steaming_salary_id])


        case BEFORE_LOAD_STEAMING_SALARY:
            return state.setIn([action.payload.contract_address,'is_fetching'],true)

        case LOAD_STEAMING_SALARY_SUCCESS:
            return state.setIn([action.payload.contract_address,'is_fetching'],false)
                .setIn(['map',action.payload.contract_address],action.payload.response.result)

        case LOAD_STEAMING_SALARY_FAILURE:
            return state.setIn([action.payload.contract_address,'is_fetching'],false)


       case BEFORE_LOAD_STEAMING_SALARY_LIST:
            if (!state.getIn(['list',action.payload.hash,'list'])) {
                state = state.setIn(['list',action.payload.hash,'list'],Immutable.List([]));
            }
            return state
            .setIn(['list',action.payload.hash,'is_fetching'],true)
            .setIn(['list',action.payload.hash,'is_fetched'],false)
            .setIn(['list',action.payload.hash,'is_end'],false)

        case LOAD_STEAMING_SALARY_LIST_SUCCESS:
            return state.setIn(['list',action.payload.hash,'is_fetching'],false)
            .setIn(['list',action.payload.hash,'is_fetched'],true)
            .setIn(['list',action.payload.hash,'list'],Immutable.List(action.payload.response.result))

        case LOAD_STEAMING_SALARY_LIST_FAILURE:
            return state.setIn([action.payload.hash,'is_fetching'],false)

        case BEFORE_DELETE_STEAMING_SALARY:
            return state.setIn([action.club_id,'is_deleting'],true)

        case DELETE_STEAMING_SALARY_SUCCESS:
        case DELETE_STEAMING_SALARY_FAILURE:
            return state.setIn([action.club_id,'is_deleting'],false)

        default:
            return state
    }
}


