const crypto = require("crypto");

const projects = new Map();

function getProjectIssues(project) {
    if (!projects.has(project)) {
        projects.set(project, []);
    }
    return projects.get(project);
}

function handleApi(method, project, query, body) {
    const issues = getProjectIssues(project);

    if (method === "GET") {
        const entries = Object.entries(query || {});
        const filtered = issues.filter((issue) =>
            entries.every(([key, val]) => String(issue[key]) === String(val))
        );
        return { status: 200, json: filtered };
    }

    if (method === "POST") {
        const { issue_title, issue_text, created_by, assigned_to, status_text } = body || {};
        if (!issue_title || !issue_text || !created_by) {
            return { status: 200, json: { error: "required field(s) missing" } };
        }

        const now = new Date().toISOString();
        const issue = {
            _id: crypto.randomBytes(12).toString("hex"),
            issue_title: String(issue_title),
            issue_text: String(issue_text),
            created_on: now,
            updated_on: now,
            created_by: String(created_by),
            assigned_to: assigned_to ? String(assigned_to) : "",
            open: true,
            status_text: status_text ? String(status_text) : ""
        };
        issues.push(issue);
        return { status: 200, json: issue };
    }

    if (method === "PUT") {
        const { _id } = body || {};
        if (!_id) {
            return { status: 200, json: { error: "missing _id" } };
        }

        const updatable = ["issue_title", "issue_text", "created_by", "assigned_to", "status_text", "open"];
        const updates = {};
        for (const field of updatable) {
            if (body[field] !== undefined && body[field] !== "") {
                updates[field] = field === "open"
                    ? (body[field] === false || body[field] === "false" ? false : true)
                    : String(body[field]);
            }
        }

        if (Object.keys(updates).length === 0) {
            return { status: 200, json: { error: "no update field(s) sent", _id } };
        }

        const issue = issues.find((item) => item._id === _id);
        if (!issue) {
            return { status: 200, json: { error: "could not update", _id } };
        }

        Object.assign(issue, updates, { updated_on: new Date().toISOString() });
        return { status: 200, json: { result: "successfully updated", _id } };
    }

    if (method === "DELETE") {
        const { _id } = body || {};
        if (!_id) {
            return { status: 200, json: { error: "missing _id" } };
        }

        const idx = issues.findIndex((item) => item._id === _id);
        if (idx === -1) {
            return { status: 200, json: { error: "could not delete", _id } };
        }

        issues.splice(idx, 1);
        return { status: 200, json: { result: "successfully deleted", _id } };
    }

    return { status: 405, json: { error: "Method not allowed" } };
}

module.exports = handleApi;
