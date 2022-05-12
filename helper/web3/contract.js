import Metamask from 'helper/web3/metamask'


export default class Contract {

    constructor() {
        this.metamask = new Metamask();
    }

    async checkConnect() {
        let account = await this.metamask.connectWallet();
        if (account.connectedStatus == false) {
            // throw 'Unconnect Metamask';
            return false;
        }
        return true;
    }

    async checkChain() {
        let ret = await this.metamask.checkChain();
        return ret;
    }

    async beforeRequest() {
        if (!await this.checkConnect()) {
            console.log('发起请求前发现没有connect wallet');
            return false;
        }
        if (!await this.checkChain()) {
            console.log('发起请求前发现没有chain错误');
            return false;
        }
        return true;
    }

}