const assert = require("assert");
const handleConvert = require("../routes/api");

function runFunctionalTests() {
    const cases = [
        {
            title: "Convert a valid input such as 10L: GET request to /api/convert",
            fn: () => {
                const res = handleConvert("10L");
                assert.strictEqual(res.json.initNum, 10);
                assert.strictEqual(res.json.initUnit, "L");
                assert.strictEqual(res.json.returnNum, 2.64172);
                assert.strictEqual(res.json.returnUnit, "gal");
            }
        },
        {
            title: "Convert an invalid input such as 32g: GET request to /api/convert",
            fn: () => {
                const res = handleConvert("32g");
                assert.strictEqual(res.text, "invalid unit");
            }
        },
        {
            title: "Convert an invalid number such as 3/7.2/4kg: GET request to /api/convert",
            fn: () => {
                const res = handleConvert("3/7.2/4kg");
                assert.strictEqual(res.text, "invalid number");
            }
        },
        {
            title: "Convert an invalid number AND unit such as 3/7.2/4kilomegagram: GET request to /api/convert",
            fn: () => {
                const res = handleConvert("3/7.2/4kilomegagram");
                assert.strictEqual(res.text, "invalid number and unit");
            }
        },
        {
            title: "Convert with no number such as kg: GET request to /api/convert",
            fn: () => {
                const res = handleConvert("kg");
                assert.strictEqual(res.json.initNum, 1);
                assert.strictEqual(res.json.initUnit, "kg");
                assert.strictEqual(res.json.returnNum, 2.20462);
                assert.strictEqual(res.json.returnUnit, "lbs");
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
