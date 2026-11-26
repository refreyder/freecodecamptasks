class SudokuSolver {
    validate(puzzleString) {
        if (!puzzleString) {
            return { error: "Required field missing" };
        }
        if (/[^1-9.]/.test(puzzleString)) {
            return { error: "Invalid characters in puzzle" };
        }
        if (puzzleString.length !== 81) {
            return { error: "Expected puzzle to be 81 characters long" };
        }
        return { valid: true };
    }

    checkRowPlacement(puzzleString, row, column, value) {
        const val = String(value);
        for (let c = 0; c < 9; c += 1) {
            if (c !== column && puzzleString[row * 9 + c] === val) {
                return false;
            }
        }
        return true;
    }

    checkColPlacement(puzzleString, row, column, value) {
        const val = String(value);
        for (let r = 0; r < 9; r += 1) {
            if (r !== row && puzzleString[r * 9 + column] === val) {
                return false;
            }
        }
        return true;
    }

    checkRegionPlacement(puzzleString, row, column, value) {
        const val = String(value);
        const startRow = Math.floor(row / 3) * 3;
        const startCol = Math.floor(column / 3) * 3;
        for (let r = startRow; r < startRow + 3; r += 1) {
            for (let c = startCol; c < startCol + 3; c += 1) {
                if ((r !== row || c !== column) && puzzleString[r * 9 + c] === val) {
                    return false;
                }
            }
        }
        return true;
    }

    solve(puzzleString) {
        const validation = this.validate(puzzleString);
        if (validation.error) {
            return false;
        }

        const board = puzzleString.split("");

        for (let i = 0; i < 81; i += 1) {
            if (board[i] !== ".") {
                const row = Math.floor(i / 9);
                const col = i % 9;
                const val = board[i];
                const current = board.join("");
                if (
                    !this.checkRowPlacement(current, row, col, val) ||
                    !this.checkColPlacement(current, row, col, val) ||
                    !this.checkRegionPlacement(current, row, col, val)
                ) {
                    return false;
                }
            }
        }

        const canPlace = (idx, val) => {
            const row = Math.floor(idx / 9);
            const col = idx % 9;
            const startRow = Math.floor(row / 3) * 3;
            const startCol = Math.floor(col / 3) * 3;

            for (let k = 0; k < 9; k += 1) {
                if (board[row * 9 + k] === val || board[k * 9 + col] === val) {
                    return false;
                }
                const boxIdx = (startRow + Math.floor(k / 3)) * 9 + (startCol + (k % 3));
                if (board[boxIdx] === val) {
                    return false;
                }
            }
            return true;
        };

        const backtrack = () => {
            const emptyIdx = board.indexOf(".");
            if (emptyIdx === -1) {
                return true;
            }
            for (let num = 1; num <= 9; num += 1) {
                const val = String(num);
                if (canPlace(emptyIdx, val)) {
                    board[emptyIdx] = val;
                    if (backtrack()) {
                        return true;
                    }
                    board[emptyIdx] = ".";
                }
            }
            return false;
        };

        return backtrack() ? board.join("") : false;
    }
}

module.exports = SudokuSolver;
