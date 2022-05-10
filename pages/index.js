import React, { useState,useEffect } from 'react';

import {wrapper} from 'redux/store';
import { connect } from "react-redux";
import autobind from 'autobind-decorator'
import PageWrapper from 'components/pagewrapper'

import Loading from 'components/common/loading'

import Head from 'next/head'
import Link from 'next/link'

import {initPage} from 'helper/init'
import { withRouter } from 'next/router'

import {setCookie} from 'helper/cookie'

import {withTranslate} from 'hocs/index'
import {t} from 'helper/translate'
import {ClockIcon,CurrencyDollarIcon,TableIcon} from '@heroicons/react/outline'

@withTranslate
@withRouter
class Home extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
        }
    }

    componentDidMount() {
    }


    // @autobind
    // initPage() {
    //     this.props.initApp();
    //     // initPage('login_user',{},store.dispatch,req.cookies)
    // }


    render() {
        // const {t} = this.props.i18n;
        

        return <PageWrapper>
            <Head>
                <title>Zkpayroll</title>
            </Head>
            <div className="">
          
                <div className='bg-gradient-to-r from-navy-500 to-blue-500 text-white  py-24'>
                    <div className='max-w-screen-xl mx-auto'>
                        <div className='font-bold text-center capitalize text-3xl mb-4'>{t('pay your employees with web3')}</div>
                        <div className='text-center text-xl capitalize'>{t('Use crypto currencies and streaming pay to make your employees feel like they are making money every second')}</div>
                    
                        <div className='bg-white h-2 rounded-lg mt-16 max-w-screen-sm mx-auto'>
                            <div className='bg-gradient-to-r from-navy-500 to-green-500 w-64 h-2 rounded-lg'>
                            </div>
                        </div>

                        <div className='text-center mt-4 capitalize font-bold'>
                            you have earn : {100} usdt
                        </div>
                    </div>
                </div>

                <div className='my-12'>
                    <h2 className='h2 text-center mb-4'>{t('features')}</h2>
                    <div className='grid grid-cols-3 gap-4 mx-auto max-w-screen-lg text-center '>
                        <div>
                            <div className='flex justify-center mb-4'>
                                <ClockIcon className='w-24 text-blue-500'/>
                            </div>
                            <div>
                                <div className='text-xl font-bold mb-4'>{t('steaming pay')}</div>
                                <div className='text-gray-600'>
                                    {t('pay as time passed, pay every second')}
                                </div>
                            </div>
                        </div>
                        <div>
                            <div className='flex justify-center mb-4'>
                                <CurrencyDollarIcon className='w-24 text-blue-500'/>
                            </div>
                            <div>
                                <div className='text-xl font-bold mb-4'>{t('support multi tokens')}</div>
                                <div className='text-gray-600'>
                                    {t('you can use BUSD,USDT,BNB and more tokens for paying')}
                                </div>
                            </div>
                        </div>
                        <div>
                            <div className='flex justify-center mb-4'>
                                <TableIcon className='w-24 text-blue-500'/>
                            </div>
                            <div>
                                <div className='text-xl font-bold mb-4'>{t('manage salary')}</div>
                                <div className='text-gray-600'>
                                    {t('manage  salary system')}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>




            </div>
    </PageWrapper>
    }

    
}

Home.getInitialProps =  wrapper.getInitialPageProps((store) => async ({pathname, req, res,query}) => {
    if (req && req.cookies) {
        await initPage('login_user',{},store.dispatch,req.cookies);
    }
    return {
        'f' : (query.f) ? query.f : ""
    };
});

const mapDispatchToProps = (dispatch) => {
     return {
     }
}
function mapStateToProps(state,ownProps) {
    return {
        'status' : state.getIn(['setting','status']),
    }
}

export default connect(mapStateToProps,mapDispatchToProps)(Home)

