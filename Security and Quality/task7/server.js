const http = require("http");
const fs = require("fs");
const path = require("path");
const querystring = require("querystring");
const createBoardHandler = require("./routes/api");
const runFunctionalTests = require("./tests/2_functional-tests");

const port = process.env.PORT || 3000;
const handleBoard = createBoardHandler();

const securityHeaders = {
    "X-Frame-Options": "SAMEORIGIN",
    "X-DNS-Prefetch-Control": "off",
    "Referrer-Policy": "same-origin"
};

function sendJson(res, statusCode, payload) {
    res.writeHead(statusCode, {
        ...securityHeaders,
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
    });
    res.end(JSON.stringify(payload));
}

function sendText(res, statusCode, text) {
    res.writeHead(statusCode, {
        ...securityHeaders,
        "Content-Type": "text/plain",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
    });
    res.end(text);
}

function sendFile(res, filePath, contentType) {
    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(404, securityHeaders);
            res.end("Not Found");
            return;
        }
        res.writeHead(200, {
            ...securityHeaders,
            "Content-Type": contentType,
            "Access-Control-Allow-Origin": "*"
        });
        res.end(content);
    });
}

function parseBody(req) {
    return new Promise((resolve) => {
        let body = "";
        req.on("data", (chunk) => {
            body += chunk.toString();
        });
        req.on("end", () => {
            const contentType = req.headers["content-type"] || "";
            if (contentType.includes("application/json")) {
                try {
                    resolve(JSON.parse(body));
                } catch {
                    resolve({});
                }
                return;
            }
            resolve(querystring.parse(body));
        });
    });
}

if (process.argv.includes("--test")) {
    const results = runFunctionalTests();
    const failed = results.filter((t) => t.state !== "passed");
    console.log(`Passed: ${results.length - failed.length}/${results.length}`);
    if (failed.length > 0) {
        console.error(failed);
        process.exit(1);
    }
    process.exit(0);
}

const server = http.createServer(async (req, res) => {
    if (req.method === "OPTIONS") {
        res.writeHead(200, {
            ...securityHeaders,
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
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

    if (req.method === "GET" && /^\/b\/[^/]+\/?$/.test(urlPath)) {
        sendFile(res, path.join(__dirname, "views", "board.html"), "text/html");
        return;
    }

    if (req.method === "GET" && /^\/b\/[^/]+\/[^/]+\/?$/.test(urlPath)) {
        sendFile(res, path.join(__dirname, "views", "thread.html"), "text/html");
        return;
    }

    if (req.method === "GET" && urlPath === "/public/style.css") {
        sendFile(res, path.join(__dirname, "public", "style.css"), "text/css");
        return;
    }

    if (req.method === "GET" && urlPath === "/_api/app-info") {
        sendJson(res, 200, {
            headers: {
                "x-frame-options": "SAMEORIGIN",
                "x-dns-prefetch-control": "off",
                "referrer-policy": "same-origin"
            }
        });
        return;
    }

    if (req.method === "GET" && urlPath === "/_api/get-tests") {
        const results = runFunctionalTests();
        const n = parsedUrl.searchParams.get("n");
        sendJson(res, 200, n !== null ? (results[Number(n)] || results) : results);
        return;
    }

    const apiMatch = urlPath.match(/^\/api\/(threads|replies)\/([^/]+)\/?$/);
    if (apiMatch) {
        const type = apiMatch[1];
        const board = decodeURIComponent(apiMatch[2]);
        const query = Object.fromEntries(parsedUrl.searchParams.entries());
        const body = req.method === "GET" ? {} : await parseBody(req);
        const result = handleBoard(req.method, type, board, query, body);

        if (result.redirect) {
            res.writeHead(302, {
                ...securityHeaders,
                Location: result.redirect,
                "Access-Control-Allow-Origin": "*"
            });
            res.end();
            return;
        }
        if (result.json !== undefined) {
            sendJson(res, result.status, result.json);
            return;
        }
        sendText(res, result.status, result.text);
        return;
    }

    res.writeHead(404, securityHeaders);
    res.end("Not Found");
});

server.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
