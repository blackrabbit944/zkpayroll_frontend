import React from 'react';

import {wrapper} from 'redux/store';
import { connect } from "react-redux";
import autobind from 'autobind-decorator'
import Field from 'components/form/field'
import Button from 'components/common/button'
import Modal from 'components/common/modal'
import TokenSelect from 'components/form/token_select'

import FormObserver from 'components/form/observer';
import Immutable from 'immutable'

import { Formik, Form } from 'formik';
import * as Yup from 'yup';

import message from 'components/common/message'

import {initPage} from 'helper/init'
import { withRouter } from 'next/router'

import {withTranslate,withMustLogin} from 'hocs/index'
import { denormalize } from 'normalizr';
import { userSchema } from 'redux/schema/index'

import {addSalary,updateSalary} from 'redux/reducer/salary'


@withTranslate
@withMustLogin
@withRouter
class SalaryAdd extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            salary          : null,
            is_adding       : false
        }
        this.formRef = React.createRef();
    }
    static getDerivedStateFromProps(props, state) {
        if (props.salary) {
            return {
                'salary' : props.salary
            }
        }else {
            return {
                'salary' : null
            }
        }
    }

    componentDidMount() {
        if (this.props.salary) {
            console.log('debug:update:didmount检查到salary')
            this.setForm(this.props.salary)
        }else {
            console.log('debug:update没有检查到salary');
        }
    }

    componentDidUpdate(prevProps,preState) {
        if (this.state.salary !== preState.salary) {
            this.setForm(this.state.salary);
        }
    }

    @autobind
    setForm(salary = null) {
        console.log("debug:update:setForm",salary)
        if (!salary) {
            this.formRef.current.setValues({
                'name'              : '',
                'address'           : '',
                'amount'            : '',
                'contract_address'  : '',
            })
        }else {
            this.formRef.current.setValues({
                'name'              : salary.get('name'),
                'address'           : salary.get('address'),
                'amount'            : salary.get('amount'),
                'contract_address'  : salary.get('contract_address'),
            })
        }
    }

    @autobind
    saveSalary(values) {
        const {salary} = this.props;
        console.log('values',values)

        this.setState({
            'is_adding' : true
        });

        var that = this;

        let savefunction = null;
        if (salary) {
            savefunction = this.props.updateSalary(salary.get('id'),values)
        }else {
            savefunction = this.props.addSalary(values)
        }
        savefunction.then(data=>{
            console.log('result',data);
            that.setState({
                'is_adding' : false
            })
            if (data.status == 'success') {
                ///清空数据
                if (!salary) {
                    this.formRef.current.resetForm();

                    ///关闭弹窗
                    this.props.closeModal();
                }

                if (this.props.refreshList && !salary) {
                    this.props.refreshList();
                }

            }else {
                Object.keys(data.messages).map(key=>{
                    this.formRef.current.setFieldError(key,data.messages[key].join(','));
                })
            }
        }).catch(error=>{
            that.setState({
                'is_adding' : false
            })
        })
    }


    render() {
        const {is_adding} = this.state;
        const {visible,salary} = this.props;
        const {t} = this.props.i18n;

        const salaryFormSchema = Yup.object().shape({
            name    : Yup.string().min(2).max(64).required(),
            address     : Yup.string().min(42).max(42).required(),
            amount      : Yup.number().required(),
            contract_address      : Yup.string().min(42).max(42).required()
        });

        let init_data = {
            'name'              : '',
            'address'           : '',
            'amount'            : '',
            'contract_address'  : '',
        }


        return  <Modal
                    width={650}
                    title={null}
                    visible={visible} 
                    footer={null}
                    onClose={this.props.closeModal}>

                    <Formik
                        innerRef={this.formRef}
                        initialValues={init_data}
                        validationSchema={salaryFormSchema}
                        onSubmit={this.saveSalary}>
                        {({ errors, touched }) => (
                            
                            <Form className="w-full">
                            
                            <FormObserver onChange={this.handleFormChange}/>

                            <div className="p-4 md:p-6">
                                <h2 className='h2 mb-4'>{
                                    this.state.salary
                                    ? t('update employee salary')
                                    : t('add employee salary')
                                }</h2>
                                <Field name="name" label={t("employee name")} placeholder={t("employee name")} />
                                <Field name="address" label={t("wallet address")} placeholder={t("ETH wallet address")} />

                                <Field name="amount" label={t("amount")} placeholder={t("amount")} />
                                <TokenSelect name="contract_address" label={t("token")}/>                                
                                <div className='border-t border-gray-300 my-4' />
                                <div className="form-submit flex justify-end mt-4">
                                    <Button loading={is_adding} className="btn btn-primary" type="submit">{t("submit")}</Button>
                                </div>

                            </div>

                        </Form>
                        )}
                    </Formik>
                </Modal>
    }

    
}

const mapDispatchToProps = (dispatch) => {
     return {
        addSalary : (data) => {
            return dispatch(addSalary(data))
        },
        updateSalary : (id,data) => {
            return dispatch(updateSalary(id,data))
        },
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
        'login_user' : login_user,
    }
}

export default connect(mapStateToProps,mapDispatchToProps)(SalaryAdd)

