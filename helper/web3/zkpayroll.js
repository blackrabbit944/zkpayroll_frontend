// import {getAmountFromIntAmount,getIntAmountByAmount} from 'helper/number'
import Metamask from 'helper/web3/metamask'
import autobind from 'autobind-decorator'
import { ethers } from "ethers";
// import notification from 'components/common/notification'
import {getConfig} from 'helper/config'

const zkpayroll_abi =[
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "streamPayAddr",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "zkPayAddr",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {
        "internalType": "address[]",
        "name": "tokenAddrs",
        "type": "address[]"
      },
      {
        "internalType": "address[]",
        "name": "toAddrs",
        "type": "address[]"
      },
      {
        "internalType": "uint256[]",
        "name": "amounts",
        "type": "uint256[]"
      }
    ],
    "name": "batchPay",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address[]",
        "name": "recipients",
        "type": "address[]"
      },
      {
        "internalType": "uint256[]",
        "name": "deposits",
        "type": "uint256[]"
      },
      {
        "internalType": "address[]",
        "name": "tokenAddrs",
        "type": "address[]"
      },
      {
        "internalType": "uint256[]",
        "name": "startTimes",
        "type": "uint256[]"
      },
      {
        "internalType": "uint256[]",
        "name": "stopTimes",
        "type": "uint256[]"
      }
    ],
    "name": "batchStreamPay",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address[]",
        "name": "tokenAddrs",
        "type": "address[]"
      },
      {
        "internalType": "address[]",
        "name": "toAddrs",
        "type": "address[]"
      },
      {
        "internalType": "uint256[]",
        "name": "amounts",
        "type": "uint256[]"
      }
    ],
    "name": "batchZkPay",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "streamPay",
    "outputs": [
      {
        "internalType": "contract StreamPay",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "zkPay",
    "outputs": [
      {
        "internalType": "contract ZkPay",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
]
export default class Zkpayroll {

    constructor() {
        let contract_address = getConfig('ZKPAYROLL_CONTRACT_ADDRESS')
        let provider = new ethers.providers.Web3Provider(window.ethereum)
        this.contract = new ethers.Contract(contract_address, zkpayroll_abi, provider.getSigner());
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

    getAmountFromDuringAndAmount(during_time,amount) {
      let bn_during_time = ethers.BigNumber.from(during_time);
      let new_amount = amount.div(bn_during_time).mul(bn_during_time)
      return new_amount;
    }

    async batchPay(token_addresses,to_addresses,amounts) {
      let tx = await this.contract.batchPay(token_addresses,to_addresses,amounts);
      return tx;
    }

    async batchStreamPay(to_addresses,amounts,token_addresses,start_times,stop_times) {
      let tx = await this.contract.batchStreamPay(to_addresses,amounts,token_addresses,start_times,stop_times);
      return tx;
    }

}