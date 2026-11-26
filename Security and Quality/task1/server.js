const http = require("http");
const fs = require("fs");
const path = require("path");
const handleConvert = require("./routes/api");
const runUnitTests = require("./tests/1_unit-tests");
const runFunctionalTests = require("./tests/2_functional-tests");

const port = process.env.PORT || 3000;

function sendJson(res, statusCode, payload) {
    res.writeHead(statusCode, {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
    });
    res.end(JSON.stringify(payload));
}

function sendText(res, statusCode, text) {
    res.writeHead(statusCode, {
        "Content-Type": "text/plain",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
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

const server = http.createServer((req, res) => {
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

    if (req.method === "GET" && urlPath === "/api/convert") {
        const input = parsedUrl.searchParams.get("input") || "";
        const result = handleConvert(input);
        if (result.json) {
            sendJson(res, result.status, result.json);
            return;
        }
        sendText(res, result.status, result.text);
        return;
    }

    if (req.method === "GET" && urlPath === "/_api/get-tests") {
        const all = [...runUnitTests(), ...runFunctionalTests()];
        const type = parsedUrl.searchParams.get("type") || undefined;
        const n = parsedUrl.searchParams.get("n");
        sendJson(res, 200, filterTests(all, type, n !== null ? n : undefined));
        return;
    }

    res.writeHead(404);
    res.end("Not Found");
});

server.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
