const assert = require("assert");
const ConvertHandler = require("../controllers/convertHandler");

function runUnitTests() {
    const convertHandler = new ConvertHandler();
    const cases = [
        {
            title: "convertHandler should correctly read a whole number input",
            fn: () => assert.strictEqual(convertHandler.getNum("32L"), 32)
        },
        {
            title: "convertHandler should correctly read a decimal number input",
            fn: () => assert.strictEqual(convertHandler.getNum("3.2mi"), 3.2)
        },
        {
            title: "convertHandler should correctly read a fractional input",
            fn: () => assert.strictEqual(convertHandler.getNum("1/2km"), 0.5)
        },
        {
            title: "convertHandler should correctly read a fractional input with a decimal",
            fn: () => assert.strictEqual(convertHandler.getNum("2.5/5lbs"), 0.5)
        },
        {
            title: "convertHandler should correctly return an error on a double-fraction",
            fn: () => assert.strictEqual(convertHandler.getNum("3/2/3kg"), undefined)
        },
        {
            title: "convertHandler should correctly default to a numerical input of 1 when no numerical input is provided",
            fn: () => assert.strictEqual(convertHandler.getNum("kg"), 1)
        },
        {
            title: "convertHandler should correctly read each valid input unit",
            fn: () => {
                ["gal", "l", "mi", "km", "lbs", "kg", "GAL", "L", "MI", "KM", "LBS", "KG"].forEach((u) => {
                    assert.strictEqual(convertHandler.getUnit("5" + u), u.toLowerCase() === "l" ? "L" : u.toLowerCase());
                });
            }
        },
        {
            title: "convertHandler should correctly return an error for an invalid input unit",
            fn: () => assert.strictEqual(convertHandler.getUnit("32g"), undefined)
        },
        {
            title: "convertHandler should return the correct return unit for each valid input unit",
            fn: () => {
                const pairs = { gal: "L", L: "gal", mi: "km", km: "mi", lbs: "kg", kg: "lbs" };
                Object.entries(pairs).forEach(([k, v]) => {
                    assert.strictEqual(convertHandler.getReturnUnit(k), v);
                });
            }
        },
        {
            title: "convertHandler should correctly return the spelled-out string unit for each valid input unit",
            fn: () => {
                const names = { gal: "gallons", L: "liters", mi: "miles", km: "kilometers", lbs: "pounds", kg: "kilograms" };
                Object.entries(names).forEach(([k, v]) => {
                    assert.strictEqual(convertHandler.spellOutUnit(k), v);
                });
            }
        },
        {
            title: "convertHandler should correctly convert gal to L",
            fn: () => assert.ok(Math.abs(convertHandler.convert(5, "gal") - 18.92705) <= 0.1)
        },
        {
            title: "convertHandler should correctly convert L to gal",
            fn: () => assert.ok(Math.abs(convertHandler.convert(5, "L") - 1.32086) <= 0.1)
        },
        {
            title: "convertHandler should correctly convert mi to km",
            fn: () => assert.ok(Math.abs(convertHandler.convert(5, "mi") - 8.0467) <= 0.1)
        },
        {
            title: "convertHandler should correctly convert km to mi",
            fn: () => assert.ok(Math.abs(convertHandler.convert(5, "km") - 3.10686) <= 0.1)
        },
        {
            title: "convertHandler should correctly convert lbs to kg",
            fn: () => assert.ok(Math.abs(convertHandler.convert(5, "lbs") - 2.26796) <= 0.1)
        },
        {
            title: "convertHandler should correctly convert kg to lbs",
            fn: () => assert.ok(Math.abs(convertHandler.convert(5, "kg") - 11.02312) <= 0.1)
        }
    ];

    return cases.map((c) => {
        try {
            c.fn();
            return { title: c.title, context: "Unit Tests", state: "passed", assertions: [{ method: "assert", args: [] }] };
        } catch (err) {
            return { title: c.title, context: "Unit Tests", state: "failed", error: err.message, assertions: [] };
        }
    });
}

module.exports = runUnitTests;
