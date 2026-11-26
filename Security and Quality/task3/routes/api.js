const crypto = require("crypto");

function createLibraryHandler() {
    const books = new Map();

    return function handleLibrary(method, bookId, body) {
        if (!bookId) {
            if (method === "GET") {
                const list = Array.from(books.values()).map((b) => ({
                    _id: b._id,
                    title: b.title,
                    commentcount: b.comments.length
                }));
                return { status: 200, json: list };
            }

            if (method === "POST") {
                const title = body && body.title ? String(body.title).trim() : "";
                if (!title) {
                    return { status: 200, text: "missing required field title" };
                }
                const id = crypto.randomBytes(12).toString("hex");
                books.set(id, { _id: id, title, comments: [] });
                return { status: 200, json: { _id: id, title } };
            }

            if (method === "DELETE") {
                books.clear();
                return { status: 200, text: "complete delete successful" };
            }

            return { status: 405, text: "Method not allowed" };
        }

        const book = books.get(bookId);

        if (method === "GET") {
            if (!book) {
                return { status: 200, text: "no book exists" };
            }
            return {
                status: 200,
                json: { _id: book._id, title: book.title, comments: book.comments }
            };
        }

        if (method === "POST") {
            const comment = body && body.comment ? String(body.comment) : "";
            if (!comment) {
                return { status: 200, text: "missing required field comment" };
            }
            if (!book) {
                return { status: 200, text: "no book exists" };
            }
            book.comments.push(comment);
            return {
                status: 200,
                json: { _id: book._id, title: book.title, comments: book.comments }
            };
        }

        if (method === "DELETE") {
            if (!book) {
                return { status: 200, text: "no book exists" };
            }
            books.delete(bookId);
            return { status: 200, text: "delete successful" };
        }

        return { status: 405, text: "Method not allowed" };
    };
}

module.exports = createLibraryHandler;
