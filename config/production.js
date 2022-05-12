module.exports =  {

    'ENV'               : 'production',

    'API'               : 'http://prod.api.zkpayroll.com',
    'WEBSITE'           : 'http://prod.www.zkpayroll.com',
    'LOGO'              : 'online',
    'FORBIDDEN_CHINA'   : true,
    'GA_TRACKING_ID'    : 'G-5FDR19R00J',

    'ETH_SIGN_NAME'     : 'zkpayroll',

    // 'OPERATOR_CONTRACT_ADDRESS' : '0x467fd39f7c75F0B21EB35B8A6Fb500ff42AaAd49',

    ///ETH网络配置
    'ETH_NETWORK'       : {
        "chainId": "0x61", // 42
        "chainName": "BSC-test",
        "rpcUrls": ["https://data-seed-prebsc-1-s1.binance.org:8545/"],
        "nativeCurrency": {
            "name"      : "BNB",
            "symbol"    : "BNB",
            "decimals"  : 18
        },
        "blockExplorerUrls": [
            "https://testnet.bscscan.com"
        ]
    },

    'ETHERSCAN_BASE'    : 'https://testnet.bscscan.com',

    'SALARY_TOKEN_LIST' : {
        '0xed24fc36d5ee211ea25a80239fb8c4cfd80f12ee'    :  'busd',
        '0x822ca080e094bf068090554a19bc3d6618c800b3'    :  'usdt'
    },

    'ZKPAYROLL_CONTRACT_ADDRESS'        :   '0x51A28a9A15047f46AA0BD587d3327a086cae55BE',

    'STEAMING_PAY_CONTRACT_ADDRESS'     :   '0xd8cf6CB47fDf8384D7a87E39F37E585fFdF08155',

    'ZKPAY_CONTRACT_ADDRESS'            :   '0x426A2aF1D0bD8996E693aa8d44F2EB406d54BEf8'

}