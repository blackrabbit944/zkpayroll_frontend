import autobind from 'autobind-decorator'
import { ethers } from "ethers";
import {getConfig} from 'helper/config'
import Contract  from 'helper/web3/contract'

const zkpay_abi = [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "sender",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "tokenAddr",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "Recharge",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "boxhash",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "user",
          "type": "address"
        }
      ],
      "name": "Register",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "tokenAddr",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "Withdraw",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "internalType": "address[]",
          "name": "tokenAddrs",
          "type": "address[]"
        }
      ],
      "name": "balanceOf",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "bals",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "name": "boxhash2safebox",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "boxhash",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "user",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "sender",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "recipient",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "tokenAddr",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "rechargeWithAddress",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "sender",
          "type": "address"
        },
        {
          "internalType": "bytes32",
          "name": "boxhash",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "tokenAddr",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "rechargeWithBoxhash",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "boxhash",
          "type": "bytes32"
        },
        {
          "internalType": "uint256[8]",
          "name": "proof",
          "type": "uint256[8]"
        },
        {
          "internalType": "uint256",
          "name": "pswHash",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "allHash",
          "type": "uint256"
        }
      ],
      "name": "register",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "usedProof",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "user2boxhash",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256[8]",
          "name": "proof",
          "type": "uint256[8]"
        },
        {
          "internalType": "uint256",
          "name": "pswHash",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "tokenAddr",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "allHash",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        }
      ],
      "name": "withdraw",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]

export default class zkpay extends Contract {

    constructor() {
        super();

        let contract_address = getConfig('ZKPAY_CONTRACT_ADDRESS');
        let provider = new ethers.providers.Web3Provider(window.ethereum)
        this.contract = new ethers.Contract(contract_address, zkpay_abi, provider.getSigner());
    }


    async getUserSafeBox(address) {
        let ret = await this.beforeRequest();
        if (!ret) {
            return;
        }
        let tx = await this.contract.user2boxhash(address);
        return tx;
        
    }

    async register(boxhash, proof, pswHash, allHash) {
        let ret = await this.beforeRequest();
        if (!ret) {
            return;
        }
        let tx = await this.contract.register(boxhash, proof, pswHash, allHash)
        return tx;
    }

    async balanceOf(address,tokens) {
      let ret = await this.beforeRequest();
      if (!ret) {
          return;
      }
      let tx = await this.contract.balanceOf(address,tokens)
      return tx;
    }

    async withdraw(proof,pswHash,tokenAddr,amount,allHash,to) {
      let ret = await this.beforeRequest();
      if (!ret) {
          return;
      }
      let tx = await this.contract.withdraw(proof,pswHash,tokenAddr,amount,allHash,to)
      return tx;
    }
}