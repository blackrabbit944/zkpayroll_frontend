import React,{useState} from 'react'
import {getShortAddress} from 'helper/common'
export default function WalletOne({
    tx_hash,
    className
}) {

    let [showTip,setShowTip] = useState(false);

    if (!tx_hash) {
        return null;
    }

    console.log('tx_hash',tx_hash)

    return <div className='relative'>
        {
            (showTip)
            ? <div className='absolute left-0 bg-black opacity-80 text-white bottom-6 rounded-full px-4 py-1 shadow-lg'>
                <a target={'_blank'} href={"https://www.etherscan.io/tx/"+tx_hash} className="hover:underline">{tx_hash}</a>
                <div className='tooltip-arrow'></div>
            </div>
            : null
        }
        <span className='cursor-pointer' onClick={()=>setShowTip(!showTip)}>{getShortAddress(tx_hash)}</span>
    </div>

}
