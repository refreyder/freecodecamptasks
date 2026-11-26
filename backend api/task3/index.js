const http = require("http");
const fs = require("fs");
const path = require("path");
const dns = require("dns");
const querystring = require("querystring");

const port = process.env.PORT || 3000;
const urls = new Map();
let nextId = 1;

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

    const urlPath = req.url.split("?")[0];

    if (req.method === "GET" && urlPath === "/") {
        sendFile(res, path.join(__dirname, "views", "index.html"), "text/html");
        return;
    }

    if (req.method === "GET" && urlPath === "/style.css") {
        sendFile(res, path.join(__dirname, "public", "style.css"), "text/css");
        return;
    }

    if (req.method === "POST" && (urlPath === "/api/shorturl" || urlPath === "/api/shorturl/")) {
        const body = await parseBody(req);
        const rawUrl = body.url;

        let parsed;
        try {
            parsed = new URL(rawUrl);
        } catch {
            sendJson(res, 200, { error: "invalid url" });
            return;
        }

        if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
            sendJson(res, 200, { error: "invalid url" });
            return;
        }

        dns.lookup(parsed.hostname, (err) => {
            if (err) {
                sendJson(res, 200, { error: "invalid url" });
                return;
            }

            const shortUrl = nextId++;
            urls.set(shortUrl, rawUrl);
            sendJson(res, 200, {
                original_url: rawUrl,
                short_url: shortUrl
            });
        });
        return;
    }

    if (req.method === "GET" && urlPath.startsWith("/api/shorturl/")) {
        const shortId = Number(urlPath.slice("/api/shorturl/".length));
        if (!Number.isInteger(shortId) || !urls.has(shortId)) {
            sendJson(res, 404, { error: "No short URL found for the given input" });
            return;
        }
        res.writeHead(302, {
            Location: urls.get(shortId),
            "Access-Control-Allow-Origin": "*"
        });
        res.end();
        return;
    }

    res.writeHead(404);
    res.end("Not Found");
});

server.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
