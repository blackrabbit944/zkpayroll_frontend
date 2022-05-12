import React from 'react';

import autobind from 'autobind-decorator'
import Field from 'components/form/field'
import Button from 'components/common/button'
import Modal from 'components/common/modal'

import FormObserver from 'components/form/observer';

import { Formik, Form } from 'formik';
import * as Yup from 'yup';

import message from 'components/common/message'

import { withRouter } from 'next/router'

import {withTranslate} from 'hocs/index'
import { getTokenName } from 'helper/token';
import { getAmountFromValueAndDecimals,getValueFromAmountAndDecimals } from 'helper/web3/number';
import {autoDecimal} from 'helper/number'
import zkpay from 'helper/web3/zkpay'
import {CheckCircleIcon} from '@heroicons/react/solid'

import notification from 'components/common/notification'
import {generateProof} from 'helper/zkpay';
import {BigNumber} from 'ethers'
import EtherscanTx from 'components/etherscan/tx'

@withTranslate
@withRouter
class SalaryWithdrawModal extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            sending_withdraw_tx : false,
            withdraw_tx_hash : null,
            page : 'init'
        }
        this.formRef = React.createRef();
        this.withdraw = ::this.withdraw
    }

    componentDidMount() {
        this.zkpay = new zkpay();
    }
    // static getDerivedStateFromProps(props, state) {
    //     if (props.salary) {
    //         return {
    //             'salary' : props.salary
    //         }
    //     }else {
    //         return {
    //             'salary' : null
    //         }
    //     }
    // }

    // componentDidMount() {
    //     if (this.props.salary) {
    //         console.log('debug:update:didmount检查到salary')
    //         this.setForm(this.props.salary)
    //     }else {
    //         console.log('debug:update没有检查到salary');
    //     }
    // }

    componentDidUpdate(prevProps,preState) {
        if (this.state.visible !== preState.visible) {
            this.setState({
                'page' : 'init'
            });
        }
    }

    // @autobind
    // setForm(salary = null) {
    //     console.log("debug:update:setForm",salary)
    //     if (!salary) {
    //         this.formRef.current.setValues({
    //             'name'              : '',
    //             'address'           : '',
    //             'amount'            : '',
    //             'contract_address'  : '',
    //         })
    //     }else {
    //         this.formRef.current.setValues({
    //             'name'              : salary.get('name'),
    //             'address'           : salary.get('address'),
    //             'amount'            : salary.get('amount'),
    //             'contract_address'  : salary.get('contract_address'),
    //         })
    //     }
    // }

    async withdraw(values) {
        console.log('debug:values',values)

        const {t} =this.props.i18n;
        const {token_address,amount} = this.props;


        let token_value = getValueFromAmountAndDecimals(values.amount,amount['decimals'])

        console.log('debug:token_value',token_value)


        //2.调用发工资的合约
        let clear_msg;
        let tx;
        try {

            //生成证明文件
            let clear_proof_text = message.loading(t('creating proof data'));

            console.log('values.token_address',token_address)
            console.log('values.password',values.password)
            console.log('values.token_value',token_value.toString())

            const proof_data = await generateProof(values.password,token_address,token_value.toString());
            clear_proof_text();


            clear_msg = message.loading(t('waiting for calling metamask'));

            tx = await this.zkpay.withdraw(proof_data.proof, proof_data.pswHash, token_address, token_value,proof_data.allHash,values.address)
            
            clear_msg();
                      
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
                withdraw_tx_hash :tx.hash,
                page : "success"         
            })
    
            notification.success({
                'key' : tx.hash,
                'message' : 'tx success',
                'description' : 'successful withdraw from safebox',
                'duration' : 5
            })

            if (this.props.refresh) {
                this.props.refresh();
            }

        }catch(e) {
            console.log('debug:e',e);
            notification.error({
                message: t('tx failed'),
                description : e.message,
            })

            if (clear_msg) {
                clear_msg();
            }
        }

    }


    render() {
        const {is_adding} = this.state;
        const {visible,token_address,amount} = this.props;
        const {t} = this.props.i18n;

        const salaryFormSchema = Yup.object().shape({
            address     : Yup.string().min(42).max(42).required(),
            amount      : Yup.number().required(),
            password    : Yup.string().min(4).max(24).required(),
        });

        let init_data = {
            'address'           : '',
            'amount'            : '',
            'password'          : ''
        }
        let max_amount = autoDecimal(getAmountFromValueAndDecimals(amount['value'].toString(),amount['decimals']).toString())

        return  <Modal
                    width={650}
                    title={null}
                    visible={visible} 
                    footer={null}
                    onClose={this.props.closeModal}>

                    {
                        (this.state.page == 'success')
                        ? <div className='border-2 border-green-400 rounded-lg overflow-hidden py-12'>

                            <div className='flex justify-center'>
                                <CheckCircleIcon className="w-24 h-24 text-green-400"/>
                            </div>
                            <div className='pt-8'>
                                <div className='text-center font-bold text-xl mb-4'>{t('pay success')}</div>
                                <div className='flex justify-center text-blue-500'><EtherscanTx tx_hash={this.state.withdraw_tx_hash}/></div>
                            </div>

                        </div>
                        : <Formik
                            innerRef={this.formRef}
                            initialValues={init_data}
                            validationSchema={salaryFormSchema}
                            onSubmit={this.withdraw}>
                            {({ errors, touched }) => (
                                
                                <Form className="w-full">
                                
                                <FormObserver onChange={this.handleFormChange}/>

                                <div className="p-4 md:p-6">
                                    <h2 className='h2 mb-4'>{
                                        t('withdraw from safebox')
                                    }</h2>
                                    <Field name="address" label={t("to address")} placeholder={t("wallet address")} />
                                    <Field name="amount" label={t("amount")} placeholder={t("amount")} />
                                    <div className='bg-yellow-100 p-4 rounded-lg my-4'>
                                        <div className='text-sm'>
                                            <span className='uppercase mr-4'>{t('max amount:')}</span>
                                            <span className='mr-1'>{max_amount.toString()}</span>
                                            {
                                                getTokenName(token_address)
                                            }
                                        </div>
                                    </div>
                                    

                                    <Field name="password" label={t("password")} placeholder={t("password")} />

                                   

                                    <div className='border-t border-gray-300 my-4' />
                                    <div className="form-submit flex justify-end mt-4">
                                        <Button loading={this.state.sending_withdraw_tx} className="btn btn-primary" type="submit">{t("submit")}</Button>
                                    </div>

                                </div>

                            </Form>
                            )}
                        </Formik>
                    }
                    
                </Modal>
    }

    
}


export default SalaryWithdrawModal

