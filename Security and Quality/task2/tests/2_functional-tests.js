const assert = require("assert");
const handleApi = require("../routes/api");

function runFunctionalTests() {
    const project = "fcc_test_suite";
    let createdId1;
    let createdId2;

    const cases = [
        {
            title: "Create an issue with every field: POST request to /api/issues/{project}",
            fn: () => {
                const res = handleApi("POST", project, {}, {
                    issue_title: "Full Issue",
                    issue_text: "Text",
                    created_by: "Tester",
                    assigned_to: "Dev",
                    status_text: "In QA"
                });
                assert.strictEqual(res.json.issue_title, "Full Issue");
                assert.strictEqual(res.json.assigned_to, "Dev");
                assert.strictEqual(res.json.status_text, "In QA");
                assert.strictEqual(res.json.open, true);
                assert.ok(res.json._id);
                createdId1 = res.json._id;
            }
        },
        {
            title: "Create an issue with only required fields: POST request to /api/issues/{project}",
            fn: () => {
                const res = handleApi("POST", project, {}, {
                    issue_title: "Required Only",
                    issue_text: "Text",
                    created_by: "Tester"
                });
                assert.strictEqual(res.json.assigned_to, "");
                assert.strictEqual(res.json.status_text, "");
                assert.ok(res.json._id);
                createdId2 = res.json._id;
            }
        },
        {
            title: "Create an issue with missing required fields: POST request to /api/issues/{project}",
            fn: () => {
                const res = handleApi("POST", project, {}, { issue_title: "Incomplete" });
                assert.deepStrictEqual(res.json, { error: "required field(s) missing" });
            }
        },
        {
            title: "View issues on a project: GET request to /api/issues/{project}",
            fn: () => {
                const res = handleApi("GET", project, {}, {});
                assert.ok(Array.isArray(res.json));
                assert.ok(res.json.length >= 2);
            }
        },
        {
            title: "View issues on a project with one filter: GET request to /api/issues/{project}",
            fn: () => {
                const res = handleApi("GET", project, { assigned_to: "Dev" }, {});
                assert.strictEqual(res.json.length, 1);
                assert.strictEqual(res.json[0]._id, createdId1);
            }
        },
        {
            title: "View issues on a project with multiple filters: GET request to /api/issues/{project}",
            fn: () => {
                const res = handleApi("GET", project, { created_by: "Tester", open: "true" }, {});
                assert.ok(res.json.length >= 2);
            }
        },
        {
            title: "Update one field on an issue: PUT request to /api/issues/{project}",
            fn: () => {
                const res = handleApi("PUT", project, {}, { _id: createdId1, issue_text: "Updated" });
                assert.deepStrictEqual(res.json, { result: "successfully updated", _id: createdId1 });
            }
        },
        {
            title: "Update multiple fields on an issue: PUT request to /api/issues/{project}",
            fn: () => {
                const res = handleApi("PUT", project, {}, {
                    _id: createdId1,
                    issue_title: "Updated Title",
                    open: false
                });
                assert.deepStrictEqual(res.json, { result: "successfully updated", _id: createdId1 });
            }
        },
        {
            title: "Update an issue with missing _id: PUT request to /api/issues/{project}",
            fn: () => {
                const res = handleApi("PUT", project, {}, { issue_title: "No ID" });
                assert.deepStrictEqual(res.json, { error: "missing _id" });
            }
        },
        {
            title: "Update an issue with no fields to update: PUT request to /api/issues/{project}",
            fn: () => {
                const res = handleApi("PUT", project, {}, { _id: createdId1 });
                assert.deepStrictEqual(res.json, { error: "no update field(s) sent", _id: createdId1 });
            }
        },
        {
            title: "Update an issue with an invalid _id: PUT request to /api/issues/{project}",
            fn: () => {
                const res = handleApi("PUT", project, {}, { _id: "invalid_id_123", issue_title: "X" });
                assert.deepStrictEqual(res.json, { error: "could not update", _id: "invalid_id_123" });
            }
        },
        {
            title: "Delete an issue: DELETE request to /api/issues/{project}",
            fn: () => {
                const res1 = handleApi("DELETE", project, {}, { _id: createdId1 });
                const res2 = handleApi("DELETE", project, {}, { _id: createdId2 });
                assert.deepStrictEqual(res1.json, { result: "successfully deleted", _id: createdId1 });
                assert.deepStrictEqual(res2.json, { result: "successfully deleted", _id: createdId2 });
            }
        },
        {
            title: "Delete an issue with an invalid _id: DELETE request to /api/issues/{project}",
            fn: () => {
                const res = handleApi("DELETE", project, {}, { _id: "invalid_id_123" });
                assert.deepStrictEqual(res.json, { error: "could not delete", _id: "invalid_id_123" });
            }
        },
        {
            title: "Delete an issue with missing _id: DELETE request to /api/issues/{project}",
            fn: () => {
                const res = handleApi("DELETE", project, {}, {});
                assert.deepStrictEqual(res.json, { error: "missing _id" });
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
