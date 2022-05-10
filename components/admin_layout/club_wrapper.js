import React from 'react';
import { connect } from 'react-redux'
// import autobind from 'autobind-decorator'

import Loading from 'components/common/loading'

import PageWrapper from 'components/pagewrapper'
import { setActiveClub } from 'redux/reducer/setting';
import {getAvatarUrl} from 'helper/common'

import {DotsVerticalIcon} from '@heroicons/react/outline'
import Sider from 'components/club/sider';
import Link from 'next/link'
import {withTranslate,withLoginUser} from 'hocs/index'
import {BanIcon} from '@heroicons/react/outline'

@withLoginUser
@withTranslate
class ClubWrapper extends React.Component {


    constructor(props) {
        super(props)
        this.state = {
        }
    }

    componentDidMount() {
        if (this.props.club) {
            this.props.setActiveClub(this.props.club.get('id'))
        }
    }

    componentDidUpdate(prevProps,prevState) {
        if (this.props.club && !this.props.club.equals(prevProps.club)) {
            this.props.setActiveClub(this.props.club.get('id'))
        }
    }


    render() {

        const {club,title,login_user,club_id} = this.props;
        const {t} = this.props.i18n;

        console.log('debug02,club',club,club_id)

        if (club && login_user && club.get('user_id') != login_user.get('user_id')) {
            return  <PageWrapper>
            <div className='border border-gray-200 bg-white shadow-md h-setting-page m-4'>
                <div className='p-24'>
                    <div className='flex justify-center mb-12'>
                        <BanIcon className='text-red-500 w-24 h-24'/>
                    </div>
                    <div className='text-center text-xl font-bold text-black uppercase mb-4'>
                        {t('no permission to access this page')}
                    </div>
                    <div className='text-center text-base text-gray-600 '>
                        {t('check your login user to confirm that you are eligible to access this page')}
                    </div>
                </div>

            </div>
            </PageWrapper>
        }

        return (
            <PageWrapper>
            <div className='border border-gray-200 bg-white shadow-md h-setting-page m-4'>
                {
                    (club && !club.get('contract_address'))
                    ?  <div className='bg-yellow-100 p-4 flex justify-between items-center border-b border-gray-200'>
                        <div className='text-sm capitalize'>
                            <p className='text-black font-bold'>{t('waiting for NFT contract deploying')}</p>
                            <p className='text-gray-700'>{t('it may take 5 - 10 mins after you submit the deploying tx')}</p>
                        </div>
                        <Link href={"/club/"+club.get('id') +'/step3'}><a className='btn btn-primary'>{t('Redeployment contracts')}</a></Link>
                    </div>
                    : null
                }
                <div className='border-b border-gray-200 px-8 h-20 flex justify-start items-center'>{
                    (club)
                    ? <>
                        <Link href={"/club/"+club.get('id')}><a className='flex justify-start items-center'>
                        <img className='w-8 h-8 mr-4 rounded-full' src={getAvatarUrl(club)}/>
                        {club.get('name')}
                        </a></Link>
                        {
                            (title)
                            ? <div className='text-3xl flex items-center font-bold capitalize'>
                                <span className='text-gray-300 font-normal ml-4 mr-4'><DotsVerticalIcon className='w-6 h-6'/></span>
                                {title}
                            </div>
                            : null
                        }
                    </>
                    : <Loading />
                }
                </div>

              


                <div className="grid grid-cols-club divide-x-2 h-setting-page-without-title ">

                    <div>
                        <Sider club_id={club_id}/>
                    </div>
                    <div>

                        {this.props.children}
                    </div>
                </div>

            </div>

            </PageWrapper>
        );
    }
}


const mapDispatchToProps = (dispatch) => {
    return {
        setActiveClub : (club_id) => {
            return dispatch(setActiveClub(club_id))
        }
    }
}
function mapStateToProps(state,ownProps) {
    return {
    }
}


export default connect(mapStateToProps,mapDispatchToProps)(ClubWrapper);

