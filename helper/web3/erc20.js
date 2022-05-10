import Metamask from 'helper/web3/metamask'
import autobind from 'autobind-decorator'
import { ethers } from "ethers";
import BigNumber from "bignumber.js";

import notification from 'components/common/notification'
import {getAmountFromValueAndDecimals,getValueFromAmountAndDecimals} from 'helper/web3/number.js'

const erc20_abi = [
    {
        "constant": true,
        "inputs": [],
        "name": "name",
        "outputs": [
            {
                "name": "",
                "type": "string"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_spender",
                "type": "address"
            },
            {
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "approve",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "totalSupply",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_from",
                "type": "address"
            },
            {
                "name": "_to",
                "type": "address"
            },
            {
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "transferFrom",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "decimals",
        "outputs": [
            {
                "name": "",
                "type": "uint8"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "_owner",
                "type": "address"
            }
        ],
        "name": "balanceOf",
        "outputs": [
            {
                "name": "balance",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "symbol",
        "outputs": [
            {
                "name": "",
                "type": "string"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_to",
                "type": "address"
            },
            {
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "transfer",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "_owner",
                "type": "address"
            },
            {
                "name": "_spender",
                "type": "address"
            }
        ],
        "name": "allowance",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "payable": true,
        "stateMutability": "payable",
        "type": "fallback"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "name": "owner",
                "type": "address"
            },
            {
                "indexed": true,
                "name": "spender",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "Approval",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "name": "from",
                "type": "address"
            },
            {
                "indexed": true,
                "name": "to",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "Transfer",
        "type": "event"
    }
]

export default class Erc20 {

    constructor(contract_address) {

        this.provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = this.provider.getSigner();

        this.contract_address = contract_address
        this.contract = new ethers.Contract(contract_address, erc20_abi, signer);

        this.decimals = null;

    }

    @autobind
    async allowance(owner_address,approve_address) {
        let allowance = await this.contract.allowance(owner_address,approve_address);
        return allowance;
    }

    @autobind
    async approve(approve_address,amount,t) {
        let tx = await this.contract.approve(approve_address,amount);
        // console.log('debug:tx',tx);
        return tx;       
    }

    @autobind
    async getBalance(address) {
        let balance = await this.balanceOf(address);
        return balance;
    }

    async getAmountFromValue(value) {
        let decimals = await this.getDecimals();
        return getAmountFromValueAndDecimals(value,decimals);
    }

    @autobind
    async getValueFromAmount(amount) {
        let decimals = await this.getDecimals();
        return getValueFromAmountAndDecimals(amount,decimals);
    }

    @autobind
    async balanceOf(address) {
        // let ret = await this.checkConnect();
        let balance = await this.contract.balanceOf(address);
        return balance.toString();
    }

    @autobind
    async amountBalanceOf(address) {
        let balance = await this.balanceOf(address);
        let amount = await this.getAmountFromValue(balance);
        return amount
    }

    @autobind
    async getDecimals() {
        console.log('this.contract_address',this.contract_address)
        if (!this.decimals ) {
            this.decimals = await this.contract.decimals();
        }
        return this.decimals;
    }
   
}