import React from 'react';

// import Metamask from 'helper/web3/metamask'
import Erc721 from 'helper/web3/erc721'
import autobind from 'autobind-decorator'

class TokenOwnerWapper extends React.Component {


    constructor(props) {
        super(props)
        this.state = {
            'owner'             : '',
        }
    }

    componentDidMount() {
        ///获得合约的owner
        this.getOwner(this.props);  
    }


    componentWillUpdate(nextProps,nextState) {
        if (nextProps.login_user 
            && nextProps.login_user.equals(this.props.login_user) == false) {
            this.getOwner(nextProps)
        }

        if (nextState.owner && nextState.owner != this.state.owner) {
            if (typeof this.props.ownerCallback !== 'undefined') {
                this.props.ownerCallback(nextState.owner);
            }
        }
    }

    @autobind
    async getOwner(props) {

        const {contract_address,token_id,login_user} = props;

        if (!login_user) {
            return false;
        }

        let erc721 = new Erc721(contract_address);
        let owner = await erc721.ownerOf(token_id);
        // console.log('debug02,getOwner:owner',owner);

        if (owner) {
            this.setState({
                'owner' : owner.toLowerCase()
            })
        }
    }


    render() {

        const {login_user} = this.props;
        const {owner} = this.state;

        let is_owner = false;
        if (login_user && login_user.get('wallet_address').toLowerCase() == owner.toLowerCase()) {
            is_owner = true;
        }
        if (is_owner) {
            return (
                <div>
                    {this.props.children}
                </div>
            );
        }else {
            return null;
        }
        
    }
}



export default TokenOwnerWapper;

