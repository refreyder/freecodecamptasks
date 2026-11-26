function evaluateExpression(expr) {
    const cleaned = expr.replace(/[+\-*/]+$/, "");
    if (!cleaned) {
        return 0;
    }

    const tokens = [];
    let i = 0;
    while (i < cleaned.length) {
        const ch = cleaned[i];
        if (
            (ch >= "0" && ch <= "9") ||
            ch === "." ||
            (ch === "-" && (i === 0 || "+-*/".includes(cleaned[i - 1])))
        ) {
            let numStr = ch;
            i += 1;
            while (i < cleaned.length && ((cleaned[i] >= "0" && cleaned[i] <= "9") || cleaned[i] === ".")) {
                numStr += cleaned[i];
                i += 1;
            }
            tokens.push(parseFloat(numStr));
        } else {
            tokens.push(ch);
            i += 1;
        }
    }

    const highPrec = [];
    let idx = 0;
    while (idx < tokens.length) {
        const token = tokens[idx];
        if (token === "*" || token === "/") {
            const left = highPrec.pop();
            const right = tokens[idx + 1];
            highPrec.push(token === "*" ? left * right : left / right);
            idx += 2;
        } else {
            highPrec.push(token);
            idx += 1;
        }
    }

    let result = highPrec[0];
    for (let j = 1; j < highPrec.length; j += 2) {
        const op = highPrec[j];
        const right = highPrec[j + 1];
        result = op === "+" ? result + right : result - right;
    }

    return Math.round(result * 1e12) / 1e12;
}

function Calculator() {
    const [formula, setFormula] = React.useState("");
    const [display, setDisplay] = React.useState("0");
    const [evaluated, setEvaluated] = React.useState(false);

    function handleClear() {
        setFormula("");
        setDisplay("0");
        setEvaluated(false);
    }

    function handleDigit(digit) {
        if (evaluated) {
            setFormula(digit);
            setDisplay(digit);
            setEvaluated(false);
            return;
        }

        if (display === "0" && digit === "0") {
            return;
        }

        if (display === "0" || "+-*/".includes(display)) {
            const nextFormula =
                display === "0" && formula.endsWith("0")
                    ? formula.slice(0, -1) + digit
                    : formula + digit;
            setFormula(nextFormula);
            setDisplay(digit);
            return;
        }

        setFormula((prev) => prev + digit);
        setDisplay((prev) => prev + digit);
    }

    function handleDecimal() {
        if (evaluated) {
            setFormula("0.");
            setDisplay("0.");
            setEvaluated(false);
            return;
        }

        if (display.includes(".")) {
            return;
        }

        if ("+-*/".includes(display) || formula === "") {
            setFormula((prev) => prev + "0.");
            setDisplay("0.");
            return;
        }

        setFormula((prev) => prev + ".");
        setDisplay((prev) => prev + ".");
    }

    function handleOperator(op) {
        if (evaluated) {
            setFormula(display + op);
            setDisplay(op);
            setEvaluated(false);
            return;
        }

        if (formula === "") {
            if (op === "-") {
                setFormula("-");
                setDisplay("-");
            }
            return;
        }

        if (op === "-") {
            if (formula.endsWith("-") && formula.length >= 2 && "+-*/".includes(formula[formula.length - 2])) {
                return;
            }
            if (formula === "-") {
                return;
            }
            setFormula((prev) => prev + "-");
            setDisplay("-");
            return;
        }

        setFormula((prev) => prev.replace(/[+\-*/]+$/, "") + op);
        setDisplay(op);
    }

    function handleEquals() {
        if (!formula) {
            return;
        }
        const result = evaluateExpression(formula);
        const resultStr = String(result);
        setFormula(resultStr);
        setDisplay(resultStr);
        setEvaluated(true);
    }

    return React.createElement(
        "main",
        { className: "calculator" },
        React.createElement(
            "div",
            { className: "screen" },
            React.createElement("div", { className: "formula" }, formula || "0"),
            React.createElement("div", { id: "display" }, display)
        ),
        React.createElement(
            "div",
            { className: "keypad" },
            React.createElement("button", { id: "clear", type: "button", onClick: handleClear }, "AC"),
            React.createElement("button", { id: "divide", type: "button", onClick: () => handleOperator("/") }, "/"),
            React.createElement("button", { id: "multiply", type: "button", onClick: () => handleOperator("*") }, "*"),
            React.createElement("button", { id: "seven", type: "button", onClick: () => handleDigit("7") }, "7"),
            React.createElement("button", { id: "eight", type: "button", onClick: () => handleDigit("8") }, "8"),
            React.createElement("button", { id: "nine", type: "button", onClick: () => handleDigit("9") }, "9"),
            React.createElement("button", { id: "subtract", type: "button", onClick: () => handleOperator("-") }, "-"),
            React.createElement("button", { id: "four", type: "button", onClick: () => handleDigit("4") }, "4"),
            React.createElement("button", { id: "five", type: "button", onClick: () => handleDigit("5") }, "5"),
            React.createElement("button", { id: "six", type: "button", onClick: () => handleDigit("6") }, "6"),
            React.createElement("button", { id: "add", type: "button", onClick: () => handleOperator("+") }, "+"),
            React.createElement("button", { id: "one", type: "button", onClick: () => handleDigit("1") }, "1"),
            React.createElement("button", { id: "two", type: "button", onClick: () => handleDigit("2") }, "2"),
            React.createElement("button", { id: "three", type: "button", onClick: () => handleDigit("3") }, "3"),
            React.createElement("button", { id: "equals", type: "button", onClick: handleEquals }, "="),
            React.createElement("button", { id: "zero", type: "button", onClick: () => handleDigit("0") }, "0"),
            React.createElement("button", { id: "decimal", type: "button", onClick: handleDecimal }, ".")
        )
    );
}

ReactDOM.render(
    React.createElement(Calculator),
    document.getElementById("root")
);
