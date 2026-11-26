const ConvertHandler = require("../controllers/convertHandler");

module.exports = function handleConvert(input) {
    const convertHandler = new ConvertHandler();
    const initNum = convertHandler.getNum(input);
    const initUnit = convertHandler.getUnit(input);

    if (initNum === undefined && initUnit === undefined) {
        return { status: 200, text: "invalid number and unit" };
    }
    if (initNum === undefined) {
        return { status: 200, text: "invalid number" };
    }
    if (initUnit === undefined) {
        return { status: 200, text: "invalid unit" };
    }

    const returnNum = convertHandler.convert(initNum, initUnit);
    const returnUnit = convertHandler.getReturnUnit(initUnit);
    const string = convertHandler.getString(initNum, initUnit, returnNum, returnUnit);

    return {
        status: 200,
        json: {
            initNum,
            initUnit,
            returnNum,
            returnUnit,
            string
        }
    };
};
