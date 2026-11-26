const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const querystring = require("querystring");

const port = process.env.PORT || 3000;
const users = new Map();

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

    const parsedUrl = new URL(req.url, `http://localhost:${port}`);
    const urlPath = parsedUrl.pathname;

    if (req.method === "GET" && urlPath === "/") {
        sendFile(res, path.join(__dirname, "views", "index.html"), "text/html");
        return;
    }

    if (req.method === "GET" && urlPath === "/style.css") {
        sendFile(res, path.join(__dirname, "public", "style.css"), "text/css");
        return;
    }

    if (req.method === "POST" && (urlPath === "/api/users" || urlPath === "/api/users/")) {
        const body = await parseBody(req);
        const username = String(body.username || "").trim();
        if (!username) {
            sendJson(res, 400, { error: "Username is required" });
            return;
        }
        const id = crypto.randomBytes(12).toString("hex");
        users.set(id, { _id: id, username, log: [] });
        sendJson(res, 200, { username, _id: id });
        return;
    }

    if (req.method === "GET" && (urlPath === "/api/users" || urlPath === "/api/users/")) {
        const list = Array.from(users.values()).map((u) => ({
            username: u.username,
            _id: u._id
        }));
        sendJson(res, 200, list);
        return;
    }

    const exerciseMatch = urlPath.match(/^\/api\/users\/([^/]+)\/exercises\/?$/);
    if (req.method === "POST" && exerciseMatch) {
        const userId = exerciseMatch[1];
        const user = users.get(userId);
        if (!user) {
            sendJson(res, 404, { error: "User not found" });
            return;
        }

        const body = await parseBody(req);
        const description = String(body.description || "");
        const duration = Number(body.duration);
        const dateObj = body.date ? new Date(body.date) : new Date();
        if (isNaN(dateObj.getTime())) {
            sendJson(res, 400, { error: "Invalid date" });
            return;
        }

        user.log.push({ description, duration, dateObj });
        sendJson(res, 200, {
            _id: user._id,
            username: user.username,
            date: dateObj.toDateString(),
            duration,
            description
        });
        return;
    }

    const logsMatch = urlPath.match(/^\/api\/users\/([^/]+)\/logs\/?$/);
    if (req.method === "GET" && logsMatch) {
        const userId = logsMatch[1];
        const user = users.get(userId);
        if (!user) {
            sendJson(res, 404, { error: "User not found" });
            return;
        }

        const fromParam = parsedUrl.searchParams.get("from");
        const toParam = parsedUrl.searchParams.get("to");
        const limitParam = parsedUrl.searchParams.get("limit");

        let filtered = user.log.slice();

        if (fromParam) {
            const fromDate = new Date(fromParam);
            if (!isNaN(fromDate.getTime())) {
                filtered = filtered.filter((item) => item.dateObj >= fromDate);
            }
        }

        if (toParam) {
            const toDate = new Date(toParam);
            if (!isNaN(toDate.getTime())) {
                filtered = filtered.filter((item) => item.dateObj <= toDate);
            }
        }

        if (limitParam) {
            const limit = parseInt(limitParam, 10);
            if (!isNaN(limit) && limit >= 0) {
                filtered = filtered.slice(0, limit);
            }
        }

        const log = filtered.map((item) => ({
            description: item.description,
            duration: item.duration,
            date: item.dateObj.toDateString()
        }));

        sendJson(res, 200, {
            _id: user._id,
            username: user.username,
            count: log.length,
            log
        });
        return;
    }

    res.writeHead(404);
    res.end("Not Found");
});

server.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
