import {getAmountFromIntAmount,getIntAmountByAmount} from 'helper/number'
import Metamask from 'helper/web3/metamask'
import autobind from 'autobind-decorator'
import { ethers } from "ethers";
import notification from 'components/common/notification'

const erc721_abi = [{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"approve","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"mint","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"safeTransferFrom","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"bytes","name":"_data","type":"bytes"}],"name":"safeTransferFrom","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"bool","name":"approved","type":"bool"}],"name":"setApprovalForAll","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"transferFrom","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"approved","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"operator","type":"address"},{"indexed":false,"internalType":"bool","name":"approved","type":"bool"}],"name":"ApprovalForAll","type":"event"},{"constant":true,"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"getApproved","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"operator","type":"address"}],"name":"isApprovedForAll","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"ownerOf","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"bytes4","name":"interfaceId","type":"bytes4"}],"name":"supportsInterface","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"}];

export default class Erc721 {

    constructor(contract_address) {

        this.provider = new ethers.providers.Web3Provider(window.ethereum)

        this.contract_address = contract_address
        this.contract = new ethers.Contract(contract_address, erc721_abi, this.provider);

        this.metamask = new Metamask();

    }

    @autobind
    async ownerOf(token_id) {
        let ret = await this.checkConnect();

        let owner = await this.contract.ownerOf(token_id);
        console.log('debug,owner',token_id,owner)
        return owner;
    }

    @autobind
    async checkConnect() {
        let account = await this.metamask.connectWallet();
        console.log('debug-check',account)

        if (account.connectedStatus == false) {
            throw 'Unconnect Metamask';
        }
    }

    async checkApproveForAll(owner_address,approve_address) {

        let ret = await this.checkConnect();

        let is_approve = await this.contract.isApprovedForAll(owner_address,approve_address);
        console.log('debug,is_approve',is_approve,owner_address,approve_address)
        
        return is_approve;
    }

    async setApprovalForAll(approve_address,is_approve = true, options = {}) {

        let ret = await this.checkConnect();

        const signer = this.provider.getSigner()

        const contractWithSigner = this.contract.connect(signer);

        console.log('debug:contract_address',this.contract_address);
        console.log('debug:approve_address',approve_address);
        console.log('debug:is_approve',is_approve);
        console.log('debug:contractWithSigner',contractWithSigner);

        let tx = null
        try {
            tx = await contractWithSigner.setApprovalForAll(approve_address, is_approve);

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