import React from 'react'
export default function SteamingCircle({
    total,
    total_release,
    climbed
}) {

    let percent = (total_release.toString() * 100 / total.toString()).toFixed(2);
    
    if (percent > 100) {
        percent = 100;
    }
    // console.log('debug:total_allow_claim',total_allow_claim.toString(),percent);
    // percent = '20px';
    
    return <div>
        <div className='w-full h-2 bg-blue-200 rounded-full'>
            <div className='h-full text-center text-xs text-white bg-blue-600 rounded-full' style={{width:percent+"%"}}>
            </div>
        </div>
    </div>

}
