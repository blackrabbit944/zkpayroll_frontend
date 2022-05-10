import {wrapper,makeStore} from '../redux/store';
import App, {Container} from "next/app";
import {Suspense} from 'react';

import PageWrapper from 'components/pagewrapper'

import * as gtag from 'helper/gtag'
import Router from 'next/router'
import {getConfig} from 'helper/config'
// import Recaptcha from "components/common/recaptchav3"
require("styles/globals.css");

Router.events.on('routeChangeComplete', url => gtag.pageview(url))
class MyApp extends App {
    
    // static getInitialProps = async ({Component, ctx}) => {
    //     return {
    //         pageProps: {
    //             // Call page-level getInitialProps
    //             ...(Component.getInitialProps ? await Component.getInitialProps(ctx) : {}),
    //             // Some custom thing for all pages
    //             pathname: ctx.pathname,
    //         },
    //     };
    // };
    
    constructor(props) {
        super(props)
        this.state = {
        }
    }



    render() {
        const {Component, pageProps} = this.props;

        const isServer = (typeof window === 'undefined');

        // console.log('isServer',isServer);
        //<Recaptcha></Recaptcha>
        return  <Component {...pageProps} />
        
    }
}

MyApp.getInitialProps = async (appContext) => {

    // console.log('appContext',appContext)
    const {req} = appContext;

    // calls page's `getInitialProps` and fills `appProps.pageProps`
    const appProps = await App.getInitialProps(appContext);

    ///关于中国地区的关停
    if (getConfig('FORBIDDEN_CHINA')) {
        if (req && req.headers['cf-ipcountry'] == 'CN') {
            appProps['errorCode'] = 403;
            appProps['errorMessage'] = '由于你所在的地区限制，禁止访问';
        }
    }

    // console.log('unlogin',getConfig('FORBIDDEN_UNLOGIN'));
    // if (getConfig('FORBIDDEN_UNLOGIN')) {
    //     if (!isUnloginAllowedPage(appContext.router.route)) {
    //         appProps['errorCode'] = 401;
    //     }
    // }

    return {
        ...appProps
    }
};

export default wrapper.withRedux(MyApp)
