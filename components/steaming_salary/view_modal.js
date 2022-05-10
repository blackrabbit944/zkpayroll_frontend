import React from 'react';

import { connect } from "react-redux";
import classNames from 'classnames';

import Modal from 'components/common/modal'
import {getSteamingData} from 'helper/web3/number'

import AddressOne from 'components/etherscan/address'
import {getTokenName} from 'helper/token'

import {withTranslate,withMustLogin} from 'hocs/index'
import CircleLine from 'components/steaming/circle'
import { getAmountFromValueAndDecimals } from 'helper/web3/number';
import {autoDecimals} from 'helper/number'

import { denormalize } from 'normalizr';
import { userSchema } from 'redux/schema/index'

import {addSalary,updateSalary} from 'redux/reducer/salary'
import {autoDecimal} from 'helper/number'
import {getConfig} from 'helper/config'

import Erc20  from 'helper/web3/erc20'
import notification from 'components/common/notification'
// import {strFormat} from 'helper/translate'
import Zkpayroll from 'helper/web3/zkpayroll';
import {CheckCircleIcon} from '@heroicons/react/solid'
//测试
import EtherscanTx from 'components/etherscan/tx';

import {getValueFromAmountAndDecimals} from 'helper/web3/number'

@withTranslate
@withMustLogin
class SalaryViewModal extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
          
        }
        // this.checkApproveAmount = ::this.checkApproveAmount
        // this.approveAmount = ::this.approveAmount
        // this.sendSalary = ::this.sendSalary
        // this.showDuringTime = ::this.showDuringTime
    }

    ///进入的时候会检查是否approve过足够的金额
    // static getDerivedStateFromProps(props, state) {
    //     let output = {};
    //     if (props.contract_address) {
    //         output['contract_address'] = props.contract_address;
    //     }
    //     if (props.total_amount) {
    //         output['total_amount'] = props.total_amount;
    //     }
    //     return output
    // }

    // componentDidUpdate(prevProps,prevState) {
    //     if (this.props.visible && !prevProps.visible) {
    //         this.checkApproveAmount(this.state.contract_address,this.state.total_amount);
    //     }
    // }


    // async sendSalary() {
    //     //1.循环拿到列表并组织数据
    //     const {t} =this.props.i18n;
    //     const {list_rows,contract_address} = this.props;

    //     let values = {
    //         'amount' : [],
    //         'token_address' : [],
    //         'wallet_address': [],
    //         'start_times'   : [],
    //         'stop_times'    : []
    //     }
    //     let zkpayroll = new Zkpayroll();
    //     let erc20 = new Erc20(contract_address)
    //     let decimals = await erc20.getDecimals();

    //     let startime = Math.floor(Date.now() / 1000);

    //     list_rows.map(one=>{
    //         if (one.get('contract_address') == contract_address) {
                
    //             let amount = getValueFromAmountAndDecimals(one.get('amount'),decimals);
    //             let amount_new = zkpayroll.getAmountFromDuringAndAmount(one.get('during_time'),amount)

    //             console.log('debug03,发放的金额计算后改为:',amount_new.toString());

    //             values.amount.push(amount_new);
    //             values.wallet_address.push(one.get('address'));
    //             values.token_address.push(contract_address);
    //             values.start_times.push(startime);
    //             values.stop_times.push(startime + Number(one.get('during_time')));

    //         }
    //     })


    //     //解决合约不能除不尽的问题
        
    //     console.log('values',values)

    //     //2.调用发工资的合约
    //     try {

    //         let tx = await zkpayroll.batchStreamPay(values.wallet_address,values.amount,values.token_address,values.start_times,values.stop_times);
                      
    //         notification.info({
    //             'message' : t('batch steaming pay tx sent'),
    //             'description' : t('waiting for the transaction to be executed'),
    //         })

    //         this.setState({
    //             sending_batch_tx : true
    //         })
            
    //         await tx.wait();
    
    //         notification.remove(tx.hash);

    //         this.setState({
    //             sending_batch_tx : false,
    //             batch_tx_hash:tx.hash,
    //             page : "step3"         
    //         })
    
    //         notification.success({
    //             'key' : tx.hash,
    //             'message' : 'tx success',
    //             'description' : 'successful send the steaming salary',
    //             'duration' : 5
    //         })
    //     }catch(e) {
    //         console.log('debug:e',e);
    //         notification.error({
    //             message: t('tx failed'),
    //             description : e.message,
    //         })
    //     }


    // }

    render() {
        const {page} = this.state;
        const {visible,item} = this.props;
        const {t} = this.props.i18n;

        if (!item) {
            return null;
        }

        console.log('item',item);

        let token_name = getTokenName(item.tokenAddress);

        let tx_data = getSteamingData(item);
        let total_amount = getAmountFromValueAndDecimals(tx_data.total.toString(),item.decimals)
        let total_allow_climb_amount = getAmountFromValueAndDecimals(tx_data.total_allow_climb.toString(),item.decimals)

        return  <Modal
            width={800}
            title={t('my salary')}
            visible={visible} 
            footer={null}
            onClose={this.props.closeModal}>
            <div>
                <div className='flex justify-center py-12'>
                    <CircleLine 
                        width={120}
                        stroke={10}
                        total_allow_climb={tx_data.total_allow_climb} 
                        total={tx_data.total} />
                </div>

                <div className='w-64 mx-auto text-center'>
                    <div className='mb-4'>
                        <div className='text-gray-500 font-bold'>{t('total salary')}</div>
                        <div>
                            {autoDecimal(total_amount.toString())}
                            <span className='uppercase ml-2'>
                                {token_name}
                            </span>
                        </div>
                    </div>
                    <div className='mb-4'>
                        <div className='text-gray-500 font-bold'>{t('released salary')}</div>
                        <div>{autoDecimal(total_allow_climb_amount.toString())}
                            <span className='uppercase ml-2'>
                                {token_name}
                            </span>
                        </div>
                    </div>
                    <div>
                        <div className='text-gray-500 font-bold'>{t('already claimed salary')}</div>
                        <div>{autoDecimal(tx_data.climbed.toString())}
                        <span className='uppercase ml-2'>
                                {token_name}
                            </span>
                        </div>
                    </div>
                </div>

                <div className='flex justify-center my-12'>
                    <button className='btn btn-primary'>claim salary</button>
                </div>

            </div>
        </Modal>
    }

    
}


export default SalaryViewModal

