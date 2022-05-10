import React, { useState,useEffect } from 'react';

import {wrapper} from 'redux/store';
import { connect } from "react-redux";
import autobind from 'autobind-decorator'
import PageWrapper from 'components/pagewrapper'

import Loading from 'components/common/loading'

import MustLogin from 'components/must_login'

import Footer from 'components/custom_layout/footer'

import Head from 'next/head'

import {initPage} from 'helper/init'
import { withRouter } from 'next/router'

import AddressOne from 'components/etherscan/address'
import SteamingLine from 'components/steaming/line'
import Erc20 from 'helper/web3/erc20'

import {withTranslate,withLoginUser} from 'hocs/index'
import SteamingPay from 'helper/web3/steamingpay';
import { getSteamingData } from 'helper/web3/number';
import {getUnixtime,showtime} from 'helper/time'
import { getAmountFromValueAndDecimals } from 'helper/web3/number';
import {getTokenName} from 'helper/token'
import {autoDecimal} from 'helper/number'
import ViewModal from 'components/steaming_salary/view_modal'
import { showTime } from 'helper/misc';

@withLoginUser
@withTranslate
@withRouter
class MySteaming extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            'tx_list' : [],

            'is_fetching' : false,
            // 'show_add_modal' : false,
            // 'update_item'    : null
        }
        // this.listRef = React.createRef();

        this.erc20TokenList = {}
    }
    componentDidMount() {
        this.getMySteamingList();
    }

    @autobind
    getTokenHelper(addr) {
        if (this.erc20TokenList[addr]) {
            return this.erc20TokenList[addr]
        }else {
            this.erc20TokenList[addr] = new Erc20(addr);
            return this.erc20TokenList[addr]
        }
    }
    // @autobind
    // toggleAddModel() {
    //     this.setState({
    //         show_add_modal : !this.state.show_add_modal,
    //         update_item    : null
    //     })
    // }


    // @autobind
    // refreshList() {
    //     console.log('debug:refreshList',this.listRef);
    //     if (this.listRef && this.listRef.current) {
    //         this.listRef.current.refresh();
    //     }
    // }

    // @autobind
    // showUpdateSalary(one) {
    //     this.setState({
    //         'show_add_modal' : true,
    //         'update_item'    : one
    //     });
    // }
    @autobind
    async getMySteamingList() {

        const {login_user} = this.props;
        if (!login_user) {
            console.log('debug:因为login_user不存在,所以返回')
            return;
        }

        this.setState({
            'is_fetching' : true
        })

        console.log('debug:准备从steamingpay读取数据');

        let steaming = new SteamingPay();
        try{
            let tx = await steaming.getUserStreams(login_user.get('wallet_address'),1,20);
        }catch(error) {
            console.log('debug:error,',error)
        }

        let finnal_tx_list = [];
        console.log('debug:从steamingpay读取数据完成');

        
        await Promise.all(tx.map(async(txone)=>{
            if (txone.tokenAddress != '0x0000000000000000000000000000000000000000') {
                console.log('debug:txone',txone);
                let erc20 = this.getTokenHelper(txone.tokenAddress);
                let decimals = await erc20.getDecimals();
                console.log('debug:decimals',decimals);

                let new_row = {
                    'deposit' :txone.deposit,
                    'isEntity' : txone.isEntity,
                    'ratePerSecond'  : txone.ratePerSecond,
                    'recipient'      : txone.recipient,
                    'remainingBalance' : txone.remainingBalance,
                    'sender'    : txone.sender,
                    'startTime' : txone.startTime,
                    'stopTime'  : txone.stopTime,
                    'tokenAddress' : txone.tokenAddress,
                    'decimals'     : decimals
                }
                finnal_tx_list.push(new_row);
            }

        }))

        console.log('debug:finnal_tx',finnal_tx_list)
        this.setState({
            'tx_list' : finnal_tx_list,
            'is_fetching' : false
        })
    }

    @autobind
    viewItem(item) {
        this.setState({
            'show_view_modal' : true,
            'item' : item
        })
    }

    @autobind
    closeItem(item) {
        this.setState({
            'show_view_modal' : false,
            'item' : null
        })
    }


    render() {
        const {t} = this.props.i18n;
        const {tx_list,is_fetching} = this.state;

        console.log('this.state.item',this.state.item)
        console.log('this.state.show_view_modal',this.state.show_view_modal)

        let i = 0;
        return <PageWrapper>
            <Head>
                <title>Zkpayroll</title>
            </Head>
            <MustLogin>
            <div className="page-wapper">

                <h1 className='h1 mb-8 text-blue-500'>{t('my steaming pay')}</h1>

                <div>
                    <table className='data-table'>
                        <thead>
                            <tr>
                                <th>{t('from')}</th>
                                <th>{t('total')}</th>
                                <th>{t('steaming')}</th>
                                <th>{t('begin_time')}</th>
                                <th>{t('end time')}</th>
                                <th className=' flex justify-end'>{t('action')}</th>
                            </tr>
                        </thead>
                        <tbody>
                        {
                            (is_fetching)
                            ? <tr><td colspan="10"><Loading /></td></tr>
                            : null
                        }
                        {
                            tx_list.map(one=>{
                                let tx_data = getSteamingData(one);
                                //console.log('debug:tx_data',tx_data)
                                let amount = getAmountFromValueAndDecimals(tx_data.total.toString(),one.decimals)
                                //console.log('debug:one',one,getTokenName(one.tokenAddress))
                                i += 1;
                                ////erc20.getAmountFromValue(tx_data.total.toString()) 
                                return <tr key={i}>
                                    <td><AddressOne wallet_address={one['sender']} /></td>
                                    <td>{autoDecimal(amount.toString())} {getTokenName(one.tokenAddress)}</td>
                                    <td>
                                        <SteamingLine total={tx_data.total} climbed={tx_data.climbed} total_allow_climb={tx_data.total_allow_climb} />
                                    </td>
                                    <td>
                                        {showtime(one.startTime)}
                                    </td>
                                    <td>
                                        {showtime(one.stopTime)}
                                    </td>
                                    <td className='flex justify-end'>
                                        <button className='btn btn-default btn-sm' onClick={this.viewItem.bind({},one)}>view</button>
                                    </td>
                                </tr>
                            })
                        }
                        </tbody>
                    </table>
                </div>




                <ViewModal item={this.state.item} closeModal={this.closeItem} visible={this.state.show_view_modal}/>
            </div>
            </MustLogin>
    </PageWrapper>
    }

    
}

MySteaming.getInitialProps =  wrapper.getInitialPageProps((store) => async ({pathname, req, res,query}) => {
    if (req && req.cookies) {
        await initPage('login_user',{},store.dispatch,req.cookies);
    }
    return {
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

export default connect(mapStateToProps,mapDispatchToProps)(MySteaming)

