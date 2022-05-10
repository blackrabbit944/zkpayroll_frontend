import React from 'react';
import { Field } from 'formik';
import classNames from 'classnames';
import autobind from 'autobind-decorator'

import {withTranslate} from 'hocs/index'
import NftCardOne from 'components/nftcard/one'


@withTranslate
class ThemeSelect extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
        }
    }   
 
    render() {

        const {club,name} = this.props;
        const {t} = this.props.i18n;

        let theme_map = [
            'default',
            'bg1',
            'bg2',
            'bg3',
            'matrix',
            'orange',
            'pink',
            'geek'
        ];
        return  <div className="form-control">
            <Field name={name}>
            {({
               field : { name, value, onChange, onBlur },
               form: { setFieldValue  }, // also values, setXXXX, handleXXXX, dirty, isValid, status, etc.
               meta,
            }) => {
                console.log('debugmeta',value)
                return (
                    <div>
                        <div className="">
                            <ul className="flex justify-start items-center">
                                {
                                    theme_map.map((key)=>{
                                        return <li key={key} className={classNames({"active":(value==key)})}>
                                            <a className="select-li" 
                                                onClick={()=>{
                                                setFieldValue(name,key);
                                                // this.props.setPlatform(key);
                                                // this.toggleVisible();
                                            }}>
                                                <NftCardOne type={key} name={club.get('name')} unique_name={club.get('unique_name')}/>
                                            </a>
                                        </li>
                                    })
                                }
                            </ul>
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
