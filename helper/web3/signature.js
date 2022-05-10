import {getAmountFromIntAmount,getIntAmountByAmount} from 'helper/number'
import {getConfig} from 'helper/config'
import {getUnixtime} from 'helper/time'
import eip55 from 'eip55'
// import {recoverTypedSignature_v4} from 'eth-sig-util'

import message from 'components/common/message'
import notification from 'components/common/notification'
import Metamask from 'helper/web3/metamask'

export default class Signature {

    constructor(t) {
        this.t = t;
    }

    async signData(address,msgParams,options = {}) {

        // console.log('debug-signData',address,msgParams,options);

        let params = [address, msgParams];
        const {t} = this;

        // console.log('debug02,t',t);
        // console.log('params',params);
        // console.log('msgParams',msgParams);
        try {

            window.ethereum.sendAsync(
                {
                  method  : 'eth_signTypedData_v4',
                  params  : params,
                  address : address,
                },
                function (err, result) {

                    console.log('debug-signData:error',err,result);

                    if (err) {

                        ///如果是chain不正确
                        if (err.code == -32603) {
                            let metamask = new Metamask();
                            metamask.checkChain();
                        }

                        if (options.onError) {
                            options.onError(err);
                        }
                        // message.error(err.message);
                        console.dir(err);
                        return false;
                    }else {
                        // console.log('TYPED SIGNED:' + JSON.stringify(result.result));
                        // console.log('debug-signData:success',err,result);

                        if (options.onSuccess) {
                            options.onSuccess({
                                'sign'    : result.result,
                                'params'  : msgParams,
                                'address' : address    
                            })
                        }
                    }
                    // if (result.error) {
                    //     alert(result.error.message);
                    // }
                    // if (result.error) return console.error('ERROR', result);
                    

                  // const recovered =  recoverTypedSignature_v4({
                  //   data: JSON.parse(msgParams),
                  //   sig: result.result,
                  // });

                  // console.log('recovered',recovered);

                  // if (
                  //   eip55.encode(recovered) === addr
                  // ) {
                  //   alert('Successfully recovered signer as ' + addr);
                  // } else {
                  //   alert(
                  //     'Failed to verify signer when comparing ' + recovered + ' to ' + addr
                  //   );
                  // }
                }
            );
        }catch(e) {
            console.log('signDataError',e);
        }


    }

    // async signOrderMessage(address,params,options, t) {

    //     console.log('signOrderMessage',address,params,options);

    //     let address_eip55 = eip55.encode(address);

    //     let config = getConfig('ETH_NETWORK');
    //     let name = getConfig('ETH_SIGN_NAME');

    //     let msgParams = JSON.stringify({
    //         domain : {
    //             chainId           : config.chainId,
    //             name              : name,
    //             version           : 1,
    //         },
    //         message : {
    //             create_time         : getUnixtime(),
    //             wallet_address      : address_eip55,
    //             action_name         : 'add_order',
    //             ...params
    //         },
    //         primaryType: 'Info',
    //         types: {
    //             // TODO: Clarify if EIP712Domain refers to the domain the contract is hosted on
    //             EIP712Domain: [
    //                 { name: 'name', type: 'string' },
    //                 { name: 'version', type: 'string' },
    //                 { name: 'chainId', type: 'uint256' },
    //             ],
    //             // Refer to PrimaryType
    //             Info: [
    //                 { name: 'create_time', type: 'uint256' },
    //                 { name: 'wallet_address', type: 'address' },
    //                 { name: 'action_name', type: 'string' },
    //                 { name: 'contract_address', type: 'address' },
    //                 { name: 'token_id', type: 'uint256' },
    //                 { name: 'price', type: 'string' },
    //                 { name: 'expire_time', type: 'uint256' }
    //             ],
    //         }
    //     })

    //     this.signData(address_eip55,msgParams,options,t)

    // }

    // async signCancelOrderMessage(address,params,options) {

    //     console.log('signOrderMessage',address,params,options);

    //     let address_eip55 = eip55.encode(address);

    //     let config = getConfig('ETH_NETWORK');
    //     let name = getConfig('ETH_SIGN_NAME');

    //     let msgParams = JSON.stringify({
    //         domain : {
    //             chainId           : config.chainId,
    //             name              : name,
    //             version           : 1,
    //         },
    //         message : {
    //             create_time         : getUnixtime(),
    //             wallet_address      : address_eip55,
    //             action_name         : 'cancel_order',
    //             ...params
    //         },
    //         primaryType: 'Info',
    //         types: {
    //             // TODO: Clarify if EIP712Domain refers to the domain the contract is hosted on
    //             EIP712Domain: [
    //                 { name: 'name', type: 'string' },
    //                 { name: 'version', type: 'string' },
    //                 { name: 'chainId', type: 'uint256' },
    //             ],
    //             // Refer to PrimaryType
    //             Info: [
    //                 { name: 'create_time', type: 'uint256' },
    //                 { name: 'wallet_address', type: 'address' },
    //                 { name: 'action_name', type: 'string' },
    //                 { name: 'contract_address', type: 'address' },
    //                 { name: 'token_id', type: 'uint256' },
    //             ],
    //         }
    //     })

    //     this.signData(address_eip55,msgParams,options)

    // }

    // async signUpdateOrderMessage(address,params,options) {

    //     console.log('signOrderMessage',address,params,options);

    //     let address_eip55 = eip55.encode(address);

    //     let config = getConfig('ETH_NETWORK');
    //     let name = getConfig('ETH_SIGN_NAME');

    //     let msgParams = JSON.stringify({
    //         domain : {
    //             chainId           : config.chainId,
    //             name              : name,
    //             version           : 1,
    //         },
    //         message : {
    //             create_time         : getUnixtime(),
    //             wallet_address      : address_eip55,
    //             action_name         : 'update_order',
    //             ...params
    //         },
    //         primaryType: 'Info',
    //         types: {
    //             // TODO: Clarify if EIP712Domain refers to the domain the contract is hosted on
    //             EIP712Domain: [
    //                 { name: 'name', type: 'string' },
    //                 { name: 'version', type: 'string' },
    //                 { name: 'chainId', type: 'uint256' },
    //             ],
    //             // Refer to PrimaryType
    //             Info: [
    //                 { name: 'create_time', type: 'uint256' },
    //                 { name: 'wallet_address', type: 'address' },
    //                 { name: 'action_name', type: 'string' },
    //                 { name: 'contract_address', type: 'address' },
    //                 { name: 'token_id', type: 'uint256' },
    //                 { name: 'price', type: 'string' },
    //             ],
    //         }
    //     })

    //     this.signData(address_eip55,msgParams,options)

    // }

    async signLoginMessage(address,options) {

        let address_eip55 = eip55.encode(address);

        let config = getConfig('ETH_NETWORK');
        console.log('debug-config',config)
        let name = getConfig('ETH_SIGN_NAME');

        let msgParams = JSON.stringify({
            domain : {
                chainId           : config.chainId,
                name              : name,
                version           : 1,
            },
            message : {
                create_time : getUnixtime(),
                wallet_address : address_eip55,
                action_name : 'login'
            },
            primaryType: 'Info',
            types: {
                // TODO: Clarify if EIP712Domain refers to the domain the contract is hosted on
                EIP712Domain: [
                    { name: 'name', type: 'string' },
                    { name: 'version', type: 'string' },
                    { name: 'chainId', type: 'uint256' },
                ],
                // Refer to PrimaryType
                Info: [
                    { name: 'create_time', type: 'uint256' },
                    { name: 'wallet_address', type: 'address' },
                    { name: 'action_name', type: 'string' },
                ],
            }
        })

        console.log('debug02,msgParams',msgParams);

        this.signData(address_eip55,msgParams,options)

    }
}