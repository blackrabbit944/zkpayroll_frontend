import React,{ Component } from 'react'
import Dropdown from 'rc-dropdown';
import {BadgeCheckIcon} from '@heroicons/react/solid'
import {UserGroupIcon} from '@heroicons/react/outline'

export default function AvatarOne({
    avatar,
    default_avatar,
    is_nft,
    size,
    className
}) {
    
    let src;

    if (!avatar) {
        src = default_avatar
    }

    // is_nft = false;
    if (avatar && avatar.getIn(['image_urls','url'])) {
        src = avatar.getIn(['image_urls','url'])
    }

    if (!src) {
        return <div className='bg-gray-100 p-8 rounded-full'>
            <UserGroupIcon className='w-8 h-8 text-gray-400'/>
        </div>
    }


    if (!size) {
        size = 8
    }
    let sizeClass = "w-"+size + ' h-' +size;

    let baseClassName = sizeClass +' rounded-full';
    let baseNftClassName = sizeClass+ " mx-auto";
    let wapperClassName = sizeClass;

    if (className) {
        wapperClassName += ' ' + className;
    }

    if (is_nft) {
        let opensea_link = "https://opensea.io/assets/" + avatar.getIn(['contract','contract_address']) + '/' + avatar.getIn(['contract','token_id']);

        return <div>
            <div className={wapperClassName}>
                <img src={src} className={baseNftClassName} style={{
                    'clip-path' : 'url("#hex-clip")',
                    'object-fit': 'cover'
                }}/>
            </div>
            <div className='flex items-center justify-center'>
            <div className="nft-name"><BadgeCheckIcon className="icon"/>
                <a href={opensea_link} target="_blank" className="text">{avatar.getIn(['contract','name'])}</a>
            </div>  
            </div>
        </div>
    }else {
        return <div className={wapperClassName}>
            <img src={src} className={baseClassName}/>
        </div>
    }

}
