function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const mm = minutes < 10 ? "0" + minutes : String(minutes);
    const ss = seconds < 10 ? "0" + seconds : String(seconds);
    return `${mm}:${ss}`;
}

function Clock() {
    const [breakLength, setBreakLength] = React.useState(5);
    const [sessionLength, setSessionLength] = React.useState(25);
    const [mode, setMode] = React.useState("Session");
    const [timeLeft, setTimeLeft] = React.useState(25 * 60);
    const [isRunning, setIsRunning] = React.useState(false);

    const beepRef = React.useRef(null);

    React.useEffect(() => {
        if (!isRunning) {
            return;
        }

        const intervalId = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev === 0) {
                    if (mode === "Session") {
                        setMode("Break");
                        return breakLength * 60;
                    }
                    setMode("Session");
                    return sessionLength * 60;
                }
                const next = prev - 1;
                if (next === 0 && beepRef.current) {
                    beepRef.current.currentTime = 0;
                    const playPromise = beepRef.current.play();
                    if (playPromise && typeof playPromise.catch === "function") {
                        playPromise.catch(() => {});
                    }
                }
                return next;
            });
        }, 1000);

        return () => clearInterval(intervalId);
    }, [isRunning, mode, breakLength, sessionLength]);

    function handleBreakChange(delta) {
        if (isRunning) {
            return;
        }
        const next = breakLength + delta;
        if (next < 1 || next > 60) {
            return;
        }
        setBreakLength(next);
        if (mode === "Break") {
            setTimeLeft(next * 60);
        }
    }

    function handleSessionChange(delta) {
        if (isRunning) {
            return;
        }
        const next = sessionLength + delta;
        if (next < 1 || next > 60) {
            return;
        }
        setSessionLength(next);
        if (mode === "Session") {
            setTimeLeft(next * 60);
        }
    }

    function handleStartStop() {
        setIsRunning((prev) => !prev);
    }

    function handleReset() {
        setIsRunning(false);
        setBreakLength(5);
        setSessionLength(25);
        setMode("Session");
        setTimeLeft(25 * 60);
        if (beepRef.current) {
            beepRef.current.pause();
            beepRef.current.currentTime = 0;
        }
    }

    return React.createElement(
        "main",
        { className: "clock" },
        React.createElement("h1", { className: "clock-title" }, "25 + 5 Clock"),
        React.createElement(
            "div",
            { className: "lengths-grid" },
            React.createElement(
                "div",
                { className: "length-box" },
                React.createElement("div", { id: "break-label", className: "length-label" }, "Break Length"),
                React.createElement(
                    "div",
                    { className: "length-controls" },
                    React.createElement("button", { id: "break-decrement", type: "button", onClick: () => handleBreakChange(-1) }, "-"),
                    React.createElement("span", { id: "break-length", className: "length-value" }, breakLength),
                    React.createElement("button", { id: "break-increment", type: "button", onClick: () => handleBreakChange(1) }, "+")
                )
            ),
            React.createElement(
                "div",
                { className: "length-box" },
                React.createElement("div", { id: "session-label", className: "length-label" }, "Session Length"),
                React.createElement(
                    "div",
                    { className: "length-controls" },
                    React.createElement("button", { id: "session-decrement", type: "button", onClick: () => handleSessionChange(-1) }, "-"),
                    React.createElement("span", { id: "session-length", className: "length-value" }, sessionLength),
                    React.createElement("button", { id: "session-increment", type: "button", onClick: () => handleSessionChange(1) }, "+")
                )
            )
        ),
        React.createElement(
            "div",
            { className: timeLeft < 60 ? "timer-box warning" : "timer-box" },
            React.createElement("div", { id: "timer-label" }, mode),
            React.createElement("div", { id: "time-left" }, formatTime(timeLeft))
        ),
        React.createElement(
            "div",
            { className: "timer-controls" },
            React.createElement("button", { id: "start_stop", type: "button", onClick: handleStartStop }, isRunning ? "Pause" : "Start"),
            React.createElement("button", { id: "reset", type: "button", onClick: handleReset }, "Reset")
        ),
        React.createElement("audio", {
            id: "beep",
            ref: beepRef,
            preload: "auto",
            src: "https://cdn.freecodecamp.org/testable-projects-fcc/audio/BeepSound.wav"
        })
    );
}

ReactDOM.render(
    React.createElement(Clock),
    document.getElementById("root")
);
