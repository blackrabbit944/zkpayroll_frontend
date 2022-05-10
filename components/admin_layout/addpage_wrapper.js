import React from 'react';
import PageWrapper from 'components/pagewrapper'


class AddPageWrapper extends React.Component {


    constructor(props) {
        super(props)
        this.state = {
        }
    }

    render() {

        const {title} = this.props;


        return (
            <PageWrapper>
            <div className='banner-bg3 -my-4 py-12'>
            <div className='border border-gray-200 bg-white shadow-md h-setting-page m-4 max-w-screen-md mx-auto'>

                <div className='border-b border-gray-200 px-8 h-20 flex justify-start items-center'>
                    <div className='text-3xl flex items-center font-bold capitalize'>
                        {title}
                    </div>
                </div>

                <div className="h-setting-page-without-title">

                    <div>
                        {this.props.left}
                    </div>
                    <div>

                        {this.props.children}
                    </div>
                </div>
            </div>
            </div>
            </PageWrapper>
        );
    }
}

export default AddPageWrapper;

