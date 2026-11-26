const http = require("http");
const fs = require("fs");
const path = require("path");
const createStockHandler = require("./routes/api");
const runFunctionalTests = require("./tests/2_functional-tests");

const port = process.env.PORT || 3000;
const handleStockPrices = createStockHandler();
const cspHeader = "default-src 'self'; script-src 'self'; style-src 'self'";

function sendJson(res, statusCode, payload) {
    res.writeHead(statusCode, {
        "Content-Type": "application/json",
        "Content-Security-Policy": cspHeader,
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
    });
    res.end(JSON.stringify(payload));
}

function sendFile(res, filePath, contentType) {
    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(404);
            res.end("Not Found");
            return;
        }
        res.writeHead(200, {
            "Content-Type": contentType,
            "Content-Security-Policy": cspHeader,
            "Access-Control-Allow-Origin": "*"
        });
        res.end(content);
    });
}

if (process.argv.includes("--test")) {
    runFunctionalTests().then((results) => {
        const failed = results.filter((t) => t.state !== "passed");
        console.log(`Passed: ${results.length - failed.length}/${results.length}`);
        if (failed.length > 0) {
            console.error(failed);
            process.exit(1);
        }
        process.exit(0);
    });
} else {
    const server = http.createServer(async (req, res) => {
        if (req.method === "OPTIONS") {
            res.writeHead(200, {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            });
            res.end();
            return;
        }

        const parsedUrl = new URL(req.url, `http://localhost:${port}`);
        const urlPath = parsedUrl.pathname;

        if (req.method === "GET" && urlPath === "/") {
            sendFile(res, path.join(__dirname, "views", "index.html"), "text/html");
            return;
        }

        if (req.method === "GET" && urlPath === "/public/style.css") {
            sendFile(res, path.join(__dirname, "public", "style.css"), "text/css");
            return;
        }

        if (req.method === "GET" && urlPath === "/public/client.js") {
            sendFile(res, path.join(__dirname, "public", "client.js"), "application/javascript");
            return;
        }

        if (req.method === "GET" && urlPath === "/_api/app-info") {
            sendJson(res, 200, {
                headers: {
                    "content-security-policy": cspHeader
                }
            });
            return;
        }

        if (req.method === "GET" && urlPath === "/_api/get-tests") {
            const results = await runFunctionalTests();
            const n = parsedUrl.searchParams.get("n");
            sendJson(res, 200, n !== null ? (results[Number(n)] || results) : results);
            return;
        }

        if (req.method === "GET" && (urlPath === "/api/stock-prices" || urlPath === "/api/stock-prices/")) {
            const stocks = parsedUrl.searchParams.getAll("stock");
            const like = parsedUrl.searchParams.get("like");
            const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "";
            try {
                const result = await handleStockPrices(stocks, like, ip);
                sendJson(res, result.status, result.json);
            } catch {
                sendJson(res, 500, { error: "Failed to fetch stock data" });
            }
            return;
        }

        res.writeHead(404);
        res.end("Not Found");
    });

    server.listen(port, () => {
        console.log(`Server is listening on port ${port}`);
    });
}
