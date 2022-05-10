import {getConfig} from 'helper/config'

export const getItemImage = function (item,width = 500) {
    if (!item.get('local_path')) {
        return item.get('http_image_url');
    }
    let api = getConfig('API');
    return api + '/v1/item/image?contract_address=' + item.get('contract_address') + '&token_id=' + item.get('token_id') + '&width=' + width;
}
