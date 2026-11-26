const assert = require("assert");
const SudokuSolver = require("../controllers/sudoku-solver");
const { puzzlesAndSolutions } = require("../controllers/puzzle-strings");

function runUnitTests() {
    const solver = new SudokuSolver();
    const validPuzzle = puzzlesAndSolutions[0][0];
    const expectedSolution = puzzlesAndSolutions[0][1];

    const cases = [
        {
            title: "Logic handles a valid puzzle string of 81 characters",
            fn: () => assert.deepStrictEqual(solver.validate(validPuzzle), { valid: true })
        },
        {
            title: "Logic handles a puzzle string with invalid characters (not 1-9 or .)",
            fn: () => {
                const invalid = validPuzzle.slice(0, 80) + "a";
                assert.deepStrictEqual(solver.validate(invalid), { error: "Invalid characters in puzzle" });
            }
        },
        {
            title: "Logic handles a puzzle string that is not 81 characters in length",
            fn: () => {
                assert.deepStrictEqual(solver.validate("12345"), { error: "Expected puzzle to be 81 characters long" });
            }
        },
        {
            title: "Logic handles a valid row placement",
            fn: () => assert.strictEqual(solver.checkRowPlacement(validPuzzle, 0, 1, "3"), true)
        },
        {
            title: "Logic handles an invalid row placement",
            fn: () => assert.strictEqual(solver.checkRowPlacement(validPuzzle, 0, 1, "5"), false)
        },
        {
            title: "Logic handles a valid column placement",
            fn: () => assert.strictEqual(solver.checkColPlacement(validPuzzle, 0, 1, "3"), true)
        },
        {
            title: "Logic handles an invalid column placement",
            fn: () => assert.strictEqual(solver.checkColPlacement(validPuzzle, 0, 1, "6"), false)
        },
        {
            title: "Logic handles a valid region (3x3 grid) placement",
            fn: () => assert.strictEqual(solver.checkRegionPlacement(validPuzzle, 0, 1, "3"), true)
        },
        {
            title: "Logic handles an invalid region (3x3 grid) placement",
            fn: () => assert.strictEqual(solver.checkRegionPlacement(validPuzzle, 0, 1, "6"), false)
        },
        {
            title: "Valid puzzle strings pass the solver",
            fn: () => assert.strictEqual(solver.solve(validPuzzle), expectedSolution)
        },
        {
            title: "Invalid puzzle strings fail the solver",
            fn: () => {
                const invalid = "11" + validPuzzle.slice(2);
                assert.strictEqual(solver.solve(invalid), false);
            }
        },
        {
            title: "Solver returns the expected solution for an incomplete puzzle",
            fn: () => {
                puzzlesAndSolutions.forEach(([puzzle, solution]) => {
                    assert.strictEqual(solver.solve(puzzle), solution);
                });
            }
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
