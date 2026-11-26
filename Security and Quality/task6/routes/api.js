const crypto = require("crypto");

function anonymizeIp(ip) {
    return crypto.createHash("sha256").update(String(ip || "unknown")).digest("hex");
}

function createStockHandler(fetchStockFn) {
    const likesStore = new Map();

    async function defaultFetchStock(symbol) {
        const res = await fetch(
            `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${encodeURIComponent(symbol)}/quote`
        );
        return res.json();
    }

    const getQuote = fetchStockFn || defaultFetchStock;

    function addLike(symbol, ipHash) {
        if (!likesStore.has(symbol)) {
            likesStore.set(symbol, new Set());
        }
        likesStore.get(symbol).add(ipHash);
    }

    function getLikes(symbol) {
        return likesStore.has(symbol) ? likesStore.get(symbol).size : 0;
    }

    return async function handleStockPrices(stocks, like, ip) {
        const list = Array.isArray(stocks) ? stocks : [stocks];
        const symbols = list.filter(Boolean).map((s) => String(s).toUpperCase());
        if (symbols.length === 0) {
            return { status: 400, json: { error: "stock parameter is required" } };
        }

        const shouldLike = like === true || like === "true";
        const ipHash = anonymizeIp(ip);

        const results = await Promise.all(
            symbols.map(async (sym) => {
                const quote = await getQuote(sym);
                const stockSymbol = quote && quote.symbol ? String(quote.symbol).toUpperCase() : sym;
                if (shouldLike) {
                    addLike(stockSymbol, ipHash);
                }
                return {
                    stock: stockSymbol,
                    price: quote && typeof quote.latestPrice === "number" ? quote.latestPrice : 0,
                    likes: getLikes(stockSymbol)
                };
            })
        );

        if (results.length === 1) {
            return { status: 200, json: { stockData: results[0] } };
        }

        const [first, second] = results;
        return {
            status: 200,
            json: {
                stockData: [
                    {
                        stock: first.stock,
                        price: first.price,
                        rel_likes: first.likes - second.likes
                    },
                    {
                        stock: second.stock,
                        price: second.price,
                        rel_likes: second.likes - first.likes
                    }
                ]
            }
        };
    };
}

module.exports = createStockHandler;
