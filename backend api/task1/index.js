const http = require("http");
const fs = require("fs");
const path = require("path");

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

    const urlPath = req.url.split("?")[0];

    if (urlPath === "/") {
        sendFile(res, path.join(__dirname, "views", "index.html"), "text/html");
        return;
    }

    if (urlPath === "/style.css") {
        sendFile(res, path.join(__dirname, "public", "style.css"), "text/css");
        return;
    }

    if (urlPath === "/api" || urlPath === "/api/") {
        const now = new Date();
        sendJson(res, 200, {
            unix: now.getTime(),
            utc: now.toUTCString()
        });
        return;
    }

    if (urlPath.startsWith("/api/")) {
        const dateParam = decodeURIComponent(urlPath.slice(5));
        const date = /^\d+$/.test(dateParam)
            ? new Date(Number(dateParam))
            : new Date(dateParam);

        if (isNaN(date.getTime())) {
            sendJson(res, 200, { error: "Invalid Date" });
            return;
        }

        sendJson(res, 200, {
            unix: date.getTime(),
            utc: date.toUTCString()
        });
        return;
    }

    res.writeHead(404);
    res.end("Not Found");
});

server.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
