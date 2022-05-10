import BigNumber from "bignumber.js";
import { ethers } from "ethers";
import {getUnixtime} from 'helper/time'

export const getValueFromAmountAndDecimals =  (amount,decimals) => {
    if (!BigNumber.isBigNumber(amount)) {
        amount = new BigNumber(amount)
    }
    let value = amount.multipliedBy(new BigNumber(10).pow(decimals));
    return ethers.BigNumber.from(value.toString());
}

export const getAmountFromValueAndDecimals = (value,decimals) => {
    if (!BigNumber.isBigNumber(value)) {
        value = new BigNumber(value)
    }
    let amount = value.dividedBy(new BigNumber(10).pow(decimals));
    return amount
}

export const getSteamingData = (before) => {

    let during_time = before.stopTime.sub(before.startTime);    //时间
    let total = during_time.mul(before.ratePerSecond);  //总计
    let climbed = total.sub(before.remainingBalance);    //已经领取

    let unxtime_now = getUnixtime();

    let during_time_until_now = ethers.BigNumber.from(unxtime_now).sub(before.startTime);
    let total_allow_climb = during_time_until_now.mul(before.ratePerSecond).sub(climbed);

    return {
        during_time : during_time,
        total : total,
        climbed : climbed,
        unxtime_now : unxtime_now,
        during_time_until_now : during_time_until_now,
        total_allow_climb : total_allow_climb
    }
}