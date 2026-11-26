const assert = require("assert");
const { handleSolve, handleCheck } = require("../routes/api");
const { puzzlesAndSolutions } = require("../controllers/puzzle-strings");

function runFunctionalTests() {
    const validPuzzle = puzzlesAndSolutions[0][0];
    const expectedSolution = puzzlesAndSolutions[0][1];

    const cases = [
        {
            title: "Solve a puzzle with valid puzzle string: POST request to /api/solve",
            fn: () => assert.deepStrictEqual(handleSolve({ puzzle: validPuzzle }).json, { solution: expectedSolution })
        },
        {
            title: "Solve a puzzle with missing puzzle string: POST request to /api/solve",
            fn: () => assert.deepStrictEqual(handleSolve({}).json, { error: "Required field missing" })
        },
        {
            title: "Solve a puzzle with invalid characters: POST request to /api/solve",
            fn: () => {
                const res = handleSolve({ puzzle: validPuzzle.slice(0, 80) + "X" });
                assert.deepStrictEqual(res.json, { error: "Invalid characters in puzzle" });
            }
        },
        {
            title: "Solve a puzzle with incorrect length: POST request to /api/solve",
            fn: () => assert.deepStrictEqual(handleSolve({ puzzle: "12345" }).json, { error: "Expected puzzle to be 81 characters long" })
        },
        {
            title: "Solve a puzzle that cannot be solved: POST request to /api/solve",
            fn: () => {
                const res = handleSolve({ puzzle: "11" + validPuzzle.slice(2) });
                assert.deepStrictEqual(res.json, { error: "Puzzle cannot be solved" });
            }
        },
        {
            title: "Check a puzzle placement with all fields: POST request to /api/check",
            fn: () => {
                const res = handleCheck({ puzzle: validPuzzle, coordinate: "A2", value: "3" });
                assert.deepStrictEqual(res.json, { valid: true });
            }
        },
        {
            title: "Check a puzzle placement with single placement conflict: POST request to /api/check",
            fn: () => {
                const res = handleCheck({ puzzle: validPuzzle, coordinate: "A2", value: "8" });
                assert.deepStrictEqual(res.json, { valid: false, conflict: ["row"] });
            }
        },
        {
            title: "Check a puzzle placement with multiple placement conflicts: POST request to /api/check",
            fn: () => {
                const res = handleCheck({ puzzle: validPuzzle, coordinate: "A2", value: "6" });
                assert.deepStrictEqual(res.json, { valid: false, conflict: ["column", "region"] });
            }
        },
        {
            title: "Check a puzzle placement with all placement conflicts: POST request to /api/check",
            fn: () => {
                const res = handleCheck({ puzzle: validPuzzle, coordinate: "A2", value: "2" });
                assert.deepStrictEqual(res.json, { valid: false, conflict: ["row", "column", "region"] });
            }
        },
        {
            title: "Check a puzzle placement with missing required fields: POST request to /api/check",
            fn: () => {
                const res = handleCheck({ puzzle: validPuzzle, coordinate: "A2" });
                assert.deepStrictEqual(res.json, { error: "Required field(s) missing" });
            }
        },
        {
            title: "Check a puzzle placement with invalid characters: POST request to /api/check",
            fn: () => {
                const res = handleCheck({ puzzle: validPuzzle.slice(0, 80) + "X", coordinate: "A2", value: "3" });
                assert.deepStrictEqual(res.json, { error: "Invalid characters in puzzle" });
            }
        },
        {
            title: "Check a puzzle placement with incorrect length: POST request to /api/check",
            fn: () => {
                const res = handleCheck({ puzzle: "12345", coordinate: "A2", value: "3" });
                assert.deepStrictEqual(res.json, { error: "Expected puzzle to be 81 characters long" });
            }
        },
        {
            title: "Check a puzzle placement with invalid placement coordinate: POST request to /api/check",
            fn: () => {
                const res = handleCheck({ puzzle: validPuzzle, coordinate: "Z9", value: "3" });
                assert.deepStrictEqual(res.json, { error: "Invalid coordinate" });
            }
        },
        {
            title: "Check a puzzle placement with invalid placement value: POST request to /api/check",
            fn: () => {
                const res = handleCheck({ puzzle: validPuzzle, coordinate: "A2", value: "0" });
                assert.deepStrictEqual(res.json, { error: "Invalid value" });
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
