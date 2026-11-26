const http = require("http");
const fs = require("fs");
const path = require("path");
const querystring = require("querystring");
const { handleSolve, handleCheck } = require("./routes/api");
const runUnitTests = require("./tests/1_unit-tests");
const runFunctionalTests = require("./tests/2_functional-tests");

const port = process.env.PORT || 3000;

function sendJson(res, statusCode, payload) {
    res.writeHead(statusCode, {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
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

function filterTests(tests, type, n) {
    let out;
    if (type === "unit") {
        out = tests.filter((t) => t.context.includes("Unit Tests"));
    } else if (type === "functional") {
        out = tests.filter((t) => t.context.includes("Functional Tests"));
    } else {
        out = tests;
    }
    if (n !== undefined) {
        return out[Number(n)] || out;
    }
    return out;
}

if (process.argv.includes("--test")) {
    const all = [...runUnitTests(), ...runFunctionalTests()];
    const failed = all.filter((t) => t.state !== "passed");
    console.log(`Passed: ${all.length - failed.length}/${all.length}`);
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
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
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
        const all = [...runUnitTests(), ...runFunctionalTests()];
        const type = parsedUrl.searchParams.get("type") || undefined;
        const n = parsedUrl.searchParams.get("n");
        sendJson(res, 200, filterTests(all, type, n !== null ? n : undefined));
        return;
    }

    if (req.method === "POST" && (urlPath === "/api/solve" || urlPath === "/api/solve/")) {
        const body = await parseBody(req);
        const result = handleSolve(body);
        sendJson(res, result.status, result.json);
        return;
    }

    if (req.method === "POST" && (urlPath === "/api/check" || urlPath === "/api/check/")) {
        const body = await parseBody(req);
        const result = handleCheck(body);
        sendJson(res, result.status, result.json);
        return;
    }

    res.writeHead(404);
    res.end("Not Found");
});

server.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
