import React from 'react';
import autobind from 'autobind-decorator'
import Button from 'components/common/button';
import Modal from 'components/common/modal';
//import classNames from 'classnames';

import { connect } from "react-redux";
import message from 'components/common/message';
import { CopyToClipboard } from 'react-copy-to-clipboard';

import { withTranslate } from 'hocs/index';
import {CursorClickIcon} from '@heroicons/react/outline';

import {loginUserUseWallet,logoutUser} from 'redux/reducer/user';
import {setGlobalModal,walletConnect} from 'redux/reducer/setting'

import { isMobile} from "react-device-detect";

import { denormalize } from 'normalizr';
import { userSchema } from 'redux/schema/index'

import Signature from 'helper/web3/signature'
import Metamask from 'helper/web3/metamask'
import notification from 'components/common/notification'

import {getConfig} from 'helper/config'

@withTranslate
class WalletConnectModal extends React.Component {

    constructor(props) {
        super(props)

        let website_url = getConfig('WEBSITE');

        this.state = {
            modal           : false,    //可选false,account,connect
            website_domain  : this.getDomain(website_url)
        }
        this.metamask =  null;
    }   

    getDomain(website_url) {
        let website_domain = website_url.replace(/http:\/\//g, "");
        website_domain = website_domain.replace(/https:\/\//g, "");
        return website_domain;
    }

    @autobind
    getMetamask() {
        if (!this.metamask) {
            this.metamask = new Metamask();
        }
        return this.metamask;
    }

    @autobind
    async connectWallet() {
        // const {t} = this.props.i18n;

        let connected_data = await this.getMetamask().connectWallet();

        if (!connected_data) {
            let error_message = this.getMetamask().getErrorMessage();
            return false;
        }

        this.props.walletConnect({
            'name'      : 'metamask',
            'chain_id'  : connected_data.chain_id,
            'address'   : connected_data.address[0]
        });

        return connected_data;
    }

    @autobind
    async loginWallet() {

        const {t} = this.props.i18n;

        let connected_data = await this.connectWallet();
        if (!connected_data) {
            return false;
        }

        if (connected_data.address[0]) {
            console.log('准备签名');
            let sign = new Signature(t);
            sign.signLoginMessage(connected_data.address[0],{
                onSuccess : this.loginWalletSuccess,
                onError   : this.loginWalletError
            });
        }else {
            console.log('没有地址')
        }
    }

    @autobind
    loginWalletError(err) {
        const {t} = this.props.i18n;

        if (err.code == 4001) {
            notification.error({
                'message' : t('login cancel'),
                'description' : ''
            });
        }else {
            notification.error({
                'message'       : t('login error'),
                'description'   : err.message
            });
        }
    }

    @autobind
    loginWalletSuccess(values) {

        const {t} = this.props.i18n;

        this.setState({
            'is_fetching_wallet' : true
        })
        
        var that = this;

        console.log('准备登录',values);

        this.props.loginUserUseWallet(values).then((result)=>{
            console.log('loginWallet完成，结果是',result);

            that.setState({
                'is_fetching_wallet' : false
            })

            if (result.status == 'success') {

                notification.success({
                    'message' : t('login success'),
                    'description' : ''
                })

                // that.toggleModal.bind({},'connect')
            }

        }).catch(e=>{
            that.setState({
                'is_fetching_wallet' : false
            })
            console.log('error',e)
        })
    }   
    
    @autobind
    setModal(name) {
        this.setState({
            modal: name 
        })
    }

    @autobind
    logout() {
        var that = this;
        this.props.logoutUser().then(result=>{
            if (result.status == 'success') {
                // that.toggleModal('account');
            }
        }).catch(e=>{
            console.log('logout,e',e);
        })
    }

    @autobind
    closeModal() {
        this.props.setGlobalModal(null)
    }

    render() {

        const {login_user,global_modal} = this.props;
        const {website_domain} = this.state;
        const {t} = this.props.i18n;

        let short_wallet_address = '';
        if (login_user && login_user.get('wallet_address')) {
            short_wallet_address = login_user.get('wallet_address').slice(0,4) + '...' + login_user.get('wallet_address').slice(-4)
        }

        // console.log('website_domain',website_domain)
        /*<li>
            <a className="wallet-one flex justify-start items-center dark:text-white" onClick={this.connectWallet}>
                <img src="/img/wallet/metamask.svg" className="h-12 mr-4"/>
                <span className='text-lg font-ubuntu'>Metamask(connectWallet)</span>
            </a>
        </li>*/

        return (<>
           {
                (login_user) 
                ? <Modal
                    width={650}
                    title="Account" 
                    visible={global_modal=='account'} 
                    footer={null}
                    onClose={this.closeModal}>
                    <div className="py-4">
                        <div className="font-ubuntu break-all text-lg text-center">
                        <CopyToClipboard text={login_user.get('wallet_address')} onCopy={() => message.success('copy success')}>
                            <a className='cursor-pointer'>{login_user.get('wallet_address')}</a>
                        </CopyToClipboard>
                        </div>
                        <div className={"text-center w-full flex justify-center mt-2 mb-8"}>
                            <a href={"https://etherscan.io/address/"+login_user.get('wallet_address')} target="_blank" className="flex items-center a text-sm"><CursorClickIcon className={"w-4 h-4"} />View on Etherscan</a>
                        </div>
                    </div>
                    <div className="mt-4 text-center mb-4">
                        <Button className="btn btn-primary" onClick={this.logout}>logout</Button>
                    </div>
                </Modal>
                
                : <Modal
                className=""
                width={420}
                title={
                    t('connect wallet')
                } 
                footer={null}
                visible={global_modal=='connect'} 
                onOk={this.handleOk} 
                onClose={this.closeModal}>
                    <div className={""}>
                        <ul>
                            <li>
                                {
                                    (isMobile)
                                    ? <a href={"https://metamask.app.link/dapp/"+website_domain} className="wallet-one flex justify-start items-center dark:text-white">
                                        <img src="/img/wallet/metamask.svg" className="h-12 mr-4"/>
                                        <span className='text-lg font-ubuntu'>Metamask</span>
                                    </a>
                                    : <a className="wallet-one flex justify-start items-center dark:text-white" onClick={this.loginWallet}>
                                        <img src="/img/wallet/metamask.svg" className="h-12 mr-4"/>
                                        <span className='text-lg font-ubuntu'>Metamask</span>
                                    </a>
                                }
                            </li>
   
                        </ul>
                    </div>
                </Modal>
            }
        </>
        )
    }
}

const mapDispatchToProps = (dispatch) => {
     return {
        'loginUserUseWallet' : (data) => {
            return dispatch(loginUserUseWallet(data))
        },
        'logoutUser'    : () => {
            return dispatch(logoutUser())
        },
        'setGlobalModal' : (name) => {
            return dispatch(setGlobalModal(name))
        },
        'walletConnect' : (data)    =>  {
            return dispatch(walletConnect(data))
        }
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
        'login_user'        :  login_user,
        'global_modal'      :  state.getIn(['setting','global_modal'])
    }
}


module.exports = connect(mapStateToProps,mapDispatchToProps)(WalletConnectModal)
