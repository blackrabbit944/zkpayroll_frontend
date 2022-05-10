import React from 'react';

import Image from 'next/image'
import TransactionOne from 'components/contract/trx/transaction_one'
import Loading from 'components/common/loading'
import CommonList from 'components/hoc/list'

import {fetchData} from 'helper/misc'
import Immutable from 'immutable';

class MyTransactionList extends CommonList {

    constructor(props) {
        super(props)
        this.state = {
            'account'       : '',
            'is_fetching'   : false,
            'is_fetched'    : false,
            'data'          : Immutable.List([]),
            'page'          : 1,
            'page_size'     : 40,
            'data_count'    : 0
        }
        this.refreshKeys = ['page','account'];
        this.loadListFunction = this.fetchTransactionList;

    }   

    formatData(state) {
        return {
            'page'          : state.page,
            'account'       : state.account,
        }
    }

    static getDerivedStateFromProps(nextProps, prevState) {

        let newState = {}

        let refreshKeys =  ['account']

        refreshKeys.map(one=>{
            if (nextProps[one] != prevState[one]) {
                newState[one] = nextProps[one];
            }
        });

        if (Object.keys(newState).length > 0) {
            newState['is_fetched'] = false;
            newState['is_fetching'] = false;
            return newState
        }else {
            return null
        }
    }


    async fetchTransactionList(data) {
        console.log('debug:fetchTransactionList')
        if (!data['account']) {
            console.log('debug:因为account为空所以取消了')
            return false;
        }

        this.setState({
            'is_fetching' : true
        })
        // data['account'] = 'TRWnhNBRQvaGsSxqmLGcxC9YAaAsN4t3PQ';

        let result = await fetchData('/api/trx/address/'+data['account']+'/bids?page='+data['page']);

        if (!result) {
            this.setState({
                'is_fetching' : false,
                'is_fetched'  : false,
                'data'        : Immutable.List([])
            });
        }else {
            this.setState({
                'data'       : Immutable.fromJS(result.data.bids),
                'is_fetched' : true,
                'is_fetching': false,
                'page'       : Number(result.data.page),
                'page_size'  : Number(result.data.page_size),
                'data_count' : Number(result.data.count)
            })
        }

    }

    render() {

        const {is_loading,is_show_modal,data,is_fetched,is_fetching,account} = this.state;

        return (
            <div>
                {
                    (is_fetching)
                    ? <Loading theme="gray" />
                    : null
                }
                {
                    (is_fetched && (data == null || data.count() == 0))
                    ? <div className="block-empty">No Transaction</div>
                    : <div className="block-transaction-list">
                        {
                            data.map(one=>{
                                return <TransactionOne key={one.get('event_id')} transaction={one}/>
                            })
                        }
                    </div>
                }
                {
                    this.getPager(this.state.data_count)
                }
            </div>
        );
    }
}


module.exports = MyTransactionList