const quotes = [
    {
        text: "Simplicity is prerequisite for reliability.",
        author: "Edsger W. Dijkstra"
    },
    {
        text: "Programs must be written for people to read, and only incidentally for machines to execute.",
        author: "Harold Abelson"
    },
    {
        text: "First, solve the problem. Then, write the code.",
        author: "John Johnson"
    },
    {
        text: "Code is like humor. When you have to explain it, it's bad.",
        author: "Cory House"
    },
    {
        text: "Make it work, make it right, make it fast.",
        author: "Kent Beck"
    },
    {
        text: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.",
        author: "Martin Fowler"
    },
    {
        text: "Talk is cheap. Show me the code.",
        author: "Linus Torvalds"
    },
    {
        text: "The best way to predict the future is to invent it.",
        author: "Alan Kay"
    }
];

const colors = [
    "#0f172a",
    "#1e3a8a",
    "#065f46",
    "#7c2d12",
    "#581c87",
    "#831843",
    "#134e4a"
];

function getRandomIndex(length, excludeIndex) {
    let index = Math.floor(Math.random() * length);
    while (length > 1 && index === excludeIndex) {
        index = Math.floor(Math.random() * length);
    }
    return index;
}

function QuoteMachine() {
    const [quoteIndex, setQuoteIndex] = React.useState(() =>
        getRandomIndex(quotes.length, -1)
    );
    const [colorIndex, setColorIndex] = React.useState(() =>
        getRandomIndex(colors.length, -1)
    );

    const quote = quotes[quoteIndex];
    const color = colors[colorIndex];
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        `"${quote.text}" ${quote.author}`
    )}`;

    React.useEffect(() => {
        document.body.style.backgroundColor = color;
    }, [color]);

    function handleNewQuote() {
        setQuoteIndex((prev) => getRandomIndex(quotes.length, prev));
        setColorIndex((prev) => getRandomIndex(colors.length, prev));
    }

    return React.createElement(
        "main",
        { id: "quote-box" },
        React.createElement(
            "blockquote",
            { className: "quote-content" },
            React.createElement("p", { id: "text" }, `"${quote.text}"`),
            React.createElement("footer", { id: "author" }, `- ${quote.author}`)
        ),
        React.createElement(
            "div",
            { className: "actions" },
            React.createElement(
                "a",
                {
                    id: "tweet-quote",
                    href: tweetUrl,
                    target: "_blank",
                    rel: "noopener noreferrer",
                    style: { backgroundColor: color }
                },
                "Tweet Quote"
            ),
            React.createElement(
                "button",
                {
                    id: "new-quote",
                    type: "button",
                    onClick: handleNewQuote,
                    style: { backgroundColor: color }
                },
                "New Quote"
            )
        )
    );
}

ReactDOM.render(
    React.createElement(QuoteMachine),
    document.getElementById("root")
);
