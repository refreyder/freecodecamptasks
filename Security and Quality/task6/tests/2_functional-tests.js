const assert = require("assert");
const createStockHandler = require("../routes/api");

async function runFunctionalTests() {
    const mockPrices = { GOOG: 150.5, MSFT: 320.25 };
    const handleStock = createStockHandler(async (sym) => ({
        symbol: sym,
        latestPrice: mockPrices[sym] || 100
    }));

    const cases = [
        {
            title: "Viewing one stock: GET request to /api/stock-prices/",
            fn: async () => {
                const res = await handleStock("GOOG", false, "127.0.0.1");
                assert.strictEqual(res.json.stockData.stock, "GOOG");
                assert.strictEqual(typeof res.json.stockData.price, "number");
                assert.strictEqual(res.json.stockData.likes, 0);
            }
        },
        {
            title: "Viewing one stock and liking it: GET request to /api/stock-prices/",
            fn: async () => {
                const res = await handleStock("GOOG", "true", "127.0.0.1");
                assert.strictEqual(res.json.stockData.stock, "GOOG");
                assert.strictEqual(res.json.stockData.likes, 1);
            }
        },
        {
            title: "Viewing the same stock and liking it again: GET request to /api/stock-prices/",
            fn: async () => {
                const res = await handleStock("GOOG", "true", "127.0.0.1");
                assert.strictEqual(res.json.stockData.stock, "GOOG");
                assert.strictEqual(res.json.stockData.likes, 1);
            }
        },
        {
            title: "Viewing two stocks: GET request to /api/stock-prices/",
            fn: async () => {
                const res = await handleStock(["GOOG", "MSFT"], false, "127.0.0.1");
                assert.ok(Array.isArray(res.json.stockData));
                assert.strictEqual(res.json.stockData.length, 2);
                assert.strictEqual(res.json.stockData[0].rel_likes, 1);
                assert.strictEqual(res.json.stockData[1].rel_likes, -1);
            }
        },
        {
            title: "Viewing two stocks and liking them: GET request to /api/stock-prices/",
            fn: async () => {
                const res = await handleStock(["GOOG", "MSFT"], "true", "10.0.0.2");
                assert.ok(Array.isArray(res.json.stockData));
                assert.strictEqual(res.json.stockData[0].rel_likes, 1);
                assert.strictEqual(res.json.stockData[1].rel_likes, -1);
            }
        }
    ];

    const results = [];
    for (const c of cases) {
        try {
            await c.fn();
            results.push({ title: c.title, context: "Functional Tests", state: "passed", assertions: [{ method: "assert", args: [] }] });
        } catch (err) {
            results.push({ title: c.title, context: "Functional Tests", state: "failed", error: err.message, assertions: [] });
        }
    }
    return results;
}

module.exports = runFunctionalTests;
