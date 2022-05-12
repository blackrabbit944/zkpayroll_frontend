import React from 'react';

import Modal from 'components/common/modal'
import {getSteamingData} from 'helper/web3/number'

import {getTokenName} from 'helper/token'

import {withTranslate,withMustLogin} from 'hocs/index'
import CircleLine from 'components/steaming/circle'
import { getAmountFromValueAndDecimals } from 'helper/web3/number';

import message from 'components/common/message'
import Button from 'components/common/button'

import {autoDecimal} from 'helper/number'

import notification from 'components/common/notification'
import steamingpay from 'helper/web3/steamingpay'
//测试


@withTranslate
@withMustLogin
class SalaryViewModal extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            sending_withdraw_tx : false
        }
        this.claimSalary = ::this.claimSalary

    }


    async claimSalary() {
        //1.循环拿到列表并组织数据
        const {t} =this.props.i18n;
        const {item} = this.props;

        let tx_data = getSteamingData(item);
        // console.log('debug:claimSalary,tx_data',item,tx_data);

        // console.log('debug:claimSalary,amount',tx_data.total_allow_claim.toString());
        // console.log('debug:claimSalary,total',tx_data.total.toString());

        //2.调用发工资的合约
        let steaming = new steamingpay();

        let clear_checking_balance_msg = message.loading(t('checking for allowed withdraw balance'));

        let allowed_balance = await steaming.balanceOf(item.streamId,item.recipient);

        clear_checking_balance_msg();

        let tx;
        try {
            let clear_withdraw_msg = message.loading(t('sending withdraw tx'));
            tx =  await steaming.withdrawFromStream(item.streamId,allowed_balance)

            clear_withdraw_msg();

            notification.info({
                'message' : t('withdraw tx sent'),
                'description' : t('waiting for the transaction to be executed'),
            })

            this.setState({
                sending_withdraw_tx : true
            })
            
            await tx.wait();

            notification.remove(tx.hash);

            this.setState({
                sending_withdraw_tx : false,
                batch_tx_hash:tx.hash,
                page : "step3"         
            })

            notification.success({
                'key' : tx.hash,
                'message' : 'tx success',
                'description' : 'successful withdraw salary',
                'duration' : 5
            })

            this.props.closeModal();

        }catch(e) {
            console.log('debug:e',e);
            notification.error({
                message: t('tx failed'),
                description : e.message,
            })
        }


    }

    render() {
        const {sending_withdraw_tx} = this.state;
        const {visible,item} = this.props;
        const {t} = this.props.i18n;

        if (!item) {
            return null;
        }

        // console.log('debug:viewmodal,item',item);

        let token_name = getTokenName(item.tokenAddress);

        let tx_data = getSteamingData(item);
        let total_amount = getAmountFromValueAndDecimals(tx_data.total.toString(),item.decimals)
        let total_allow_claim_amount = getAmountFromValueAndDecimals(tx_data.total_allow_claim.toString(),item.decimals)
        let claim_amount = getAmountFromValueAndDecimals(tx_data.claimed.toString(),item.decimals)

        // let total_release = tx_data.total_allow_claim.add(tx_data.claimed)

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
                        total_allow_claim={tx_data.total_release} 
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
                        <div className='text-gray-500 font-bold'>{t('unclaimed salary')}</div>
                        <div>{autoDecimal(total_allow_claim_amount.toString())}
                            <span className='uppercase ml-2'>
                                {token_name}
                            </span>
                        </div>
                    </div>
                    <div>
                        <div className='text-gray-500 font-bold'>{t('already claimed salary')}</div>
                        <div>{autoDecimal(claim_amount.toString())}
                        <span className='uppercase ml-2'>
                                {token_name}
                            </span>
                        </div>
                    </div>
                </div>

                <div className='flex justify-center my-12'>
                    <Button loading={sending_withdraw_tx} className='btn btn-primary' onClick={this.claimSalary}>{t('claim salary')}</Button>
                </div>

            </div>
        </Modal>
    }

    
}


export default SalaryViewModal

