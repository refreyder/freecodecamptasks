const crypto = require("crypto");

function createBoardHandler() {
    const boards = new Map();

    function getBoard(board) {
        if (!boards.has(board)) {
            boards.set(board, []);
        }
        return boards.get(board);
    }

    function sanitizeReply(reply) {
        return {
            _id: reply._id,
            text: reply.text,
            created_on: reply.created_on
        };
    }

    return function handleBoard(method, type, board, query, body) {
        const threads = getBoard(board);

        if (type === "threads") {
            if (method === "GET") {
                const sorted = threads
                    .slice()
                    .sort((a, b) => new Date(b.bumped_on) - new Date(a.bumped_on))
                    .slice(0, 10)
                    .map((t) => ({
                        _id: t._id,
                        text: t.text,
                        created_on: t.created_on,
                        bumped_on: t.bumped_on,
                        replies: t.replies.slice(-3).map(sanitizeReply),
                        replycount: t.replies.length
                    }));
                return { status: 200, json: sorted };
            }

            if (method === "POST") {
                const now = new Date().toISOString();
                const thread = {
                    _id: crypto.randomBytes(12).toString("hex"),
                    text: String((body && body.text) || ""),
                    created_on: now,
                    bumped_on: now,
                    reported: false,
                    delete_password: String((body && body.delete_password) || ""),
                    replies: []
                };
                threads.push(thread);
                return { status: 302, redirect: `/b/${encodeURIComponent(board)}/`, json: thread };
            }

            if (method === "PUT") {
                const threadId = (body && (body.thread_id || body.report_id)) || "";
                const thread = threads.find((t) => t._id === threadId);
                if (!thread) {
                    return { status: 200, text: "thread not found" };
                }
                thread.reported = true;
                return { status: 200, text: "reported" };
            }

            if (method === "DELETE") {
                const threadId = (body && body.thread_id) || "";
                const deletePassword = (body && body.delete_password) || "";
                const idx = threads.findIndex((t) => t._id === threadId);
                if (idx === -1) {
                    return { status: 200, text: "incorrect password" };
                }
                if (threads[idx].delete_password !== deletePassword) {
                    return { status: 200, text: "incorrect password" };
                }
                threads.splice(idx, 1);
                return { status: 200, text: "success" };
            }
        }

        if (type === "replies") {
            if (method === "GET") {
                const threadId = query && query.thread_id;
                const thread = threads.find((t) => t._id === threadId);
                if (!thread) {
                    return { status: 404, text: "thread not found" };
                }
                return {
                    status: 200,
                    json: {
                        _id: thread._id,
                        text: thread.text,
                        created_on: thread.created_on,
                        bumped_on: thread.bumped_on,
                        replies: thread.replies.map(sanitizeReply)
                    }
                };
            }

            if (method === "POST") {
                const threadId = (body && body.thread_id) || "";
                const thread = threads.find((t) => t._id === threadId);
                if (!thread) {
                    return { status: 404, text: "thread not found" };
                }
                const now = new Date().toISOString();
                const reply = {
                    _id: crypto.randomBytes(12).toString("hex"),
                    text: String((body && body.text) || ""),
                    created_on: now,
                    delete_password: String((body && body.delete_password) || ""),
                    reported: false
                };
                thread.bumped_on = now;
                thread.replies.push(reply);
                return {
                    status: 302,
                    redirect: `/b/${encodeURIComponent(board)}/${encodeURIComponent(threadId)}`,
                    json: reply
                };
            }

            if (method === "PUT") {
                const threadId = (body && body.thread_id) || "";
                const replyId = (body && body.reply_id) || "";
                const thread = threads.find((t) => t._id === threadId);
                if (!thread) {
                    return { status: 200, text: "thread not found" };
                }
                const reply = thread.replies.find((r) => r._id === replyId);
                if (!reply) {
                    return { status: 200, text: "reply not found" };
                }
                reply.reported = true;
                return { status: 200, text: "reported" };
            }

            if (method === "DELETE") {
                const threadId = (body && body.thread_id) || "";
                const replyId = (body && body.reply_id) || "";
                const deletePassword = (body && body.delete_password) || "";
                const thread = threads.find((t) => t._id === threadId);
                if (!thread) {
                    return { status: 200, text: "incorrect password" };
                }
                const reply = thread.replies.find((r) => r._id === replyId);
                if (!reply || reply.delete_password !== deletePassword) {
                    return { status: 200, text: "incorrect password" };
                }
                reply.text = "[deleted]";
                return { status: 200, text: "success" };
            }
        }

        return { status: 404, text: "Not Found" };
    };
}

module.exports = createBoardHandler;
