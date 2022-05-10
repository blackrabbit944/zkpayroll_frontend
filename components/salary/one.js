import React from 'react';
// import Link from 'next/link'
import {confirm} from 'components/common/confirm/index'
import {withTranslate} from 'hocs/index'
import {deleteConfirm} from 'helper/translate'
import autobind from 'autobind-decorator'
import {autoDecimal} from 'helper/number'
import {showtime} from 'helper/time'
import AddressOne from 'components/etherscan/address'
import {getTokenName} from 'helper/token'

@withTranslate
class SalaryOne extends React.Component {

    @autobind
    async handleDelete(id) {

        if (await confirm({
            confirmation: deleteConfirm(this.props.i18n.t)
        })) {
            await this.props.delete(id);
            this.props.refresh();
        } else {
            console.log('cancel delete');
        }
    }

    render() {
        const { salary } = this.props;
        const {t} = this.props.i18n;

        return <tr>
            <td>{salary.get('id')}</td>
            <td>{salary.get('name')}</td>
            <td><AddressOne wallet_address={salary.get('address')} /></td>
            <td>{autoDecimal(salary.get('amount'))}</td>
            <td className='uppercase'>{
                getTokenName(salary.get('contract_address'))
            }</td>
            <td>{showtime(salary.get('create_time'))}</td>
            <td>{showtime(salary.get('update_time'))}</td>
            <td>
                <div className='flex justify-end space-x-2'>
                    <button className='btn btn-sm btn-default' onClick={this.handleDelete.bind({},salary.get('id'))}>{t('delete')}</button>
                    <button className='btn btn-sm btn-default' onClick={this.props.update.bind({},salary)}>{t('update')}</button>
                </div>
            </td>

        </tr>
    }
}


module.exports = SalaryOne
