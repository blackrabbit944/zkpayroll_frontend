import React from 'react'

export default function SteamingLine({
    total,
    total_allow_claim,
    claimed,
    width,
    stroke
}) {


    if (!width) {
        width = 120;
    }

    if (!stroke) {
        stroke = 5;
    }

    let radius = width/2;
    let width_outside = width + 2 * stroke;
    let cxy = radius+stroke;

    let progress = (total_allow_claim.toString() * 100 / total.toString()).toFixed(2);


    let circumference = radius * 2 * Math.PI;

    const strokeDashoffset = circumference - progress / 100 * circumference;

    console.log('progress',progress,strokeDashoffset);

    // console.log('debug:total_allow_claim',total_allow_climb.toString());
    // percent = '20px';
    
    return <div>
        <div
            class="relative inline-flex items-center justify-center overflow-hidden rounded-full"
            >
            <svg style={{'width':width_outside,'height':width_outside}}>
                <circle
                class="text-gray-300"
                stroke-width={stroke}
                stroke="currentColor"
                fill="transparent"
                r={radius}
                cx={cxy}
                cy={cxy}
                />
                <circle
                class="text-blue-600 circle-line-ring"
                stroke-width={stroke}
                stroke-linecap="round"
                stroke="currentColor"
                strokeDasharray={circumference+" "+circumference}
                style={{strokeDashoffset}}
                fill="transparent"
                r={radius}
                cx={cxy}
                cy={cxy}
                />
            </svg>
            <span class="absolute text-xl text-blue-700">{progress}%</span>
            </div>
    </div>

}
