
import {getConfig} from 'helper/config'

const allow_token_list = getConfig('SALARY_TOKEN_LIST');

console.log('allow_token_list',allow_token_list)

const invertKeyValues = obj => {
  Object.keys(obj).reduce((acc, key) => {
    acc[obj[key]] = key;
    return acc;
  }, {});
}
const allow_token_list_invert = invertKeyValues(allow_token_list)


export const getTokenName = (addr) => {
    if (addr) {
        addr = addr.toLowerCase();
    }
    if (allow_token_list[addr]) {
        return allow_token_list[addr].toUpperCase()
    }else {
        return '';
    }
}

export const getTokenAddress = (name) => {
    if (allow_token_list_invert[name]) {
        return allow_token_list_invert[name]
    }else {
        return '';
    }
}