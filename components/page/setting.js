import React from 'react';

import {wrapper} from 'redux/store';
import { connect } from "react-redux";
import autobind from 'autobind-decorator'
import classNames from 'classnames'

import Field from 'components/form/field'
import Button from 'components/common/button'
import AvatarSetting from 'components/form/avatar'
import { CopyToClipboard } from 'react-copy-to-clipboard';

import message from 'components/common/message'

import LinkAddForm from 'components/link/button_add_form'
import LinkButtonList from 'components/link/button_list'
import LinkIconList from 'components/link/icon_list'
import IconAddForm from 'components/link/icon_add_form'
import PreviewPage from 'components/preview/page'
import PrefixInput from 'components/form/prefix_input'
import Textarea from 'components/form/textarea'

import ThemeSelect from 'components/form/theme_select'

import {initPage} from 'helper/init'

import { denormalize } from 'normalizr';
import { userSchema,linkListSchema } from 'redux/schema/index'

import {setGlobalModal} from 'redux/reducer/setting'
import {loadProfile,setProfile} from 'redux/reducer/profile'
import {addLink,deleteLink,updateLink,loadLink,loadLinkList,addLinkInList,removeLink,setLinkList,sortLink} from 'redux/reducer/link'

import {XIcon} from '@heroicons/react/outline'

import { moveItem } from 'helper/immutable';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import {notMoreThen,notLessThen} from 'helper/translate'
import {withTranslate} from 'hocs/index'
import { getConfig } from 'helper/config';


@withTranslate
class Settting extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            show_add_icon_form : false,
            show_add_link_form : false,
            show_preview : true,
            remove_preview : false
        }
        this.formRef = React.createRef();
    }
    componentDidMount() {
        const {profile,login_user} = this.props;

        if (login_user) {
            this.props.loadProfile(login_user.get('user_id'));
            this.loadLinkList();
        }

        if (this.formRef.current && login_user && login_user.get('profile')) {
            let profile = login_user.get('profile');
            this.setForm(profile);
        }
        
    }

    componentDidUpdate(prevProps) {
        if (this.props.login_user && !this.props.login_user.equals(prevProps.login_user) && this.props.login_user.get('profile')) {
            let profile = this.props.login_user.get('profile');
            this.setForm(profile);
        }
        if (this.props.login_user && !this.props.login_user.equals(prevProps.login_user)) {
            this.props.loadProfile(this.props.login_user.get('user_id'));
        }
    }

    setForm(profile) {

        if (!profile) {
            return;
        }
        let values = {
            'name'     : profile.get('name'),
            'theme'    : profile.get('theme'),
            'bio'      : profile.get('bio'),
            'unique_name' : profile.get('unique_name'),
        }
        if (this.formRef.current) {
            this.formRef.current.setValues(values);
        }else {
            setTimeout(()=>{
                this.setForm(values)
            },1000)
        }
    }
    @autobind
    updateProfile(values) {

        console.log('updateUser',values)

        this.setState({
            'is_updating' : true
        })

        var that = this;
        this.props.updateProfile(values).then(data=>{

            that.setState({
                'is_updating' : false
            })

        }).catch(error=>{

            that.setState({
                'is_updating' : false
            })

            if (error['status'] == 'error') {
                for (var i in error.messages) {
                    message.error(error.messages[i])
                }
            }else if (error.message) {
                message.error(error.message);
            }
        })
    }

    @autobind
    handleUploadAvatar(data) {
        this.updateProfile({
            'avatar_img_id' : data.data.img_id,
        })
    }

    @autobind 
    loadLinkList() {

        const {login_user} = this.props;

        if (!login_user) {
            return null;
        }

        let address = login_user.get('wallet_address');

        this.props.loadLinkList({
            'address'   : address,
            'show_type' : 'button'
        });

        this.props.loadLinkList({
            'address'   : address,
            'show_type' : 'icon'
        });
    }


    @autobind
    onButtonSortEnd(value) {
        const {oldIndex,newIndex} = value;
        const {button_ids,login_user} = this.props;

        if (oldIndex == newIndex) {
            return;
        }
        console.log('debug-onSortEnd',oldIndex,newIndex,button_ids.toJS());

        let new_list = moveItem(button_ids,oldIndex,newIndex);

        this.props.setLinkList(login_user.get('wallet_address'),'button',new_list.toJS())

        ///把数据同步到网站上
        this.props.sortLink(new_list.toJS());
    }
    

    @autobind
    onIconSortEnd(value) {
        const {oldIndex,newIndex} = value;
        const {icon_ids,login_user} = this.props;

        if (oldIndex == newIndex) {
            return;
        }
        // console.log('debug-onSortEnd',oldIndex,newIndex,icon_ids.toJS());

        let new_list = moveItem(icon_ids,oldIndex,newIndex);

        this.props.setLinkList(login_user.get('wallet_address'),'icon',new_list.toJS())

        ///把数据同步到网站上
        this.props.sortLink(new_list.toJS());
    }

    @autobind
    togglePreview() {
        const {show_preview} = this.state;
        
        if (show_preview) {
            this.setState({
                'show_preview' : !show_preview
            })
            setTimeout(()=>{
                this.setState({
                    'remove_preview' : true
                });
            },500)
        }else {
            this.setState({
                'remove_preview' : false,
                'show_preview'   : !show_preview
            })
        }
    }

    render() {

        const {icon_list,login_user,button_list} = this.props;
        const {show_add_icon_form,show_add_link_form,show_preview,remove_preview} = this.state;
        const {t} = this.props.i18n;

            // console.log('debug-formRef',this.formRef);


        const userFormSchema = Yup.object().shape({
            name    : Yup.string().min(2).max(64),
            bio     : Yup.string().min(2).max(64),
        });

        if (this.formRef.current) {
            console.log('this.formRef.current.values',this.formRef.current.values)
        }

        let url;
        if (login_user.getIn(['profile','unique_name'])) {
            url = getConfig('WEBSITE') + '/' +login_user.getIn(['profile','unique_name']);
        }else {
            url = getConfig('WEBSITE') + '/' +login_user.get('wallet_address')
        }
 
        return <div>

                <div className="flex-grow -mt-4 -mx-4 px-6 py-4 mb-4 flex justify-between items-center bg-gray-200 dark:bg-gray-700">
                    <div className="flex justify-start items-center">
                        <div className="h1">{t('setting')}</div>
                    </div> 
                </div>

                {
                    (login_user)
                    ?  <div>

                        <div className='grid grid-cols-1 md:grid-cols-setting gap-4'>
                            <div>
                                
                                    <Formik
                                        innerRef={this.formRef}
                                        initialValues={{
                                            'name'    : '',
                                            'bio'     : ''
                                        }}
                                        validationSchema={userFormSchema}
                                        onSubmit={this.updateProfile}>
                                        {({ errors, touched }) => (
                                           
                                            <Form className="w-full">

                                            <div className="block-box p-4 md:p-6 mb-4">
                                                <h2 className='h2'>{t('avatar')}</h2>
                                                <AvatarSetting avatar={login_user.getIn(['profile','show_avatar'])} 
                                                    handleUpload={this.handleUploadAvatar} 
                                                    handleSetNft={this.updateProfile}/>
                                            </div>

                                            <div className="block-box p-4 md:p-6 mb-4">
                                                <h2 className='h2'>{t('basic infomation')}</h2>
                                                <Field name="name" label={t("name")} placeholder={t("name")} />
                                                <Textarea name="bio" label={t("bio")} placeholder={t("bio")} />
                                                <ThemeSelect name="theme" label={t('theme')} />
                                                <PrefixInput prefix={getConfig('WEBSITE')+'/'} 
                                                    name="unique_name" 
                                                    label={t("custom url name")} placeholder={t("name")} />

                                                <Field name="ens" 
                                                    label={'ENS(Ethereum Name Service)'} placeholder={t("ens")} />


                                                <div className="form-submit text-right mt-4">
                                                    <Button loading={this.state.is_fetching} className="btn btn-primary" type="submit">{t("submit")}</Button>
                                                </div>
                                            </div>

                                        </Form>
                                        )}
                                    </Formik>


                                    <div className="block-box p-4 md:p-6 mb-4">
                                        <h2 className='h2 mb-4'>{t('socail icons')}</h2>
                                        <LinkIconList 
                                            loadLink={this.props.loadLink}
                                            deleteLink={this.props.deleteLink}
                                            updateLink={this.props.updateLink}
                                            removeLink={this.props.removeLink}
                                            login_user={login_user}
                                            list={icon_list}
                                            onSortEnd={this.onIconSortEnd} 
                                            useDragHandle
                                        />
                                        <div className='text-center py-4 md:py-12'>
                                            <Button className="btn btn-primary" onClick={()=>{this.setState({'show_add_icon_form':true})}}>{t("add icon")}</Button>
                                        </div>
                                        {
                                            (show_add_icon_form)
                                            ? <IconAddForm show={show_add_icon_form}
                                                addLink={this.props.addLink}
                                                addLinkInList={this.props.addLinkInList}
                                                closeModal={()=>{this.setState({'show_add_icon_form':false})}}
                                                login_user={login_user}
                                            />
                                            : null
                                        }
                                    </div>


                                    <div className="block-box p-4 md:p-6">
                                        <h2 className='h2'>{t('links')}</h2>
                                        <div className="form-submit text-center mt-4"></div>
                                        <LinkButtonList 
                                            loadLink={this.props.loadLink}
                                            deleteLink={this.props.deleteLink}
                                            updateLink={this.props.updateLink}
                                            removeLink={this.props.removeLink}
                                            login_user={login_user}
                                            list={button_list}
                                            onSortEnd={this.onButtonSortEnd} 
                                            useDragHandle
                                        />
                                        {
                                            (show_add_link_form)
                                            ? <LinkAddForm addLink={this.props.addLink}
                                                addLinkInList={this.props.addLinkInList}
                                                login_user={login_user}/>
                                            : <div className='text-center py-4 md:py-12'>
                                                <Button className="btn btn-primary" onClick={()=>{this.setState({'show_add_link_form':true})}}>{t("add new link")}</Button>
                                            </div>
                                        }
                                        
                                        
                                        
                                    </div>



                            </div>
                            <div className=''>
                                {
                                    (remove_preview)
                                    ? null 
                                    : <div className={classNames('site-theme-default shadow-xl rounded-lg border border-gray-300 overflow-hidden bg-white fixed top-20 preview-width md:w-96 animate-forwards',{'animate-fade-in':show_preview},{'animate-fade-out':!show_preview})}>
                                        <div className='flex justify-between  items-center bg-white border-b-2 border-gray-800 p-4 py-3 text-gray-700 text-sm font-ubuntu'>
                                            <div className='text-ellipsis overflow-hidden'>{url}</div>
                                            <CopyToClipboard  text={url}
                                                onCopy={() => {
                                                    message.success('copy successful');
                                                }}>
                                                <a className="btn btn-primary whitespace-nowrap">{t('copy')}</a>
                                            </CopyToClipboard>
                                        </div>
                                        <div className='preview-wapper'>
                                        <PreviewPage 
                                            theme={(this.formRef.current) ? this.formRef.current.values.theme : 'theme-01'}
                                            login_user={login_user} 
                                            button_list={button_list}
                                            icon_list={icon_list}
                                            form_values={(this.formRef.current) ? this.formRef.current.values : {'bio':'','name':''}} />
                                        </div>
                                    </div>
                                }
                               


                                <div className='fixed bottom-8 left-0 right-0 w-full flex justify-center md:hidden'>
                                    <a className='rounded-full bg-yellow-200 px-4 py-2 font-bold shadow-lg' onClick={this.togglePreview}>{!show_preview?<>{t('preview')}</>:<XIcon className='w-8 h-8' />}</a>
                                </div>
                            </div>
                        </div>

                    </div>
                    : <>
                    <div className="h-full flex flex-col items-center justify-center h-96 text-center">
                        <button onClick={this.props.setGlobalModal.bind({},'connect')} className="btn btn-primary btn-lg">{t('connect wallet')}</button>
                    </div>
                    </>
                }


            </div>
    }

    
}

Settting.getInitialProps =  wrapper.getInitialPageProps((store) => async ({pathname, req, res,query}) => {
    if (req && req.cookies) {
        await initPage('login_user',{},store.dispatch,req.cookies);
    }
    return {
    };
});

const mapDispatchToProps = (dispatch) => {
     return {
        'setGlobalModal' : (name) => {
            return dispatch(setGlobalModal(name))
        },
        'loadProfile'   : (user_id) => {
            return dispatch(loadProfile(user_id))
        },
        'updateProfile' : (data) => {
            return dispatch(setProfile(data))
        },
        'loadLinkList' : (cond) => {
            return dispatch(loadLinkList(cond))
        },
        'updateLink' : (data) => {
            return dispatch(updateLink(data))
        },
        'deleteLink' : (link_id) => {
            return dispatch(deleteLink(link_id))
        },
        'loadLink'   : (link_id) => {
            return dispatch(loadLink(link_id))
        },
        'addLink' : (data) => {
            return dispatch(addLink(data))
        },
        'addLinkInList' : (address,list_name,id) => {
            return dispatch(addLinkInList(address,list_name,id))
        },
        'setLinkList'   : (address,list_name,list) => {
            return dispatch(setLinkList(address,list_name,list))
        },
        'removeLink' : (address,id) => {
            return dispatch(removeLink(address,id))
        },
        'sortLink' : (ids) => {
            return dispatch(sortLink(ids))
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

    let list_is_fetching = false;
    let list_is_fetched = false;

    let button_ids = [];
    let icon_ids = [];
    

    if (login_user) {
        list_is_fetching = state.getIn(['link','list',login_user.get('wallet_address'),'is_fethcing'])
        list_is_fetched = state.getIn(['link','list',login_user.get('wallet_address'),'is_fetched'])
        button_ids = state.getIn(['link','list',login_user.get('wallet_address'),'button','list']);
        icon_ids = state.getIn(['link','list',login_user.get('wallet_address'),'icon','list']);
    }

    let button_list = denormalize(button_ids,linkListSchema,entities)
    let icon_list = denormalize(icon_ids,linkListSchema,entities)

    // console.log('button_list',button_list,button_ids)

    return {
        'login_user' : login_user,
        'list_is_fetching' : list_is_fetching,
        'list_is_fetched'  : list_is_fetched,
        'button_list' : button_list,
        'icon_list' : icon_list,
        'button_ids' : button_ids,
        'icon_ids' : icon_ids
    }
}

export default connect(mapStateToProps,mapDispatchToProps)(Settting)

