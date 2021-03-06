import Translator from 'bazinga-translator';
import initialize_input_options from './input-options';

export let translator;
export let onTranslationLoad = [initialize_input_options];

const xhr = new XMLHttpRequest();
xhr.open('GET', window.translations_url);
xhr.onload = () => {
    if (xhr.status >= 200 && xhr.status < 300) {
        Translator.locale = window.translation_locale;
        translator = Translator.fromJSON(xhr.response);
        onTranslationLoad.forEach((cb) => { cb(); });
    }
};
xhr.onerror = () => {/* some error handling */};
xhr.send();
