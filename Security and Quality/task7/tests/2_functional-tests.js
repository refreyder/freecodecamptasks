const assert = require("assert");
const createBoardHandler = require("../routes/api");

function runFunctionalTests() {
    const handleBoard = createBoardHandler();
    const board = "fcc_test_board";
    let threadId;
    let replyId;

    const cases = [
        {
            title: "Creating a new thread: POST request to /api/threads/{board}",
            fn: () => {
                const res = handleBoard("POST", "threads", board, {}, {
                    text: "Test thread",
                    delete_password: "secret"
                });
                assert.strictEqual(res.json.text, "Test thread");
                assert.strictEqual(res.json.reported, false);
                assert.ok(res.json._id);
                threadId = res.json._id;
            }
        },
        {
            title: "Viewing the 10 most recent threads with 3 replies each: GET request to /api/threads/{board}",
            fn: () => {
                const res = handleBoard("GET", "threads", board, {}, {});
                assert.ok(Array.isArray(res.json));
                assert.strictEqual(res.json.length, 1);
                assert.strictEqual(res.json[0].delete_password, undefined);
                assert.strictEqual(res.json[0].reported, undefined);
            }
        },
        {
            title: "Reporting a thread: PUT request to /api/threads/{board}",
            fn: () => {
                const res = handleBoard("PUT", "threads", board, {}, { thread_id: threadId });
                assert.strictEqual(res.text, "reported");
            }
        },
        {
            title: "Creating a new reply: POST request to /api/replies/{board}",
            fn: () => {
                const res = handleBoard("POST", "replies", board, {}, {
                    thread_id: threadId,
                    text: "Test reply",
                    delete_password: "rpass"
                });
                assert.strictEqual(res.json.text, "Test reply");
                assert.ok(res.json._id);
                replyId = res.json._id;
            }
        },
        {
            title: "Viewing a single thread with all replies: GET request to /api/replies/{board}",
            fn: () => {
                const res = handleBoard("GET", "replies", board, { thread_id: threadId }, {});
                assert.strictEqual(res.json._id, threadId);
                assert.strictEqual(res.json.replies.length, 1);
                assert.strictEqual(res.json.replies[0].delete_password, undefined);
                assert.strictEqual(res.json.replies[0].reported, undefined);
            }
        },
        {
            title: "Reporting a reply: PUT request to /api/replies/{board}",
            fn: () => {
                const res = handleBoard("PUT", "replies", board, {}, {
                    thread_id: threadId,
                    reply_id: replyId
                });
                assert.strictEqual(res.text, "reported");
            }
        },
        {
            title: "Deleting a reply with the incorrect password: DELETE request to /api/replies/{board} with an invalid delete_password",
            fn: () => {
                const res = handleBoard("DELETE", "replies", board, {}, {
                    thread_id: threadId,
                    reply_id: replyId,
                    delete_password: "wrong"
                });
                assert.strictEqual(res.text, "incorrect password");
            }
        },
        {
            title: "Deleting a reply with the correct password: DELETE request to /api/replies/{board} with a valid delete_password",
            fn: () => {
                const res = handleBoard("DELETE", "replies", board, {}, {
                    thread_id: threadId,
                    reply_id: replyId,
                    delete_password: "rpass"
                });
                assert.strictEqual(res.text, "success");
                const check = handleBoard("GET", "replies", board, { thread_id: threadId }, {});
                assert.strictEqual(check.json.replies[0].text, "[deleted]");
            }
        },
        {
            title: "Deleting a thread with the incorrect password: DELETE request to /api/threads/{board} with an invalid delete_password",
            fn: () => {
                const res = handleBoard("DELETE", "threads", board, {}, {
                    thread_id: threadId,
                    delete_password: "wrong"
                });
                assert.strictEqual(res.text, "incorrect password");
            }
        },
        {
            title: "Deleting a thread with the correct password: DELETE request to /api/threads/{board} with a valid delete_password",
            fn: () => {
                const res = handleBoard("DELETE", "threads", board, {}, {
                    thread_id: threadId,
                    delete_password: "secret"
                });
                assert.strictEqual(res.text, "success");
            }
        }
    ];

    return cases.map((c) => {
        try {
            c.fn();
            return { title: c.title, context: "Functional Tests", state: "passed", assertions: [{ method: "assert", args: [] }] };
        } catch (err) {
            return { title: c.title, context: "Functional Tests", state: "failed", error: err.message, assertions: [] };
        }
    });
}

module.exports = runFunctionalTests;
