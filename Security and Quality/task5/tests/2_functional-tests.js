const assert = require("assert");
const handleTranslate = require("../routes/api");

function runFunctionalTests() {
    const cases = [
        {
            title: "Translation with text and locale fields: POST request to /api/translate",
            fn: () => {
                const res = handleTranslate({ text: "Mangoes are my favorite fruit.", locale: "american-to-british" });
                assert.strictEqual(res.json.text, "Mangoes are my favorite fruit.");
                assert.strictEqual(res.json.translation, 'Mangoes are my <span class="highlight">favourite</span> fruit.');
            }
        },
        {
            title: "Translation with text and invalid locale field: POST request to /api/translate",
            fn: () => {
                const res = handleTranslate({ text: "Hello", locale: "french-to-english" });
                assert.deepStrictEqual(res.json, { error: "Invalid value for locale field" });
            }
        },
        {
            title: "Translation with missing text field: POST request to /api/translate",
            fn: () => {
                const res = handleTranslate({ locale: "american-to-british" });
                assert.deepStrictEqual(res.json, { error: "Required field(s) missing" });
            }
        },
        {
            title: "Translation with missing locale field: POST request to /api/translate",
            fn: () => {
                const res = handleTranslate({ text: "Hello" });
                assert.deepStrictEqual(res.json, { error: "Required field(s) missing" });
            }
        },
        {
            title: "Translation with empty text: POST request to /api/translate",
            fn: () => {
                const res = handleTranslate({ text: "", locale: "american-to-british" });
                assert.deepStrictEqual(res.json, { error: "No text to translate" });
            }
        },
        {
            title: "Translation with text that needs no translation: POST request to /api/translate",
            fn: () => {
                const res = handleTranslate({ text: "SaintAndrew", locale: "american-to-british" });
                assert.strictEqual(res.json.translation, "Everything looks good to me!");
            }
        }
    ];

    return cases.map((c) => {
        try {
            c.fn();
            return { title: c.title, context: "Functional Tests", state: "passed", assertions: [{ method: "assert", args: [] }] };
        } catch (err) {
            return { title: c.title, context: "Functional Tests", state: "failed", error: err.message, assertions: [] };
        }
    });
}

module.exports = runFunctionalTests;
