const assert = require("assert");
const createLibraryHandler = require("../routes/api");

function runFunctionalTests() {
    const handleLibrary = createLibraryHandler();
    let createdId;

    const cases = [
        {
            title: "Test POST /api/books with title",
            fn: () => {
                const res = handleLibrary("POST", null, { title: "Clean Code" });
                assert.strictEqual(res.json.title, "Clean Code");
                assert.ok(res.json._id);
                createdId = res.json._id;
            }
        },
        {
            title: "Test POST /api/books with no title given",
            fn: () => {
                const res = handleLibrary("POST", null, {});
                assert.strictEqual(res.text, "missing required field title");
            }
        },
        {
            title: "Test GET /api/books",
            fn: () => {
                const res = handleLibrary("GET", null, {});
                assert.ok(Array.isArray(res.json));
                assert.strictEqual(res.json.length, 1);
                assert.strictEqual(res.json[0].commentcount, 0);
            }
        },
        {
            title: "Test GET /api/books/[id] with id not in db",
            fn: () => {
                const res = handleLibrary("GET", "nonexistent_id", {});
                assert.strictEqual(res.text, "no book exists");
            }
        },
        {
            title: "Test GET /api/books/[id] with valid id in db",
            fn: () => {
                const res = handleLibrary("GET", createdId, {});
                assert.strictEqual(res.json._id, createdId);
                assert.strictEqual(res.json.title, "Clean Code");
                assert.ok(Array.isArray(res.json.comments));
            }
        },
        {
            title: "Test POST /api/books/[id] with comment",
            fn: () => {
                const res = handleLibrary("POST", createdId, { comment: "Great book" });
                assert.strictEqual(res.json._id, createdId);
                assert.deepStrictEqual(res.json.comments, ["Great book"]);
            }
        },
        {
            title: "Test POST /api/books/[id] without comment field",
            fn: () => {
                const res = handleLibrary("POST", createdId, {});
                assert.strictEqual(res.text, "missing required field comment");
            }
        },
        {
            title: "Test POST /api/books/[id] with comment, id not in db",
            fn: () => {
                const res = handleLibrary("POST", "nonexistent_id", { comment: "Test" });
                assert.strictEqual(res.text, "no book exists");
            }
        },
        {
            title: "Test DELETE /api/books/[id] with valid id in db",
            fn: () => {
                const res = handleLibrary("DELETE", createdId, {});
                assert.strictEqual(res.text, "delete successful");
            }
        },
        {
            title: "Test DELETE /api/books/[id] with id not in db",
            fn: () => {
                const res = handleLibrary("DELETE", "nonexistent_id", {});
                assert.strictEqual(res.text, "no book exists");
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
