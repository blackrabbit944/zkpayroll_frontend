import React from 'react';
import { connect } from 'react-redux'

import autobind from 'autobind-decorator'
import Immutable from 'immutable'

import Button from 'components/common/button'
import Loading from 'components/common/loading'
import Modal from 'components/common/modal'
import Empty from 'components/common/empty'

import {httpRequest} from 'helper/http'
import {removeValueEmpty} from 'helper/common'

import {PhotographIcon,CheckCircleIcon,CubeTransparentIcon} from '@heroicons/react/outline'

import { userSchema } from 'redux/schema/index'

// import {withPageView} from 'hocs/index'
import {withPageList} from 'hocs/index'

import {loadMyItemList} from 'redux/reducer/item'
import {denormalize} from 'normalizr'
import {itemListSchema} from 'redux/schema/index'
import {withTranslate} from 'hocs/index'


@withTranslate
class UserNFTAvatarSetting extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            'is_updating' : false,
            'is_fetching' : false,
            'is_fetched'  : false,
            'assets'      : Immutable.List([]),
            'show_modal'  : false,
            'selected'    : null,
            'offset'      : 0,
            'limit'       : 20,
        }
        this.formRef = React.createRef();
    }

    @autobind
    select(one) {
        this.setState({
            'selected' : one
        })
    }

    @autobind
    toggleModal() {
        this.setState({
            show_modal : !this.state.show_modal
        })
    }

    @autobind
    loadMore() {
        const {offset,limit} = this.state;
        this.setState({
            'offset' : offset + limit,
        },()=>{
            this.loadNftAssets();
        })
    }

    @autobind
    finish() {
        const {selected} = this.state;
        
        if (this.props.handleFinish) {
            this.props.handleFinish(selected);
        }

        this.toggleModal()
    }


    render() {

        const {t} = this.props.i18n;
        // const {assets,show_modal,is_fetching,selected,is_fetched,offset,limit} = this.state;
        // const {login_user} = this.props;

        // let total_count = offset + limit;

        // if (!login_user || !login_user.get('wallet_address')) {
        //     return null;
        // }

        const {list_data,entities} = this.props;
        const {show_modal,selected} = this.state;

        let list_data_one =  this.props.getListData(list_data)
        let list_rows = denormalize(list_data_one.get('list'),itemListSchema,entities)

        let count = list_data_one.get('total');
        let is_empty = (list_data_one.get('is_fetched') && list_rows.count() == 0)
        let is_fetching = list_data_one.get('is_fetching');


        return (
            <div>
                <div><button className="btn btn-default" onClick={this.toggleModal}>{t('use NFT avatar')}</button></div>
                <Modal 
                    title={t('select NFT avatar')} 
                    onClose={this.toggleModal} 
                    visible={show_modal}
                    footer={<div className="p-4 text-right jd-border-t">
                        <button onClick={this.finish} className="btn btn-primary" disabled={selected ?  false : true}>{t('use as avatar')}</button>
                    </div>}
                    >
                <div className="">
                
                {
                    (is_empty)
                    ? <div className="my-4">
                        <Empty icon={<CubeTransparentIcon className="w-8"/>}/>
                    </div>
                    : <div className="flex justify-start flex-wrap select-nft-wapper">
                        {
                            list_rows.map(one=>{
                                console.log('item-one',one.toJS());
                                return <div key={one.get('id')} 
                                    onClick={this.select.bind({},one)}
                                    className="w-28 h-28 rounded mx-2 my-2 bg-cover cursor-pointer bg-center bg-no-repeat relative"
                                    style={{backgroundImage:"url("+one.get('http_image_url')+")"}}>
                                    {
                                        (selected && selected.get('id') == one.get('id'))
                                        ? <div className="absolute bottom-2 right-2 bg-green-500 text-white rounded-full"><CheckCircleIcon className="w-6 h-6"/></div>
                                        : null
                                    }
                                </div>
                            })
                        }
                        </div>
                }
                {
                    (is_fetching)
                    ? <div className="my-4 flex justify-center"><Loading /></div>
                    : null
                }
                {
                    (count == list_rows.count())
                    ? <div>
                        <button className="btn btn-default w-full block" onClick={this.loadMore}>{t('load more')}</button>
                    </div>
                    : null
                }
                </div>
                </Modal>
            </div>
        )
    }
    
}


function mapStateToProps(state,ownProps) {

    ///注册成功

    let login_user_id = state.getIn(['setting','login_user']);
    let login_user = null;
    if (login_user_id) {
        denormalize(login_user_id,userSchema,state.getIn(['entities']))
    }


    return {
        entities        : state.getIn(['entities']),
        list_data       : state.getIn(['item','list']),
        login_user      : login_user
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        loadList   : (cond) => {
            return dispatch(loadMyItemList(cond))
        },
    }
}
const formatData = (props) => {
    let result = removeValueEmpty({
        owner     : props.owner,
        page_size : 20
    })
    return result;
}

module.exports = connect(mapStateToProps,mapDispatchToProps,null, {forwardRef: true})(withPageList(UserNFTAvatarSetting,{'formatData':formatData}))
