const { BigNumber,ethers } = require('ethers')
const snarkjs = require('snarkjs')

import {getConfig} from 'helper/config'

const verification_key = {
    "protocol": "groth16",
    "curve": "bn128",
    "nPublic": 4,
    "vk_alpha_1": [
     "12440812337620288601087138112397297104483007945457200021221114830837956000733",
     "4642893303151300478114683234835346350186376061258874121174905567072676359753",
     "1"
    ],
    "vk_beta_2": [
     [
      "8412747681006373768526557981164406595224371362608968903781807998894075804824",
      "13356862702108881287120273687991480545627598475866608961659683014505907545506"
     ],
     [
      "20274520375221155828170940861439508173894040448482614709069833792542370930896",
      "14483028511672266614655552292342188998753062968750358150663118903783697448780"
     ],
     [
      "1",
      "0"
     ]
    ],
    "vk_gamma_2": [
     [
      "10857046999023057135944570762232829481370756359578518086990519993285655852781",
      "11559732032986387107991004021392285783925812861821192530917403151452391805634"
     ],
     [
      "8495653923123431417604973247489272438418190587263600148770280649306958101930",
      "4082367875863433681332203403145435568316851327593401208105741076214120093531"
     ],
     [
      "1",
      "0"
     ]
    ],
    "vk_delta_2": [
     [
      "15105902750960158829382355247929607115190603546614580481752958268704375613189",
      "4928905626783510731409269824413253063539096814754367827077788008303183065204"
     ],
     [
      "5032879957127000751870224708632922864654540040731410322303924709844321599357",
      "14197471657515322915465327690058344880797820251636858350209462345245477774862"
     ],
     [
      "1",
      "0"
     ]
    ],
    "vk_alphabeta_12": [
     [
      [
       "13111667375059300054579187023774821814527955900834128123523188928105119189802",
       "8080122933637566007053138038619397368845887267877390658301714016996100031452"
      ],
      [
       "21254768305007931357243784831403730517422693556443597888657397508030039975232",
       "6685397145062877386366732960566468390134293544839866027477652375180264043989"
      ],
      [
       "7272288491192341674679286898299190115286574442594699049987926432879685491924",
       "5426982084392339119995351898174940684800793690916603827710260997550469554078"
      ]
     ],
     [
      [
       "8106005773384389355734070721284500011938956199148773196967206240670815082436",
       "7112801171657068146519738606126873130260008457682232665151356311226655685187"
      ],
      [
       "15679824368369930848373625795659093899068764387301823604643914383823909849757",
       "7051825986248458779982594066685966164380869144952361336675948284537395700003"
      ],
      [
       "13135432413278427152170834186296865009460094471030327867561280431977561562371",
       "4920280778269128264368066385169393817865704686960537687220824533906274146437"
      ]
     ]
    ],
    "IC": [
     [
      "9252936135883368748110989056166100652800440929316176511676188065412302954955",
      "7839121684277350760830052208731361655175688641774379426693555515144264328817",
      "1"
     ],
     [
      "14220208481251449150148272576920517222569738396461458931231352856833397937445",
      "13029911259107804560411690466877259083835873765176203343768288369099198974168",
      "1"
     ],
     [
      "8520267816921092627727516529315777824497990727754386133900262125082746504766",
      "6820290764987798997591493073282883633980424646846118946184606295473477102959",
      "1"
     ],
     [
      "12191974487744439410522730781365911105412273894181233976721154013497948994920",
      "19119922004381463882883178495405658893542996428372908800116456860631520482675",
      "1"
     ],
     [
      "5162379756729318969364281041108463882643498496553349561506263532177888084739",
      "20040142761105558329109846337073476744272358604396180923785105296749911859423",
      "1"
     ]
    ]
   }

/**
 * generateProof
 * @param {string} psw e.g. 'abc123'
 * @param {string} tokenAddr hex or int e.g. '0x00'
 * @param {string} amount hex or int e.g. '0'
 * @returns pswHash, tokenAddr, amount, allHash, proof
 */
async function generateProof(psw, tokenAddr, amount) {

    let website = getConfig('WEBSITE');
    let wasm_file = website + '/zkpay/main3.wasm'
    let zkey_file = website + '/zkpay/circuit_final.zkey'

    // console.log('wasm_file',wasm_file)
    // console.log('zkey_file',zkey_file)

    let input = [stringToHex(psw), tokenAddr, amount]
    // console.log('[generateProof] input', input)

    let data = await snarkjs.groth16.fullProve({ in: input }, wasm_file, zkey_file)

    console.log('pswHash: ', data.publicSignals[0])
    console.log(JSON.stringify(data))
    const vKey = verification_key;
    const res = await snarkjs.groth16.verify(vKey, data.publicSignals, data.proof)
    if (res === true) {
        console.log('[generateProof] Verification OK')

        let proof = [
            BigNumber.from(data.proof.pi_a[0]).toHexString(),
            BigNumber.from(data.proof.pi_a[1]).toHexString(),
            BigNumber.from(data.proof.pi_b[0][1]).toHexString(),
            BigNumber.from(data.proof.pi_b[0][0]).toHexString(),
            BigNumber.from(data.proof.pi_b[1][1]).toHexString(),
            BigNumber.from(data.proof.pi_b[1][0]).toHexString(),
            BigNumber.from(data.proof.pi_c[0]).toHexString(),
            BigNumber.from(data.proof.pi_c[1]).toHexString()
        ]

        return {
            pswHash: data.publicSignals[0],
            tokenAddr: data.publicSignals[1],
            amount: data.publicSignals[2],
            allHash: data.publicSignals[3],
            proof: proof
        }

    } else {
        console.log('[generateProof] Invalid proof')
    }
}

/**
 * getBoxhash
 * @param {string} pswHash
 * @param {string} address wallet address
 * @returns boxhash
 */
function getBoxhash(pswHash, address) {
    return ethers.utils.solidityKeccak256(['uint256', 'address'], [pswHash, address])
}


function stringToHex(string) {
    let hexStr = '';
    for (let i = 0; i < string.length; i++) {
        let compact = string.charCodeAt(i).toString(16)
        hexStr += compact
    }
    return '0x' + hexStr
}


module.exports = {
    generateProof : generateProof,
    getBoxhash : getBoxhash
}
