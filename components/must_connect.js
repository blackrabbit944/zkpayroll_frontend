import React from 'react';
import { connect } from 'react-redux'

// import { denormalize } from 'normalizr';
// import { userSchema } from 'redux/schema/index'
import {setGlobalModal} from 'redux/reducer/setting'

class MustConnectWalletWrapper extends React.Component {


    constructor(props) {
        super(props)
        this.state = {
        }
    }


    render() {

        const {wallet} = this.props;

        if (wallet.get('status') == 'connected') {
            return <div>
                {this.props.children}
            </div>
        }else {
            return <div className="h-full flex flex-col items-center justify-center h-96 text-center">
                <button onClick={this.props.setGlobalModal.bind({},'connect')} className="btn btn-primary btn-lg">Connect Wallet</button>
            </div>
        }
    }
}


const mapDispatchToProps = (dispatch) => {
    return {
        setGlobalModal : (data) => {
            return dispatch(setGlobalModal(data))
        }
    }
}
function mapStateToProps(state,ownProps) {
    return {
        'wallet'  :  state.getIn(['setting','wallet']),
    }
}
export default connect(mapStateToProps,mapDispatchToProps)(MustConnectWalletWrapper);

