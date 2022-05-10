import React from 'react';
import { connect } from 'react-redux'
import autobind from 'autobind-decorator'

import classNames from 'classnames';
import ConnectBtn from 'components/wallet/connect_btn'
import ConnectModal from 'components/wallet/connect_modal'
import LanguageBtn from 'components/language/btn'
import NavLink from 'components/common/navlink'
import { ethers } from "ethers";

import Head from 'next/head'
import Link from 'next/link'
import Logo from 'public/img/logo.svg'

import { MenuIcon} from '@heroicons/react/outline'
import Footer from 'components/custom_layout/footer'

import { denormalize } from 'normalizr';
import { userSchema,clubSchema } from 'redux/schema/index'
import { initApp,setSlider,setGlobalModal } from 'redux/reducer/setting'
import {fakeLoginUser,logoutUser} from 'redux/reducer/user';
import { t } from 'helper/translate';

class PageWrapper extends React.Component {


    constructor(props) {
        super(props)
        this.state = {
        }
    }

    componentDidMount() {
        //initpage
        this.initPage();

        //
        this.listenNetworkChange();

    }


    listenNetworkChange() {

        if (typeof window.ethereum !== 'undefined') {

            ethereum.on('accountsChanged', (accounts) => {
                console.log('account changed',accounts);
                this.logoutUser();
            });

            // The "any" network will allow spontaneous network changes
            const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
            provider.on("network", (newNetwork, oldNetwork) => {
                if (oldNetwork) {
                    window.location.reload();
                }
            });
        }

    }

    @autobind
    logoutUser() {
        const {login_user} = this.props;
        if (login_user) {
            console.log('调用logout前loginuser是',login_user);
            this.props.logoutUser();
        }
    }

    @autobind
    initPage() {
        this.props.initApp();
        // initPage('login_user',{},store.dispatch,req.cookies)
    }

    @autobind
    fakeLogin(address) {
        this.props.fakeLoginUser({'address':address})
    }

    @autobind
    toggleSider() {
        const {slider} = this.props;
        this.props.setSlider(!slider)
    }


    render() {

        const {active_club} = this.props;

        console.log('active_club',active_club)


        return (
            <div className="fullpage-container">
                <Head>
                    <title>Zkpayroll</title>
                    <link href="/img/icons/favicon.png" rel="icon" type="image/x-icon" />
                </Head>
                <div>
                            

                    <div className="h-screen w-screen overflow-hidden">
                        <div className="mt-14" >
                            <div className={classNames("h-screen-without-header","jd-drawer-content","pb-0")}>
                                <div className='h-screen-without-header-and-footer'>
                                {this.props.children}
                                </div>
                                <Footer />
                            </div>
                        </div>
                    </div>

                    <ConnectModal />

                    <div className="bg-white dark:bg-gray-700 dark:border-b dark:border-black h-14 px-4 flex justify-start shadow fixed w-full top-0 z-100">

                        <div onClick={this.toggleSider} className="md:hidden py-4 mr-2">
                            <MenuIcon className='icon-sm text-gray-800 dark:text-gray-200'/>
                        </div>

                        <Link href="/">
                            <a className="logo">
                                <Logo className="h-6"/>
                            </a>
                        </Link>

                        <div className='flex items-center space-x-4 main-headers'>
                            <NavLink href="/"><a>{t('home')}</a></NavLink>
                            <NavLink href="/batch"><a>{t('batch pay')}</a></NavLink>
                            <NavLink href="/steaming"><a>{t('steaming pay')}</a></NavLink>
                            <NavLink href="/my_steaming"><a>{t('my steaming pay')}</a></NavLink>
                        </div>


                        <div className="flex justify-end items-center flex-grow">
                            <LanguageBtn />
                            <ConnectBtn />
                        </div>
                            
                    </div>


                </div>
            </div>
        );
    }
}


const mapDispatchToProps = (dispatch) => {
    return {
        setSlider : (data) => {
            return dispatch(setSlider(data))
        },
        setGlobalModal : (payload) => {
            return dispatch(setGlobalModal(payload));
        },
        fakeLoginUser : (payload) => {
            return dispatch(fakeLoginUser(payload));
        },
        initApp : () => {
            return dispatch(initApp());
        },
        logoutUser : () => {
            return dispatch(logoutUser());
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

    let active_club_id = state.getIn(['setting','active_club_id']);
    let active_club = null;
    if (active_club_id) {
        active_club = denormalize(active_club_id,clubSchema,entities)
    }

    return {
        'login_user'  :  login_user,
        'slider'      :  state.getIn(['setting','slider']),
        'active_club' :  active_club
    }
}
export default connect(mapStateToProps,mapDispatchToProps)(PageWrapper);

