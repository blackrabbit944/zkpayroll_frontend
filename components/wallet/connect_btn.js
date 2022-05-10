import React from 'react';
// import autobind from 'autobind-decorator'
// import classNames from 'classnames';
import Button from 'components/common/button';

import { connect } from "react-redux";

import {setGlobalModal} from 'redux/reducer/setting'

import { denormalize } from 'normalizr';
import { userSchema } from 'redux/schema/index'

// import {UserCircleIcon} from '@heroicons/react/outline'

class WalletConnectBtn extends React.Component {

    constructor(props) {
        super(props)
        this.state = {}
    }   

    render() {

        const {login_user} = this.props;

        let short_wallet_address = '';
        if (login_user && login_user.get('wallet_address')) {
            short_wallet_address = login_user.get('wallet_address').slice(0,4) + '...' + login_user.get('wallet_address').slice(-4)
        }
        return (
            <>
                {
                    (login_user)
                    ? <div>
                        <a
                            className='btn-default' 
                            onClick={this.props.setGlobalModal.bind({},'account')}
                        >
                            {
                                (login_user.get('wallet_address'))
                                ? short_wallet_address
                                : '...'
                            }
                        </a>
                    </div>
                    : <div>
                        
                        <Button className="btn btn-primary btn-sm md:btn-normal" onClick={this.props.setGlobalModal.bind({},'connect')}>Connect Wallet</Button>
                    </div>
                }
            </>
        );
    }
}

const mapDispatchToProps = (dispatch) => {
     return {
        'setGlobalModal' : (modal_name) => {
            return dispatch(setGlobalModal(modal_name))
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
    }
}


module.exports = connect(mapStateToProps,mapDispatchToProps)(WalletConnectBtn)
