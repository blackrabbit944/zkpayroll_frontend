import React from 'react';

import { connect } from "react-redux";
// import autobind from 'autobind-decorator'
import classNames from 'classnames';

import Modal from 'components/common/modal'
import Loading from 'components/common/loading'
import Button from 'components/common/button'

import AddressOne from 'components/etherscan/address'
import {getTokenName} from 'helper/token'

import {withTranslate,withMustLogin} from 'hocs/index'
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
class SalarySendModal extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            page    : 'step1',
            checking_approve_amount : false,
            sending_approve_tx : false,
            sending_batch_tx : false,
            batch_tx_hash : ''
        }
        this.checkApproveAmount = ::this.checkApproveAmount
        this.approveAmount = ::this.approveAmount
        this.sendSalary = ::this.sendSalary
    }

    ///进入的时候会检查是否approve过足够的金额
    static getDerivedStateFromProps(props, state) {
        let output = {};
        if (props.contract_address) {
            output['contract_address'] = props.contract_address;
        }
        if (props.total_amount) {
            output['total_amount'] = props.total_amount;
        }
        return output
    }

    componentDidUpdate(prevProps,prevState) {
        if (this.props.visible && !prevProps.visible) {
            this.checkApproveAmount(this.state.contract_address,this.state.total_amount);
        }
    }

    async checkApproveAmount(contract_address,total_amount) {
        console.log('debug:checkApproveAmount',contract_address,total_amount);

        const {login_user} = this.props;

        this.setState({
            'checking_approve_amount'  : true
        })

        let approve_address = getConfig('ZKPAYROLL_CONTRACT_ADDRESS')

        let erc20 = new Erc20(contract_address)
        let allowance = await erc20.allowance(login_user.get('wallet_address'),approve_address)

        ///把total_amount转换为bn的数据
        let total_amount_in_ethers = await erc20.getValueFromAmount(total_amount);

        if (allowance.lt(total_amount_in_ethers)) {
            // console.log('allowance不足，要求是%s，实际上拿到是%s',total_amount_in_ethers.toString(),allowance.toString())
            this.setState({
                'checking_approve_amount' : false
            })
        }else {
            //测试
            // this.setState({
            //     'checking_approve_amount' : false
            // })
            this.setState({
                'page' : 'step2'
            })
        }


    }
    
    async approveAmount(contract_address,amount) {

        console.log('approve_request',contract_address,amount)

        const {t} = this.props.i18n;
        let erc20 = new Erc20(contract_address)

        let token_name = getTokenName(contract_address);
        let total_amount_in_ethers = await erc20.getValueFromAmount(amount);

        let approve_address = getConfig('ZKPAYROLL_CONTRACT_ADDRESS')
        try {
            let tx = await erc20.approve(approve_address,total_amount_in_ethers);
          
            notification.info({
                'message' : t('approve tx sent'),
                'description' : t('waiting for the transaction to be executed'),
            })

            this.setState({
                sending_approve_tx : true
            })
            
            await tx.wait();
    
            notification.remove(tx.hash);

            this.setState({
                sending_approve_tx : false,
                page : "step2"           
            })
    
            notification.success({
                'key' : tx.hash,
                'message' : 'tx success',
                'description' : 'approve successfully executed',
                'duration' : 5
            })
        }catch(e) {
            console.log('debug:e',e);
            notification.error({
                message: t('Approve Failed'),
                description : e.message,
            })
        }


    }

    async sendSalary() {
        //1.循环拿到列表并组织数据
        const {t} =this.props.i18n;
        const {list_rows,contract_address} = this.props;

        let values = {
            'amount' : [],
            'token_address' : [],
            'wallet_address': []
        }
        let erc20 = new Erc20(contract_address)
        let decimals = await erc20.getDecimals();

        list_rows.map(one=>{
            if (one.get('contract_address') == contract_address) {
                let amount = getValueFromAmountAndDecimals(one.get('amount'),decimals);
                values.amount.push(amount);
                values.wallet_address.push(one.get('address'));
                values.token_address.push(contract_address);
            }
        })

        console.log('values',values)

        //2.调用发工资的合约
        try {

            let zkpayroll = new Zkpayroll();
            let tx = await zkpayroll.batchPay(values.token_address,values.wallet_address,values.amount);
                      
            notification.info({
                'message' : t('batch pay tx sent'),
                'description' : t('waiting for the transaction to be executed'),
            })

            this.setState({
                sending_batch_tx : true
            })
            
            await tx.wait();
    
            notification.remove(tx.hash);

            this.setState({
                sending_batch_tx : false,
                batch_tx_hash:tx.hash,
                page : "step3"         
            })
    
            notification.success({
                'key' : tx.hash,
                'message' : 'tx success',
                'description' : 'successful send the salary',
                'duration' : 5
            })
        }catch(e) {
            console.log('debug:e',e);
            notification.error({
                message: t('tx failed'),
                description : e.message,
            })
        }


    }

    render() {
        const {page} = this.state;
        const {visible,list_rows,contract_address,total_amount} = this.props;
        const {t} = this.props.i18n;

        let token_name = getTokenName(contract_address);

        let footer_com = null
        if (page == 'step1') {
            footer_com = <div className='py-8'>
                {
                    (this.state.approve_ing || this.state.checking_approve_amount) 
                    ? <Loading />
                    : <div className='flex justify-center items-center mt-4'>
                        <Button loading={this.state.sending_approve_tx} className='btn btn-primary' onClick={this.approveAmount.bind({},contract_address,total_amount)}>appove {total_amount.toString()} {token_name}</Button>
                    </div>
                }
            </div>
        }else if (page == 'step2') {
            footer_com = <div className='py-8'>
                <div className='flex justify-center items-center mt-4'>
                    <Button loading={this.state.sending_batch_tx} className='btn btn-primary' onClick={this.sendSalary}>{t('send salary')}</Button>
                </div>
            </div>
        }

        return  <Modal
                    width={800}
                    title={null}
                    visible={visible} 
                    footer={null}
                    onClose={this.props.closeModal}>

                    <h2 className='h2 text-center my-4'>{t('confirm salary list')}</h2>
                    <table className='data-table mb-12'>
                        <thead>
                            <tr>
                                <th>{t('name')}</th>
                                <th>{t('wallet')}</th>
                                <th>{t('amount')}</th>
                            </tr>
                        </thead>
                        <tbody> 
                            {
                                list_rows.map(one=>{
                                    if (one.get('contract_address') == contract_address) {
                                        return <tr key={one.get('address')}>
                                            <td>{one.get('name')}</td>
                                            <td><AddressOne wallet_address={one.get('address')} /></td>
                                            <td className='uppercase'>{autoDecimal(one.get('amount'))} {token_name}</td>
                                        </tr>
                                    }else {
                                        return null;
                                    }
                                })
                            }
                        </tbody>                     
                    </table>
                    
                    {
                        (page == 'step3')
                        ? <div className='border-2 border-green-400 rounded-lg overflow-hidden py-12'>

                            <div className='flex justify-center'>
                                <CheckCircleIcon className="w-24 h-24 text-green-400"/>
                            </div>
                            <div className='pt-8'>
                                <div className='text-center font-bold text-xl mb-4'>{t('pay success')}</div>
                                <div className='flex justify-center text-blue-500'><EtherscanTx tx_hash={this.state.batch_tx_hash}/></div>
                            </div>

                        </div>
                        : <div className='border-2 border-blue-400 rounded-lg overflow-hidden'>

                            <div className='block-step-1 overflow-hidden'>
                                <div className={classNames("step-one",{"active":page == 'step1'})}>
                                    <div className='t'><div className='ti'>Step.1</div></div>
                                    <div className='c'>{t('approve token')}</div>
                                </div>
                                <div className={classNames("step-one",{"active":page == 'step2'})}>
                                    <div className='t'><div className='ti'>Step.2</div></div>
                                    <div className='c'>{t('confirm and pay salary')}</div>
                                </div>
                            </div>

                            {
                                footer_com
                            }

                        </div>
                    }
                    

                    
                </Modal>
    }

    
}

const mapDispatchToProps = (dispatch) => {
     return {
        addSalary : (data) => {
            return dispatch(addSalary(data))
        },
        updateSalary : (id,data) => {
            return dispatch(updateSalary(id,data))
        },
     }
}
function mapStateToProps(state,ownProps) {

    let entities = state.get('entities');
    ///注册成功

    let login_user_id = state.getIn(['setting','login_user']);
    let login_user = null;
    if (login_user_id) {
        login_user = denormalize(login_user_id,userSchema,entities)
    }

    return {
        'login_user' : login_user,
    }
}

export default connect(mapStateToProps,mapDispatchToProps)(SalarySendModal)

