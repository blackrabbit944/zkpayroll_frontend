import React from 'react';

import {wrapper} from 'redux/store';
import autobind from 'autobind-decorator'
import PageWrapper from 'components/pagewrapper'

import Loading from 'components/common/loading'
import Field from 'components/form/field'

import MustLogin from 'components/must_login'


import Head from 'next/head'
import Button from 'components/common/button'
import message from 'components/common/message'
import notification from 'components/common/notification'

import {initPage} from 'helper/init'
import { withRouter } from 'next/router'
import {withLoginUser} from 'hocs/index'

import FormObserver from 'components/form/observer';

import { Formik, Form } from 'formik';
import * as Yup from 'yup';

import {withTranslate} from 'hocs/index'
import zkpay from 'helper/web3/zkpay';

import {generateProof,getBoxhash} from 'helper/zkpay';
import {BigNumber} from 'ethers';
import {getConfig} from 'helper/config'
import { getTokenName } from 'helper/token';
import Erc20  from 'helper/web3/erc20';
import { getAmountFromValueAndDecimals } from 'helper/web3/number';
import {autoDecimal} from 'helper/number'

import WithdrawModal from 'components/safebox/withdraw_modal'

import {LockClosedIcon} from '@heroicons/react/outline'

@withTranslate
@withRouter
@withLoginUser
class Steaming extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            'show_add_modal' : false,
            'update_item'    : null,

            'is_fetching_safebox' : false,
            'is_fetched_safebox' : false,
            'safebox_hash' : null,
            'is_adding_safebox' : false,

            'is_fetching_balance': false,
            'balance_map' : {
            },

            'show_withdraw_modal' : false,
            'withdraw_token_amount' : {
                value : 0,
                decimals : 0
            }
        }
        this.formRef = React.createRef();

        this.getUserSafeBox = ::this.getUserSafeBox
        this.saveSafebox = ::this.saveSafebox
        this.getUserSafeBoxBalance = ::this.getUserSafeBoxBalance

    }

    componentDidMount() {
        this.zkpay = new zkpay();

        if (this.props.login_user) {
            this.getUserSafeBox(this.props.login_user.get('wallet_address'));
        }
    }

    componentDidUpdate(prevProps,prevState) {
        if (this.props.login_user && !this.props.login_user.equals(prevProps.login_user)) {
            this.getUserSafeBox(this.props.login_user.get('wallet_address'));
        }
        if (this.state.safebox_hash !== prevState.safebox_hash) {
            if (this.state.safebox_hash !== '0x0000000000000000000000000000000000000000000000000000000000000000' && this.props.login_user.get('wallet_address')) {
                this.getUserSafeBoxBalance(this.props.login_user.get('wallet_address'))
            }
        }
    }

    async getUserSafeBox(address) {
        console.log('调用到getUserSafeBox',address)
        this.setState({
            'is_fetching_safebox' : true,
            'is_fetched_safebox' : false
        })
        let result = await this.zkpay.getUserSafeBox(address);
        console.log('调用到getUserSafeBox结果',result)

        this.setState({
            'is_fetching_safebox' : false,
            'is_fetched_safebox' : true,
            'safebox_hash'       : (result == '0x0000000000000000000000000000000000000000000000000000000000000000') ? null : result
        })
    }
    
    @autobind
    refresh() {
        this.getUserSafeBoxBalance(this.props.login_user.get('wallet_address'))
    }

    async getUserSafeBoxBalance(address) {

        this.setState({
            'is_fetching_balance' : true
        })
        let tokens = getConfig('SALARY_TOKEN_LIST');
        let token_addrs = Object.keys(tokens);

        console.log('token_addrs',token_addrs)

        let balance_result = await this.zkpay.balanceOf(address,token_addrs);

        console.log('balance_result',balance_result)

        let balance_map = {};
        await Promise.all(
            token_addrs.map(async(one,i) => {
                
                let erc20 = new Erc20(one);
                let decimals = await erc20.getDecimals();
                
                balance_map[one] = {
                    'value' : balance_result[i],
                    'decimals' : decimals
                }
            })
        )

        this.setState({
            'balance_map' : balance_map,
            'is_fetching_balance' : false
        })
        console.log('balance_map',balance_map)

    }

    @autobind
    showWithdrawModal(token_address,amount) {
        this.setState({
            show_withdraw_modal     : true,
            withdraw_token_amount   : amount,
            withdraw_token_address  : token_address
        });
    }

    @autobind
    hideWithdrawModal(token_address,amount) {
        this.setState({
            show_withdraw_modal     : false,
            withdraw_token_amount   : {
                'value' : 0,
                'decimals' : 0
            },
            withdraw_token_address  : null
        });
    }


    @autobind
    refreshList() {
        console.log('debug:refreshList',this.listRef);
        if (this.listRef && this.listRef.current) {
            this.listRef.current.refresh();
        }
    }


    async saveSafebox(values) {

        const {t} =this.props.i18n;

        console.log('values',values)

        //生成证明文件
        let clear_proof_text = message.loading(t('creating proof data'));
        const proof_data = await generateProof(values.password,'0x00','0');
        clear_proof_text();

        //1.循环拿到列表并组织数据
        let tx;
        let clear_create_msg;
        try {

            clear_create_msg = message.loading(t('creating safebox'));

            let boxhash = getBoxhash(proof_data.pswHash, values.address)

            tx = await this.zkpay.register(boxhash, proof_data.proof, proof_data.pswHash, proof_data.allHash)
            
            clear_create_msg();

            notification.info({
                'message' : t('create safebox tx sent'),
                'description' : t('waiting for the transaction to be executed'),
            })

            this.setState({
                is_adding_safebox : true
            })
            
            await tx.wait();

            notification.remove(tx.hash);

            this.setState({
                is_adding_safebox : false,
            })

            notification.success({
                'key' : tx.hash,
                'message' : 'tx success',
                'description' : 'successful create safebox',
                'duration' : 5
            })

            if (this.props.login_user) {
                this.getUserSafeBox(this.props.login_user.get('wallet_address'));
            }

        }catch(e) {
            console.log('debug:e',e);
            notification.error({
                message: t('tx failed'),
                description : e.message,
            })

            if (clear_create_msg) {
                clear_create_msg();
            }
        }


    }


    render() {
        const {t} = this.props.i18n;
        const {is_fetching_safebox,is_fetched_safebox,safebox_hash,is_adding_safebox,balance_map,is_fetching_balance} = this.state;
        const {login_user} = this.props;

        let init_data = {
            'address'       : login_user ? login_user.get('wallet_address') : '',
            'password'      : '',
        }

        const salaryFormSchema = Yup.object().shape({
            address      : Yup.string().min(42).max(42).required(),
            password     : Yup.string().min(4).max(24).required(),
        });

        console.log('balance_map',balance_map)

        return <PageWrapper>
            <Head>
                <title>Zkpayroll</title>
            </Head>
            <MustLogin>
            <div>

            <div className="page-wapper">
                {
                    (is_fetching_safebox) 
                    ? <Loading />
                    : null
                }

                {
                    (is_fetched_safebox && safebox_hash)
                    ? <div>
                        <div className='bg-white p-4 rounded-lg mb-8 p-8 shadow-lg flex justify-center items-center'>
                            <div className='mr-4'>
                                <LockClosedIcon className='icon-base text-blue-500'/>
                            </div>
                            <div className='font-bold text-base'>
                                {t('safebox is created')}
                            </div>
                        </div>

                        <h2 className='h2 mb-4'>{t('safebox balance')}</h2>

                        <table className='data-table'>
                            <thead>
                                <tr>
                                    <th>{t('token')}</th>
                                    <th>{t('balance')}</th>
                                    <th className='flex justify-end'>{t('action')}</th>
                                </tr>
                            </thead>
                            <tbody>
                        {
                            (is_fetching_balance)
                            ? <tr>
                                <td colSpan={4} className="p-4"><Loading /></td>
                            </tr>
                            : <>
                            {
                                Object.keys(balance_map).map(one=>{
                                    return <tr key={one}>
                                        <td>{getTokenName(one)}</td>
                                        <td>
                                            {autoDecimal(getAmountFromValueAndDecimals(balance_map[one]['value'].toString(),balance_map[one]['decimals']).toString())}
                                        </td>
                                        <td className='flex justify-end'>
                                        <button className='btn btn-primary btn-sm' onClick={this.showWithdrawModal.bind({},one,balance_map[one])}>{t('withdraw')}</button>
                                        </td>
                                    </tr>
                                })
                            }
                            </>
                        }
                        
                        </tbody>
                        </table>
                    </div>
                    : null 
                }

                {
                    (is_fetched_safebox && !safebox_hash)
                    ? <div>

                        <div className='bg-white p-8 shadow-xl'>

                            <Formik
                                innerRef={this.formRef}
                                initialValues={init_data}
                                validationSchema={salaryFormSchema}
                                onSubmit={this.saveSafebox}>
                                {({ errors, touched }) => (
                                    
                                    <Form className="w-full">
                                    
                                    <FormObserver onChange={this.handleFormChange}/>

                                    <div className="p-4 md:p-6">
                                        <h2 className='h1 mb-8 text-center'>{t('create safebox')}</h2>
                                        <Field name="address" label={t("wallet address")} placeholder={t("ETH wallet address")} readOnly={true}/>
                                        <Field name="password" label={t("password")} placeholder={t("password")} />
                                        <div className='border-t border-gray-300 my-4' />
                                        <div className="form-submit flex justify-end mt-4">
                                            <Button loading={is_adding_safebox} className="btn btn-primary" type="submit">{t("submit")}</Button>
                                        </div>

                                    </div>

                                </Form>
                                )}
                            </Formik>


                        </div>
                    </div>
                    : null 
                }

                <WithdrawModal amount={this.state.withdraw_token_amount} 
                    token_address={this.state.withdraw_token_address}
                    refresh={this.refresh}
                    closeModal={this.hideWithdrawModal} visible={this.state.show_withdraw_modal}/>


            </div>
            </div>

            </MustLogin>
    </PageWrapper>
    }

    
}

Steaming.getInitialProps =  wrapper.getInitialPageProps((store) => async ({pathname, req, res,query}) => {
    if (req && req.cookies) {
        await initPage('login_user',{},store.dispatch,req.cookies);
    }
    return {
    };
});

export default Steaming

