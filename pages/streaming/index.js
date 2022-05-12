import React from 'react';

import {wrapper} from 'redux/store';
import { connect } from "react-redux";
import autobind from 'autobind-decorator'
import PageWrapper from 'components/pagewrapper'

import SteamingSalaryAdd from 'components/steaming_salary/add'
import SteamingSalaryList from 'components/steaming_salary/list'

import MustLogin from 'components/must_login'

import NavLink from 'components/common/navlink'

import Head from 'next/head'
import Button from 'components/common/button'

import {initPage} from 'helper/init'
import { withRouter } from 'next/router'

import SalaryStaistics from 'components/steaming_salary/staistics'

import {withTranslate} from 'hocs/index'

@withTranslate
@withRouter
class Steaming extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            'show_add_modal' : false,
            'update_item'    : null
        }
        this.listRef = React.createRef();
    }


    @autobind
    toggleAddModel() {
        this.setState({
            show_add_modal : !this.state.show_add_modal,
            update_item    : null
        })
    }


    @autobind
    refreshList() {
        console.log('debug:refreshList',this.listRef);
        if (this.listRef && this.listRef.current) {
            this.listRef.current.refresh();
        }
    }

    @autobind
    showUpdateSalary(one) {
        this.setState({
            'show_add_modal' : true,
            'update_item'    : one
        });
    }


    render() {
        const {t} = this.props.i18n;
        const {show_add_modal} = this.state;


        return <PageWrapper>
            <Head>
                <title>Zkpayroll</title>
            </Head>
            <MustLogin>
            <div>
                <div className='tab-2'>
                    <NavLink href="/streaming" activeClassName='active'><a className='tab-one'>{t('streaming pay')}</a></NavLink>
                    <NavLink href="/streaming/my" activeClassName='active'><a className='tab-one'>{t('my streaming pay')}</a></NavLink>
                </div>
            <div className="page-wapper">



                <h1 className='h1 mb-8 text-blue-500'>{t('streaming pay')}</h1>

                <div className='flex justify-between items-center'>
                    <h2 className='font-black font-bold text-2xl my-4 capitalize'>{t('salary list')}</h2>
                    <Button className="btn btn-primary" onClick={this.toggleAddModel}>{t('add employer')}</Button>
                </div>
                <div className=''>
                    <SteamingSalaryList ref={this.listRef} showUpdateSteamingSalary={this.showUpdateSalary}/>
                </div>

                <SalaryStaistics />


                <SteamingSalaryAdd visible={show_add_modal} 
                    salary={this.state.update_item}
                    closeModal={this.toggleAddModel}
                    refreshList={this.refreshList}
                    />


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

const mapDispatchToProps = (dispatch) => {
     return {
     }
}
function mapStateToProps(state,ownProps) {
    return {
        'status' : state.getIn(['setting','status']),
    }
}

export default connect(mapStateToProps,mapDispatchToProps)(Steaming)

