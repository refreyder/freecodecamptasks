const defaultMarkdown = `# Welcome to Markdown Previewer

## Sub-heading Example

Here is a link to [freeCodeCamp](https://www.freecodecamp.org).

Inline code looks like \`<div></div>\`.

\`\`\`javascript
function greet(name) {
    return \`Hello, \${name}!\`;
}
\`\`\`

- First list item
- Second list item
- Third list item

> Blockquote example for highlighting important notes.

![Sample Image](https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Markdown-mark.svg/208px-Markdown-mark.svg.png)

This text is **bold**.`;

marked.setOptions({
    breaks: true,
    gfm: true
});

function MarkdownPreviewer() {
    const [markdown, setMarkdown] = React.useState(defaultMarkdown);

    function handleChange(event) {
        setMarkdown(event.target.value);
    }

    return React.createElement(
        "main",
        { className: "app" },
        React.createElement(
            "section",
            { className: "panel" },
            React.createElement("div", { className: "panel-header" }, "Editor"),
            React.createElement("textarea", {
                id: "editor",
                value: markdown,
                onChange: handleChange
            })
        ),
        React.createElement(
            "section",
            { className: "panel" },
            React.createElement("div", { className: "panel-header" }, "Preview"),
            React.createElement("div", {
                id: "preview",
                dangerouslySetInnerHTML: { __html: marked.parse(markdown) }
            })
        )
    );
}

ReactDOM.render(
    React.createElement(MarkdownPreviewer),
    document.getElementById("root")
);
