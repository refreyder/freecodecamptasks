function ConvertHandler() {
    this.getNum = function (input) {
        const str = String(input || "").trim();
        const firstLetterIdx = str.search(/[a-zA-Z]/);
        const numStr = firstLetterIdx === -1 ? str : str.slice(0, firstLetterIdx);

        if (numStr === "") {
            return 1;
        }

        const parts = numStr.split("/");
        if (parts.length > 2) {
            return undefined;
        }

        const validNum = /^\d+(\.\d+)?$|^\.\d+$/;
        if (parts.length === 1) {
            return validNum.test(parts[0]) ? Number(parts[0]) : undefined;
        }

        if (!validNum.test(parts[0]) || !validNum.test(parts[1])) {
            return undefined;
        }

        const denom = Number(parts[1]);
        if (denom === 0) {
            return undefined;
        }

        return Number(parts[0]) / denom;
    };

    this.getUnit = function (input) {
        const str = String(input || "").trim();
        const firstLetterIdx = str.search(/[a-zA-Z]/);
        if (firstLetterIdx === -1) {
            return undefined;
        }

        const unit = str.slice(firstLetterIdx).toLowerCase();
        const validUnits = ["gal", "l", "mi", "km", "lbs", "kg"];
        if (!validUnits.includes(unit)) {
            return undefined;
        }

        return unit === "l" ? "L" : unit;
    };

    this.getReturnUnit = function (initUnit) {
        const map = {
            gal: "L",
            L: "gal",
            mi: "km",
            km: "mi",
            lbs: "kg",
            kg: "lbs"
        };
        return map[initUnit];
    };

    this.spellOutUnit = function (unit) {
        const map = {
            gal: "gallons",
            L: "liters",
            mi: "miles",
            km: "kilometers",
            lbs: "pounds",
            kg: "kilograms"
        };
        return map[unit];
    };

    this.convert = function (initNum, initUnit) {
        const galToL = 3.78541;
        const lbsToKg = 0.453592;
        const miToKm = 1.60934;

        let result;
        switch (initUnit) {
            case "gal":
                result = initNum * galToL;
                break;
            case "L":
                result = initNum / galToL;
                break;
            case "lbs":
                result = initNum * lbsToKg;
                break;
            case "kg":
                result = initNum / lbsToKg;
                break;
            case "mi":
                result = initNum * miToKm;
                break;
            case "km":
                result = initNum / miToKm;
                break;
            default:
                return undefined;
        }

        return Number(result.toFixed(5));
    };

    this.getString = function (initNum, initUnit, returnNum, returnUnit) {
        return `${initNum} ${this.spellOutUnit(initUnit)} converts to ${returnNum} ${this.spellOutUnit(returnUnit)}`;
    };
}

module.exports = ConvertHandler;
