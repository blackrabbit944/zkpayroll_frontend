import getConfig from 'next/config'
import { getJwtToken } from 'helper/cookie'
import queryString from 'query-string'
import {urlStringify} from 'helper/common'
import message from 'components/common/message'
import {UserException,UnloginException} from 'helper/exception'

const { publicRuntimeConfig } = getConfig()

// console.log('debug,publicRuntimeConfig',publicRuntimeConfig);

let api_url_base = publicRuntimeConfig['env']['API'];

function catchApiError(result) {
    console.log('catchApiError',result)
    let msg_type = typeof result.message;

    if (msg_type == 'string') {
        message.error(result.message);
    }else if (msg_type == 'object') {
        Object.keys(result.message).map(one=>{
            message.error(result.message[one]);
        })
    }
}


function getApiUrl(url) {
    if (url.indexOf('/') == 0) {
        // console.log('publicRuntimeConfig',publicRuntimeConfig);
       return publicRuntimeConfig['env']['API']+url;
    }else {
      return url;
    }
}

/**
 * @function 参数拼接
 * @param {object} obj 只支持非嵌套的对象
 * @returns {string}
 */
function params(obj) {
  let result = '';
  let item;
  for (item in obj) {
    if (obj[item] && String(obj[item])) {
      result += `&${item}=${obj[item]}`;
    }
  }
  if (result) {
    result = '?' + result.slice(1);
  }
  return result;
}

// export const fetchData = async function(url) {

//     let fetch_url = getApiUrl(url)

//     const res = await fetch(fetch_url)
//     const data = await res.json()

//     catchError(data);

//     return data;
// }

// const catchError = function(data) {
//     if (data.status != 'success') {
//         if (data.messages) {
//             Object.keys(data.messages).map(k=>{
//                 message.error(data.messages[k]);
//             })
//         }
//     }
// }

// export const postData = async function(url,post_data) {
//     let fetch_url = getApiUrl(url)

//     let data = await fetchPost(fetch_url,data);
//     return data;
// }


// export const fetchPost = async function(url,post_data) {
//     console.log('准备发起请求',url,post_data);

//     const res = await fetch(url, {
//       body: JSON.stringify(post_data),
//       headers: {
//         'Content-Type': 'application/json'
//       },
//       method: 'POST'
//     })
//     const data = await res.json()

//     console.log('原始请求的结果是',data);

//     catchError(data);

//     console.log('准备把数据返回',data);

//     return data;
// }

// export const getData = async function(url,post_data) {
//     let fetch_url = getApiUrl(url)
//     let data = await fetchGet(fetch_url,post_data);
//     return data;
// }

// export const fetchGet = async function(url,post_data = null) {

//     console.log('准备发起请求',url,post_data);

//     let fetch_url
//     if (post_data) {
//       fetch_url = url + params(post_data)
//     }else {
//       fetch_url = url;
//     }
//     console.log('准备发起请求,实际的url',fetch_url);

//     let fetch_url = getApiUrl(fetch_url)

//     const res = await fetch(fetch_url,{
//       headers: {
//           'Content-Type'   : 'application/json',
//           'Authorization'  : getJwtToken() 
//       },
//       method: 'GET'
//     })
//     const data = await res.json()

//     console.log('原始请求的结果是',data);

//     catchError(data);

//     console.log('准备把数据返回',data);

//     return data;
// }


const fetchGetPromise = function(url,post_data = null) {

    // console.log('debug01,准备发起请求',url,post_data);

    let fetch_url
    if (post_data) {
      fetch_url = url + params(post_data)
    }else {
      fetch_url = url;
    }
    // console.log('debug01,准备发起请求,实际的url',fetch_url);

    if (fetch_url.indexOf('/') == 0) {
       fetch_url = publicRuntimeConfig['env']['API']+fetch_url;
    }


    return fetch(fetch_url,{
      headers: {
          'Content-Type'   : 'application/json',
          'Authorization'  : getJwtToken() 
      },
      method: 'GET'
    }).then(res=>{
        // console.log('debug01,获得原始结果时',res)
        return res.json()
    }).then(data=>{
        // console.log('debug01,获得结果时',data)
        if (data.status == 'error') {
            catchError(data);
        }
        return data;
    });

}


// export const postDataPromise = function(url,post_data) {
//     let fetch_url = publicRuntimeConfig['env']['API']+url;
//     return fetchPostPromise(fetch_url,post_data);
// }


// export const fetchPostPromise = function(url,post_data = null) {

//     console.log('debug01,准备发起请求',url,post_data);


//     return fetch(url, {
//       body: JSON.stringify(post_data),
//       headers: {
//           'Content-Type'   : 'application/json',
//           'Authorization'  : getJwtToken() 
//       },
//       method: 'POST'
//     }).then(res=>{
//         console.log('debug01,获得原始结果时',res)
//         return res.json()
//     }).then(data=>{
//         console.log('debug01,获得结果时',data)
//         if (data.status == 'error') {
//             catchError(data);
//         }
//         return data;
//     });



// }




// // export function getDomain(url) {
// //     return url.replace('http://','').replace('https://','').split(/[/?#]/)[0];
// // }



// export const getJwtHeader = function () {
//     return {
//       'Authorization'  : getJwtToken() 
//     }
// }

// export const uploadRequest = function (upload_config,data) {


//     var paramstr = queryString.stringify(data, {
//         skipNull: true
//     })

//     const def = {
//         'api_version'   : 'v1',
//         'multiple'      : false,
//     }
//     const conf = Object.assign(def,upload_config);

//     const upload_props = {
//         name: 'file',
//         action: getApiUrl('/'+conf.api_version+'/upload/img?'+ paramstr),
//         headers: {
//           'Authorization'  : getJwtToken() 
//         },
//         showUploadList : true,
//         multiple: conf.multiple,
//     };


//     return Object.assign(upload_props,upload_config)
// }

function uploadRequest(upload_config) {

    var header = {
      'Authorization'  : getJwtToken()
    }

    if (upload_config.action.indexOf('/') == 0) {
       upload_config.action = publicRuntimeConfig['env']['API']+upload_config.action;
    }

    const upload_props = {
        name: 'file',
        credentials : 'same-origin',
        mode: 'cors',
        headers: header,
        showUploadList : true,
        multiple: true,
    };

    return Object.assign(upload_props,upload_config)
}
// export getGranuality = function (unixtime_stamp) {

//     // console.log('diuff',unixtime_stamp)
//     if (unixtime_stamp > 86400 * 30 * 9) {
//         return 86400 * 30;
//     }else if(unixtime_stamp > 86400 * 30 * 3) {
//         return 86400 * 7;
//     }else {
//         return 86400;
//     }
// }
      
const dealHttpResponse = (response) => {

    switch(response.status) {
        case 401:
            throw new UnloginException();
            break;

        case 400:
        case 422:
            // console.log('response/json',response.json().then(data=>{

            // }))
            // throw Error('请求参数不正确');
            return response.json()
            break;

        case 200:
            return response.json()
            break;

        case 500:
            throw Error('servers response error');
            break;

    }

}


export const httpRequest = function (input_data)
{

    const def = {
        'method'        : 'GET',
        'with_jwt_token': true,
        'data'          : {},
        'api_type'      : null
    }

    const conf = Object.assign(def,input_data);

    const {data,method,with_header,with_jwt_token,api_type} = conf;

    let url = getApiUrl(conf.url)

    var fetch_options = {
        // cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        // credentials: 'same-origin', // include, same-origin, *omit
        credentials : 'same-origin',
        method: method, // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, cors, *same-origin
    }

    if (with_jwt_token) {
        fetch_options['headers'] = {
          'Authorization'  : getJwtToken()
        }
    }

    switch(method) {
        case 'POST':
            var form = new FormData();
            for (var i in data) {
                form.append(i, data[i])
            } 
            fetch_options['body'] = form;
            break;
        case 'GET':
            url = urlStringify(data,url)
            break;
        case 'DELETE':
        case 'PATCH':
            fetch_options['body'] = queryString.stringify(data);
            fetch_options['headers']['Content-Type'] = "application/x-www-form-urlencoded";
            break;
    }


    return fetch(url,fetch_options).then(response => {
        return dealHttpResponse(response);
    }).then(json_data => {

        // console.log('debug02,获得json的数据',json_data)
        // console.log('debug02,getConfig',getConfig('env'))

        // if (getConfig('env') == 'local') {
        //     console.log('请求URL和结果',url,json_data);
        // }

        if (json_data.code && json_data.code != 200) {
            // console.log('json_data',json_data);
            // console.log('json_data.messages',json_data.messages);
            // console.log('json_data.messages.join',json_data.messages.join(','));
            throw json_data;
            
            // if (json_data.messages) {
            //     throw Error('error : '+json_data.messages.join(','));
            // }else if(json_data.message){
            //     throw Error('error : '+json_data.message);
            // }else {
            //     throw Error('unkown errors');
            // }
        }


        // console.log('errr');
        return json_data
    }).catch(e=>{
        // console.log('debug02,HTTP request捕获错误',e)
        if (e.name == 'UnloginException') {
            // console.log('debug02,捕获未登录错误',e)
            throw e;
        }else {
            throw e;
        }
    })
}

export const httpRequestAwait = async function (input_data)
{

    const def = {
        'method'        : 'GET',
        'data'          : {},
        'jwt_token'     : null
    }

    const conf = Object.assign(def,input_data);

    let {data,method,with_header,jwt_token,url} = conf;

    var fetch_options = {
        credentials : 'same-origin',
        method: method, // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, cors, *same-origin
    }

    if (jwt_token) {
        fetch_options['headers'] = {
          'Authorization'  : 'Bearer ' +jwt_token
        }
    }

    console.log('debug:fetch_options',fetch_options);

    switch(method) {
        case 'POST':
            var form = new FormData();
            for (var i in data) {
                form.append(i, data[i])
            } 
            fetch_options['body'] = form;
            break;
        case 'GET':
            url = urlStringify(data,url)
            break;
        case 'DELETE':
        case 'PATCH':
            fetch_options['body'] = queryString.stringify(data);
            fetch_options['headers']['Content-Type'] = "application/x-www-form-urlencoded";
            break;
    }


    let response = await fetch(url,fetch_options);
    console.log('debug:fetch_response',response);
    
    return dealHttpResponse(response);

}

module.exports = {
    httpRequest         : httpRequest,
    fetchGetPromise     : fetchGetPromise,
    httpRequestAwait    : httpRequestAwait,
    uploadRequest       : uploadRequest,
    catchApiError       : catchApiError
}
// export const downloadRequest = function (input_data)
// {

//     const def = {
//         'method'        : 'GET',
//         'api_version'   : 'v1',
//         'is_api'        : false,
//         'data'          : {}
//     }

//     const conf = Object.assign(def,input_data);

//     const {data,method,is_api,api_version,with_header} = conf;

//     let url =  (is_api) ? getUrl('api') + '/' + api_version +  conf.url
//                 : getUrl('api') + conf.url;


//     var fetch_options = {
//         credentials : 'same-origin',
//         headers: {
//           'Authorization'  : getJwtToken()
//         },
//         method: method, // *GET, POST, PUT, DELETE, etc.
//         mode: 'cors', // no-cors, cors, *same-origin
//     }

//     switch(method) {
//         case 'POST':
//             var form = new FormData();
//             for (var i in data) {
//                 form.append(i, data[i])
//             } 
//             fetch_options['body'] = form;
//             break;
//         case 'GET':
//             url = urlStringify(data,url)
//             break;
//         case 'DELETE':
//         case 'PATCH':
//             fetch_options['body'] = queryString.stringify(data);
//             fetch_options['headers']['Content-Type'] = "application/x-www-form-urlencoded";
//             break;
//     }

//     // console.log('fetch_options',fetch_options);

//     return fetch(url,fetch_options).then(response => {
//         // console.log('response',response);
//         var myHeaders = response.headers;

//         switch(response.status) {
//             case 401:
//                 throw Error('验证失败,需要检查下权限');
//                 break;

//             case 400:
//                 // console.log('response/json',response.json().then(data=>{
//                 // }))
//                 // throw Error('请求参数不正确');
//                 return response
//                 break;

//             case 200:
//                 return response
//                 break;

//             case 500:
//                 throw Error('servers response error');
//                 break;

//         }

//     })
// }      
