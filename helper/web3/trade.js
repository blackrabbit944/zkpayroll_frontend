import {getAmountFromIntAmount,getIntAmountByAmount} from 'helper/number'
import Metamask from 'helper/web3/metamask'
import autobind from 'autobind-decorator'
import { ethers } from "ethers";
import notification from 'components/common/notification'
import {getConfig} from 'helper/config'

const trade_abi = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"token","type":"address"},{"indexed":false,"internalType":"uint256","name":"tokenId","type":"uint256"},{"indexed":false,"internalType":"address","name":"from","type":"address"},{"indexed":false,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"closesky_fee","type":"uint256"}],"name":"Trade","type":"event"},{"inputs":[],"name":"_isPaused","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"_platformAccount","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"_verifier","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"uint256","name":"closeSkyFee","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"},{"internalType":"uint8","name":"v","type":"uint8"}],"name":"requireValidSign","outputs":[],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bool","name":"isPause","type":"bool"}],"name":"setPause","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"setPlatformAccount","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"verifier","type":"address"}],"name":"setVerifierAddress","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"address payable","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"uint256","name":"closeSkyFee","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"},{"internalType":"uint8","name":"v","type":"uint8"}],"name":"trade","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"}]

export default class Trade {

    constructor() {

        let contract_address = getConfig('OPERATOR_CONTRACT_ADDRESS');
 
        let provider = new ethers.providers.Web3Provider(window.ethereum)
        this.contract = new ethers.Contract(contract_address, trade_abi, provider.getSigner());

        this.metamask = new Metamask();
    }

    @autobind
    async checkConnect() {
        let account = await this.metamask.connectWallet();
        console.log('debug-check',account)

        if (account.connectedStatus == false) {
            // throw 'Unconnect Metamask';
            return false;
        }

        return true;
    }

    // async checkApproveForAll(owner_address,approve_address) {

    //     let ret = await this.checkConnect();

    //     let is_approve = await this.contract.isApprovedForAll(owner_address,approve_address);
    //     console.log('debug,is_approve',is_approve,owner_address,approve_address)
        
    //     return is_approve;
    // }

    async trade(data,options = {}) {
        let {
            contract_address,
            token_id,
            from,
            to,
            value,
            fee,
            deadline,
            amount,
            r,
            s,
            v
        } = data;

        let ret = await this.checkConnect();

        if (!ret) {
            return false;
        }

        console.log('this.contract',this.contract);

        value = ethers.utils.parseEther(value);
        fee = ethers.utils.parseEther(fee);

        // console.log('new-value',value);

        let tx = null
        try {

            let params_options = {
                'gasLimit': 200000,
                'value' : value,
                'nonce' : null
            }

            console.log('发起交易行为',{
                contract_address,
                token_id,
                from,
                to,
                value,
                fee,
                deadline,
                r,
                s,
                v
            },params_options)

            console.log('交易合约',this.contract);


            tx = await this.contract.trade(
                contract_address,
                token_id,
                from,
                to,
                value,
                fee,
                deadline,
                r,
                s,
                v
                ,params_options);

            ///交易被发出
            console.log('debug,交易发出',tx)
            notification.info({
                'message' : 'tx sent',
                'description' : 'waiting for the transaction to be executed',
            })
            ///等待交易执行
            await tx.wait();

            notification.remove(tx.hash);

            notification.success({
                'key' : tx.hash,
                'message' : 'tx success',
                'description' : 'transaction successfully executed',
                'duration' : 5
            })

            console.log('debug,交易被执行',tx)
            if (options.onSuccess) {
                options.onSuccess(tx);
            }

            return tx;
        }catch(e) {
            console.log('交易报错',e)

        }finally {
            
        }

        if (options.onError) {
            options.onError();
        }

        // console.log('debug-error',e)
        notification.error({
            message: 'Authorization rejected',
            description : 'You need authorization to place a pending trade',
        })
        return false;
    }


    // async allowance(owner_address,spender_address) {

    //     console.log('debug:allowance:owner_address',owner_address)
    //     console.log('debug:allowance:spender_address',spender_address)

    //     let contract = this.getContract();
    //     let allowance = await contract.methods.allowance(owner_address,spender_address).call();
    //     let decimals = await this.getDecimals();

    //     return getAmountFromIntAmount(allowance,decimals);
    // }

    // async getTokenInfo() {
    //     return {
    //         'address'   : this.contract_address,
    //         'decimals'  : await this.getDecimals(),
    //         'symbol'    : await this.getSymbol()
    //     }
    // }
}