const http = require("http");
const fs = require("fs");
const path = require("path");
const querystring = require("querystring");
const createLibraryHandler = require("./routes/api");
const runFunctionalTests = require("./tests/2_functional-tests");

const port = process.env.PORT || 3000;
const handleLibrary = createLibraryHandler();

function sendJson(res, statusCode, payload) {
    res.writeHead(statusCode, {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
    });
    res.end(JSON.stringify(payload));
}

function sendText(res, statusCode, text) {
    res.writeHead(statusCode, {
        "Content-Type": "text/plain",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
    });
    res.end(text);
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
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
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

    if (req.method === "GET" && urlPath === "/_api/get-tests") {
        const results = runFunctionalTests();
        const n = parsedUrl.searchParams.get("n");
        sendJson(res, 200, n !== null ? (results[Number(n)] || results) : results);
        return;
    }

    if (urlPath === "/api/books" || urlPath === "/api/books/") {
        const body = req.method === "POST" ? await parseBody(req) : {};
        const result = handleLibrary(req.method, null, body);
        if (result.json !== undefined) {
            sendJson(res, result.status, result.json);
            return;
        }
        sendText(res, result.status, result.text);
        return;
    }

    const bookMatch = urlPath.match(/^\/api\/books\/([^/]+)\/?$/);
    if (bookMatch) {
        const bookId = decodeURIComponent(bookMatch[1]);
        const body = req.method === "POST" ? await parseBody(req) : {};
        const result = handleLibrary(req.method, bookId, body);
        if (result.json !== undefined) {
            sendJson(res, result.status, result.json);
            return;
        }
        sendText(res, result.status, result.text);
        return;
    }

    res.writeHead(404);
    res.end("Not Found");
});

server.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
