const SudokuSolver = require("../controllers/sudoku-solver");

const solver = new SudokuSolver();

function handleSolve(body) {
    const puzzle = body && body.puzzle;
    if (!puzzle) {
        return { status: 200, json: { error: "Required field missing" } };
    }
    const validation = solver.validate(puzzle);
    if (validation.error) {
        return { status: 200, json: validation };
    }
    const solution = solver.solve(puzzle);
    if (!solution) {
        return { status: 200, json: { error: "Puzzle cannot be solved" } };
    }
    return { status: 200, json: { solution } };
}

function handleCheck(body) {
    const { puzzle, coordinate, value } = body || {};
    if (!puzzle || !coordinate || !value) {
        return { status: 200, json: { error: "Required field(s) missing" } };
    }
    const validation = solver.validate(puzzle);
    if (validation.error) {
        return { status: 200, json: validation };
    }
    if (!/^[A-Ia-i][1-9]$/.test(String(coordinate))) {
        return { status: 200, json: { error: "Invalid coordinate" } };
    }
    if (!/^[1-9]$/.test(String(value))) {
        return { status: 200, json: { error: "Invalid value" } };
    }

    const row = String(coordinate)[0].toUpperCase().charCodeAt(0) - 65;
    const col = Number(String(coordinate)[1]) - 1;
    const val = String(value);

    const conflict = [];
    if (!solver.checkRowPlacement(puzzle, row, col, val)) {
        conflict.push("row");
    }
    if (!solver.checkColPlacement(puzzle, row, col, val)) {
        conflict.push("column");
    }
    if (!solver.checkRegionPlacement(puzzle, row, col, val)) {
        conflict.push("region");
    }

    if (conflict.length > 0) {
        return { status: 200, json: { valid: false, conflict } };
    }
    return { status: 200, json: { valid: true } };
}

module.exports = { handleSolve, handleCheck };
