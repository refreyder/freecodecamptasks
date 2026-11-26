const Translator = require("../components/translator");

const translator = new Translator();

function handleTranslate(body) {
    if (!body || body.text === undefined || body.locale === undefined) {
        return { status: 200, json: { error: "Required field(s) missing" } };
    }

    const { text, locale } = body;

    if (text === "") {
        return { status: 200, json: { error: "No text to translate" } };
    }

    if (locale !== "american-to-british" && locale !== "british-to-american") {
        return { status: 200, json: { error: "Invalid value for locale field" } };
    }

    const translation = translator.translate(text, locale);
    return {
        status: 200,
        json: { text, translation }
    };
}

module.exports = handleTranslate;
