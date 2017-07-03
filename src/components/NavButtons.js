import React from 'react';
import { connect } from 'react-redux';
import { movePage } from '../dispatchers';

import store from '../reducers';
import { extractDomain } from '../utils/parse-url.js';
import { STEALTH_OPTIONS } from '../constants/input-options.js';


const PAGE_START = 0;
const PAGE_SUBMIT = 7;

function NavButtons(props) {
    let completed = props.completedPages[props.currentPage];
    const onNavBtnClick = (event) => {
        if (event.target.name == 'prev') {
            movePage(-1);
        } else if (event.target.name == 'next') {
            if (completed) {
                movePage(1);
            }
        }
    };
    const onSubmitBtnClick = () => {
            submit();
    };
    return (
        <div className="buttons">
            { props.currentPage > PAGE_START && <button type="button" className="button button--green" name="prev" onClick={onNavBtnClick}>Prev</button> }
            { props.currentPage < PAGE_SUBMIT && <button type="button" className="button button--green" name="next" disabled={!completed} onClick={onNavBtnClick}>Next</button> }
            { props.currentPage == PAGE_SUBMIT && <button type="button" className="button button--green" name="submit" disabled={process.env.NODE_ENV === 'production' ? !props.captchaResponse.validity : false} onClick={onSubmitBtnClick}>Submit</button> }
        </div>
    );
}

export default connect(
    state => ({
        currentPage: state.currentPage,
        completedPages: state.completedPages,
        captchaResponse: state.captchaResponse
    })
)(NavButtons);


const getIssueTitle = (state) => {
    return extractDomain(state.problemURL.value) + ' - ' + state.problemType.value;
};

const getIssueBody = (state) => {

    const NEW_LINE = '\n';
    const buf = [];

    // buf.push('[//]: # (***You can leave the strings with "[//]:" They will not be added to the issue text)');
    // buf.push('[//]: # (***Строки, которые начинаются с "[//]:" можно не удалять. Они не будут видны)');
    buf.push('');

    if (state.comments.validity) {
        buf.push('***Comment***: ' + state.comments.value);
    }

    buf.push('Screenshot: ');

    state.screenshotURLs.forEach((el, index) => {
        buf.push(`[${index}](${el})`);
    });
    buf.push('');

    buf.push('***System configuration***');
    buf.push('');
    buf.push('Information | value');
    buf.push('--- | ---');
    buf.push('Platform: | ' + state.productType.value);
    buf.push('Adguard version: | ' + state.productVersion.value);

    if (state.probOnWebOrApp == 'web') {
        let browserDetail = state.browserSelection.value == 'Other' ? state.browserDetail.value : state.browserSelection.value;

        if (state.productType.value == 'And' && state.isDataCompressionEnabled) {
            browserDetail += ' (with data compression enabled)';
        }
        buf.push('Browser: | ' + browserDetail);
    }

    if (state.productType.value == 'Win') {
        buf.push('Adguard driver: | ' + ( state.winWFPEnabled.value ? 'WFP' : 'TDI' ));

        if (state.winStealthEnabled.value) {
            let stealthOptions = [];

            STEALTH_OPTIONS.forEach((el, index) => {
                let option = state.winStealthOptions[index];
                let str = '';

                if (option.enabled) {
                    str += el.label;

                    if (el.type != 'Bool') {
                        str += `(${option.detail.value})`;
                    }

                    stealthOptions.push(str);
                }
            });
            buf.push('Stealth mode options: | ' + stealthOptions.join(','));
        }
    }

    if (state.productType.value == 'And') {
        buf.push('Adguard mode: | ' + state.androidFilteringMode.value);
        buf.push('Filtering quality: | ' + state.androidFilteringMethod.value);
    }

    if (state.productType.value == 'iOS') {
        buf.push('System wide filtering: | ' + ( state.iosSystemWideFilteringEnabled.value ? 'enabled' : 'disabled' ));
        buf.push('Simplified filters: | ' + ( state.iosSimplifiedFiltersEnabled.value ? 'enabled' : 'disabled' ));
        buf.push('Adguard DNS: | ' + state.iosDNS.value);
    }

    buf.push('Filters: | ' + state.selectedFilters.toString());

    return buf.join(NEW_LINE);
};

const getLabels = (state) => {
    let labels = [state.problemType.value];

    if (state.probOnWebOrApp.value == 'app') {
        labels.push('Android');
    }
};

function submit() {
    let state = store.getState();

    let xhr = new XMLHttpRequest();
    xhr.open('POST', window.report_url || '/submit.json');
    xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {

        } else { /* some err handling */ }
    };


    let issueData = new FormData();

    issueData.append('url', state.problemURL.value);
    issueData.append('text', getIssueBody(state));
    issueData.append('label', state.problemType.value);
    issueData.append('recaptcha', state.captchaResponse.value);

    xhr.onerror = () => { /* some err handling */ };
    xhr.send(issueData);
}
