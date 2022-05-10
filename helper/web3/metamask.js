import detectEthereumProvider from '@metamask/detect-provider';
import BigNumber from "bignumber.js";

import autobind from 'autobind-decorator'
import {getConfig} from 'helper/config'

import notification from 'components/common/notification'
// import { is } from 'immutable';

export default class Metamask {

    constructor() {
        this.network_config = getConfig('ETH_NETWORK');
        this.errorMessage = null;
        this.provider = null;
    }

    setErrorMessage(msg) {
        this.errorMessage = msg;
    }

    getErrorMessage() {
        return this.errorMessage;
    }

    connectNotification(msg) {
        notification.error({
            'message' : '🦊　Unconnect Wallet',
            'description' : msg
        })
    }

    @autobind
    async getProvider() {
        if (!this.provider) {
            this.provider = await detectEthereumProvider();
        }
        return this.provider;
    }

    @autobind
    async isInstalled() {
        const provider = await this.getProvider();
        if (!provider) {
            return false;
        }else {
            return true;
        }
    }

    async connectWallet() {


        ///判断是否安装
        let is_installed = await this.isInstalled();
        if (!is_installed) {
            this.setErrorMessage('you need install metamask');
            return false;
        }

        ///判断是否安装了多个钱包
        if (this.provider !== window.ethereum) {
            this.setErrorMessage('Do you have multiple wallets installed?');
            return false;
        }
    
        ///判断chainId是否是我们需求的chainId
        let is_chain_correct = await this.checkChain();
        if (!is_chain_correct) {
            this.setErrorMessage('chain id is not correct');
            return false;
        }

        try {

            // 获得当前登录的accounts
            const accounts = await this.provider.send('eth_requestAccounts');

            console.log('debug-accounts',accounts.result);
            // // Accounts now exposed, use them
            // const address = await window.ethereum.enable(); //connect Metamask
            const chain_id = await this.getChainId();   ///get chain_id

            const obj = {
                connectedStatus: true,
                address: accounts.result,
                chain_id : chain_id
            }
            return obj;
                
        } catch (error) {

            this.connectNotification('Connect to Metamask using the button on the top right.');
            this.setErrorMessage('connected failed');
            return false;
            // return {
            //     connectedStatus: false,
            //     message: "Connect to Metamask using the button on the top right."
            // }
        }
            

    }

    async getAccounts() {

        let is_installed = this.checkIsInstalled();
        if (!is_installed) {
            return null
        }
        let accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        return accounts;
    }

    async getAccount() {
        
        let is_installed = this.checkIsInstalled();
        if (!is_installed) {
            return null
        }
        let accounts = await this.getAccounts();
        if (accounts.length > 0) {
            return accounts[0]
        }
        return null;
    }

    async getChainId() {
        return await ethereum.request({ method: 'eth_chainId' });
    }

    async getEthBalance(account = null) {

        if (!account) {
            account = await this.getAccount()
        }

        // console.log('debug001,account',account);

        let balance = await ethereum.request({ method: 'eth_getBalance' ,params:[account,"latest"]});
      
        let bn_balance = new BigNumber(balance);
        let balanceString = bn_balance.toString()

        return balanceString;
    }

    @autobind
    async checkChain() {

        let current_eth_chain_id = await this.getChainId();

        // console.log('network_config',this.network_config);
        // console.log('current_eth_chain_id',current_eth_chain_id);
        if (current_eth_chain_id == this.network_config.chainId) {
            return true;
        }

        await this.connectEthNetwork();

        //再次检查
        current_eth_chain_id = await this.getChainId();
        if (current_eth_chain_id != this.network_config.chainId) {
            return false;
        }

        return true;
    }

    async connectEthNetwork() {

        let params = [this.network_config]

        console.log('debug:connectEth',params,params[0]['chainId']);

        try {
            let res = await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params,
            })

            return true;
        } catch (error) {
            // something failed, e.g., user denied request
            console.log('debug:addNetworkError',error)
            // return false;
        }

        params = [{
            chainId : this.network_config.chainId
        }]

        try {
            let res = await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params,
            })

            return true;
        } catch (error) {
            // something failed, e.g., user denied request
            console.log('debug:switchNetworkError',error)
            return false;
        }
    }



}