import React from 'react';
import { connect } from 'react-redux';
import ProdType from './ProdType.js';
import ProbType from './ProbType.js';
import ProbURL from './ProbURL.js';
import AppConfig from './AppConfig.js';
import Screenshots from './Screenshots.js';
import Comments from './Comments.js';
import SubmitAndCaptcha from './Submit.js';
import Result from './Result.js';


function Pages(props) {
    switch(props.currentPage) {
        case 0:
            return (<ProdType/>);
        case 1:
            return (<ProbType/>);
        case 2:
            return (<ProbURL/>);
        case 3:
            return (<AppConfig/>);
        case 4:
            return (<Screenshots/>);
        case 5:
            return (<Comments/>);
        case 6:
            return (<SubmitAndCaptcha />);
        case 7:
            return (<Result />);
        default:
            return null;
    }
}

export default connect(state => ({currentPage: state.currentPage}))(Pages);
