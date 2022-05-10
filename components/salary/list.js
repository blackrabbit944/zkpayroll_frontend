import React from 'react';
import { connect } from "react-redux";

import Loading from 'components/common/loading'
import Empty from 'components/common/empty'
import SalaryOne  from 'components/salary/one'

import {removeValueEmpty} from 'helper/common'
import {withPageList,withTranslate} from 'hocs/index'

import {loadSalaryList,deleteSalary} from 'redux/reducer/salary'
import {denormalize} from 'normalizr'
import {salaryListSchema} from 'redux/schema/index'
import {CurrencyDollarIcon} from '@heroicons/react/outline'

@withTranslate
class SalaryList extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
        }
    }

    render() {

        const {list_data,entities} = this.props;
        const {t} = this.props.i18n;

        let list_data_one =  this.props.getListData(list_data)
        let list_rows = denormalize(list_data_one.get('list'),salaryListSchema,entities)


        console.log('list_data',list_data.count());

        return <table className='data-table'>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>{t('name')}</th>
                    <th>{t('address')}</th>
                    <th>{t('amount')}</th>
                    <th>{t('token')}</th>
                    <th>{t('create time')}</th>
                    <th>{t('update time')}</th>
                    <th className=' flex justify-end'>{t('action')}</th>
                </tr>
            </thead>
            <tbody>
                {
                    (list_data_one.get('is_fetching'))
                    ? <tr><td colspan="10"><Loading /></td></tr>
                    : null
                }
                {
                    (list_data_one.get('is_fetched') && list_rows.count() == 0)
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
                    (list_data_one.get('is_fetched'))
                    ? <>
                        {
                            list_rows.map((one)=>{
                                return <SalaryOne salary={one} key={one.get('id')} 
                                    delete={this.props.deleteSalary}
                                    update={this.props.showUpdateSalary}
                                    refresh={this.props.refresh}
                                />
                            })
                        }
                    </>
                    : null
                }
            </tbody>
        </table>
        


    }
}

function mapStateToProps(state,ownProps) {
    return {
        entities        : state.getIn(['entities']),
        list_data       : state.getIn(['salary','list']),
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        loadList   : (cond) => {
            return dispatch(loadSalaryList(cond))
        },
        deleteSalary : (id) => {
            return dispatch(deleteSalary(id))
        }
    }
}
const formatData = (props) => {
    let result = removeValueEmpty({
        order_by        : props.order_by,
    })
    return result;
}

module.exports = connect(mapStateToProps,mapDispatchToProps,null, {forwardRef: true})(withPageList(SalaryList,{'formatData':formatData}))

