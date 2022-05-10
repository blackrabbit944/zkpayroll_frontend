import React from 'react'
export default function SteamingCircle({
    total,
    total_allow_climb,
    climbed
}) {

    let percent = (total_allow_climb.toString() * 100 / total.toString()).toFixed(2);
    
    console.log('debug:total_allow_climb',total_allow_climb.toString(),percent);
    // percent = '20px';
    
    return <div>
        <div className='w-full h-2 bg-blue-200 rounded-full'>
            <div className='h-full text-center text-xs text-white bg-blue-600 rounded-full' style={{width:percent+"%"}}>
            </div>
        </div>
    </div>

}
