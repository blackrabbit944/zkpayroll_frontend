import React from 'react';
import { connect } from "react-redux";

import Loading from 'components/common/loading'
import {withTranslate} from 'hocs/index'

import {denormalize} from 'normalizr'
import {steamingSalaryListSchema,userSchema} from 'redux/schema/index'
import {CurrencyDollarIcon} from '@heroicons/react/outline'
import {defaultListData} from 'helper/common'
import {getTokenName} from 'helper/token'

import { BigNumber } from 'bignumber.js';

import Erc20 from 'helper/web3/erc20'
import SalarySendModal from 'components/steaming_salary/send_modal'
import autobind from 'autobind-decorator';

@withTranslate
class SalaryStaistics extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            stat_map : null,
            balance_map : {},

            'show_pay_salary_modal' : false,
            'contract_address'      : null,
            'total_amount'          : 0
        }
        this.getBalancesOfAssets = ::this.getBalancesOfAssets
    }
    
    static getDerivedStateFromProps(props, state) {
        
        let output = {};

        if (props.stat_map) {
            output['stat_map'] = props.stat_map;
        }

        if (props.login_user) {
            output['login_user'] = props.login_user;
        }

        return output
    }

    componentDidMount() {
        if (this.props.stat_map && this.props.login_user) {
            console.log('debug:01')
            this.getBalancesOfAssets(this.props.stat_map,this.props.login_user)
        }else {
            console.log('debug:02');
        }
    }

    componentDidUpdate(prevProps,preState) {
        if (this.state.stat_map !== preState.stat_map || this.state.login_user !== preState.login_user) {
            this.getBalancesOfAssets(this.state.stat_map,this.state.login_user);
        }
    }

    async getBalancesOfAssets(stat_map,login_user) {

        let address = login_user.get('wallet_address');
        
        let balance_map = {};
        await Promise.all(Object.keys(stat_map).map(async(contract_address)=>{
            let erc20 = new Erc20(contract_address)
            let balance = await erc20.amountBalanceOf(address);
            balance_map[contract_address] = balance.toString();
            return balance;
        }))

        this.setState({
            balance_map : balance_map
        })
        // console.log('balance_map',balance_map)
    }

    @autobind
    gotoPaySalary(contract_address,total_amount) {
        this.setState({
            'show_pay_salary_modal' : true,
            'contract_address'      : contract_address,
            'total_amount'          : total_amount
        })
    }

    @autobind
    closeModal() {
        this.setState({
            'show_pay_salary_modal' : false,
            'contract_address'      : null,
            'total_amount'          : 0
        })
    }


    render() {

        const {list_data,list_rows,stat_map,login_user} = this.props;
        const {show_pay_salary_modal,contract_address,total_amount} = this.state;
        const {t} = this.props.i18n;

        if (Object.keys(stat_map).length == 0) {
            return null;
        }

        return <div>
            <div className='flex justify-between items-center mt-12'>
                <h2 className='font-black font-bold text-2xl my-4 capitalize'>{t('salary statistics')}</h2>
            </div>
            <table className='data-table'>
                <thead>
                    <tr>
                        <th>{t('token')}</th>
                        <th>{t('total amount')}</th>
                        <th>{t('balance')}</th>
                        <th className='flex justify-end'>{t('action')}</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        (list_data.get('is_fetching'))
                        ? <tr><td colspan="10"><Loading /></td></tr>
                        : null
                    }
                    {
                        (list_data.get('is_fetched') && list_rows.count() == 0)
                        ? <tr>
                            <td colspan="10">
                                <div className="py-4 flex justify-center items-center flex-col">
                                    <CurrencyDollarIcon className='icon-base text-gray-500'/>
                                    <div className='font-bold mt-4 text-base font-ubuntu text-gray-500'>{t('empty')}</div>
                                </div>
                            </td>
                        </tr>
                        : null
                    }
                    {
                        (list_data.get('is_fetched'))
                        ? <>
                        {
                            Object.keys(stat_map).map((key)=>{
                                return <tr key={key}>
                                    <td className='uppercase'>{getTokenName(key)}</td>
                                    <td>{stat_map[key]['amount'].toNumber()}</td>
                                    <td>{this.state.balance_map[key] ? this.state.balance_map[key] : 0}</td>
                                    <td className='flex justify-end'><button className='btn btn-sm btn-primary' onClick={this.gotoPaySalary.bind({},key,stat_map[key]['amount'])}>{t('batch payroll')}</button></td>
                                </tr>
                            })
                        }
                        </>
                        : null
                    }
                </tbody>
            </table>
            <SalarySendModal visible={show_pay_salary_modal} list_rows={list_rows} contract_address={contract_address} total_amount={total_amount} closeModal={this.closeModal}/>
        </div>
        


    }
}

const mapDispatchToProps = (dispatch) => {
    return {
    }
}
function mapStateToProps(state,ownProps) {

    let entities = state.get('entities');


   let list_data = state.getIn(['steaming_salary','list','d41d8cd98f00b204e9800998ecf8427e']);
   if (!list_data) {
       list_data = defaultListData
   }
   let list_rows = denormalize(list_data.get('list'),steamingSalaryListSchema,entities)

   let stat_map = {}
   list_rows.map(one=>{
       let addr = one.get('contract_address');
       let amount = new BigNumber(one.get('amount'))

       if (stat_map[addr] && stat_map[addr]['amount']) {
            stat_map[addr]['amount'] = stat_map[addr]['amount'].plus(amount)
       }else {
            stat_map[addr] = {
                amount : amount
            }
       }
   })

   ///注册成功
   let login_user_id = state.getIn(['setting','login_user']);
   let login_user = null;
   if (login_user_id) {
       login_user = denormalize(login_user_id,userSchema,entities)
   }

   return {
       'login_user'  :  login_user,
       'list_data' : list_data,
       'list_rows' : list_rows,
       'stat_map'  : stat_map
    }
}

export default connect(mapStateToProps,mapDispatchToProps)(SalaryStaistics)

