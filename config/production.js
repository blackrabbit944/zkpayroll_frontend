module.exports =  {

    'ENV'               : 'production',

    'API'               : 'https://api.tinyclub.com',
    'WEBSITE'           : 'https://www.tinyclub.com',
    'LOGO'              : 'online',
    'FORBIDDEN_CHINA'   : true,
    'GA_TRACKING_ID'    : 'G-5FDR19R00J',

    'ETH_SIGN_NAME'     : 'tinyclub',

    'ETH_NETWORK'       : {
        "chainId": "0x1",
        "chainName": "ETH-Mainnet",
        "rpcUrls": ["https://mainnet.infura.io/v3/4a5626cf876649b9959a5a99af27ad12"],
        "nativeCurrency": {
            "name"      : "ETH",
            "symbol"    : "ETH",
            "decimals"  : 18
        },
        "blockExplorerUrls": [
            "https://www.etherscan.io/"
        ]
    },

    'DISCORD' : {
        'client_id' : '969947035409207306'
    },

    'TINYCLUB_FACTORY_CONTRACT' : {
        'contract_address'  :   '0xe03f940941c50a75113e69c9330ed377c04d43b8'
    }

}