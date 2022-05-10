import React from 'react';
import { Field } from 'formik';
import Dropdown from 'rc-dropdown';
import autobind from 'autobind-decorator'

import classNames from 'classnames';
import {withTranslate} from 'hocs/index'

import {getSocialMediaIcon} from 'helper/link';

@withTranslate
class ThemeSelect extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            'dropdown_visible' : false,
        }
        
        
    }   
 

    @autobind
    toggleVisible() {
        this.setState({ dropdown_visible : !this.state.dropdown_visible });
    }

    render() {

        const {label,name} = this.props;
        const {dropdown_visible} = this.state;
        const {t} = this.props.i18n;

        let theme_map = {
            'theme-00'  :  'default',
            'theme-01'  :  'yellow',
            'theme-02'  :  'geek',
            'theme-03'  :  'pink',
            'theme-04'  :  'black&white',
            'theme-05'  :  'matrix',
            'theme-06'  :  'black',
        }

        return  <div className="form-control">
            <label className="label">
              <span className="label-text">{label}</span>
            </label>
            <Field name={name}>
            {({
               field : { name, value, onChange, onBlur },
               form: { setFieldValue  }, // also values, setXXXX, handleXXXX, dirty, isValid, status, etc.
               meta,
            }) => {
                console.log('debugmeta',value)
                let menu = <div className="block-menu jd-border">
                    <ul className="overflow-y-scroll">
                        {
                            Object.keys(theme_map).map((key)=>{
                                let v = theme_map[key];
                                return <li key={key} >
                                    <a className="select-li" 
                                        onClick={()=>{
                                        setFieldValue(name,key);
                                        // this.props.setPlatform(key);
                                        this.toggleVisible();
                                    }}>
                                    <span className='name'>
                                    {
                                        v
                                    }
                                    </span>
                                    </a>
                                </li>
                            })
                        }
                    </ul>
                </div>
                return (
                    <div>
                        <div>
                            <Dropdown
                                overlay={menu} visible={dropdown_visible}
                               >
                                <div onClick={this.toggleVisible} className="jd-select jd-select-arrow">
                                {
                                    (value)
                                    ? <div className="select-li">
                                        <span className='name'>
                                        {theme_map[value]}
                                        </span>
                                    </div>
                                    : <span className="select-li">{t('please select')}</span>
                                }
                                </div>
                            </Dropdown>
                        </div>
                        {meta.touched && meta.error && (
                           <div className="input-error-msg">{meta.error}</div>
                        )}
                    </div>
                )}
            }
           </Field> 
        </div>
    }
}




module.exports = ThemeSelect
