const http = require("http");
const fs = require("fs");
const path = require("path");

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

function parseMultipart(buffer, boundary) {
    const delimiter = Buffer.from(`--${boundary}`);
    const headerEndMarker = Buffer.from("\r\n\r\n");
    let offset = buffer.indexOf(delimiter);

    while (offset !== -1) {
        const partStart = offset + delimiter.length;
        if (buffer.slice(partStart, partStart + 2).toString() === "--") {
            break;
        }
        const nextOffset = buffer.indexOf(delimiter, partStart);
        if (nextOffset === -1) {
            break;
        }
        const part = buffer.slice(partStart + 2, nextOffset - 2);
        const headerEnd = part.indexOf(headerEndMarker);
        if (headerEnd !== -1) {
            const headersText = part.slice(0, headerEnd).toString("utf8");
            const body = part.slice(headerEnd + 4);
            const nameMatch = headersText.match(/name="([^"]+)"/);
            const fileMatch = headersText.match(/filename="([^"]*)"/);
            const typeMatch = headersText.match(/Content-Type:\s*([^\r\n]+)/i);

            if (nameMatch && nameMatch[1] === "upfile" && fileMatch) {
                return {
                    name: fileMatch[1],
                    type: typeMatch ? typeMatch[1].trim() : "application/octet-stream",
                    size: body.length
                };
            }
        }
        offset = nextOffset;
    }
    return null;
}

const server = http.createServer((req, res) => {
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

    if (req.method === "POST" && (urlPath === "/api/fileanalyse" || urlPath === "/api/fileanalyse/")) {
        const contentType = req.headers["content-type"] || "";
        const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;\s]+))/i);
        if (!boundaryMatch) {
            sendJson(res, 400, { error: "Invalid multipart request" });
            return;
        }
        const boundary = boundaryMatch[1] || boundaryMatch[2];

        const chunks = [];
        req.on("data", (chunk) => chunks.push(chunk));
        req.on("end", () => {
            const buffer = Buffer.concat(chunks);
            const fileInfo = parseMultipart(buffer, boundary);
            if (!fileInfo) {
                sendJson(res, 400, { error: "No file uploaded" });
                return;
            }
            sendJson(res, 200, fileInfo);
        });
        return;
    }

    res.writeHead(404);
    res.end("Not Found");
});

server.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
