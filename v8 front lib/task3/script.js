const drumPads = [
    {
        key: "Q",
        id: "Heater-1",
        label: "Heater 1",
        src: "https://cdn.freecodecamp.org/testable-projects-fcc/audio/Heater-1.mp3"
    },
    {
        key: "W",
        id: "Heater-2",
        label: "Heater 2",
        src: "https://cdn.freecodecamp.org/testable-projects-fcc/audio/Heater-2.mp3"
    },
    {
        key: "E",
        id: "Heater-3",
        label: "Heater 3",
        src: "https://cdn.freecodecamp.org/testable-projects-fcc/audio/Heater-3.mp3"
    },
    {
        key: "A",
        id: "Heater-4",
        label: "Heater 4",
        src: "https://cdn.freecodecamp.org/testable-projects-fcc/audio/Heater-4_1.mp3"
    },
    {
        key: "S",
        id: "Clap",
        label: "Clap",
        src: "https://cdn.freecodecamp.org/testable-projects-fcc/audio/Heater-6.mp3"
    },
    {
        key: "D",
        id: "Open-HH",
        label: "Open-HH",
        src: "https://cdn.freecodecamp.org/testable-projects-fcc/audio/Dsc_Oh.mp3"
    },
    {
        key: "Z",
        id: "Kick-n-Hat",
        label: "Kick-n'-Hat",
        src: "https://cdn.freecodecamp.org/testable-projects-fcc/audio/Kick_n_Hat.mp3"
    },
    {
        key: "X",
        id: "Kick",
        label: "Kick",
        src: "https://cdn.freecodecamp.org/testable-projects-fcc/audio/RP4_KICK_1.mp3"
    },
    {
        key: "C",
        id: "Closed-HH",
        label: "Closed-HH",
        src: "https://cdn.freecodecamp.org/testable-projects-fcc/audio/Cev_H2.mp3"
    }
];

function DrumMachine() {
    const [displayText, setDisplayText] = React.useState("Ready");
    const [activeKey, setActiveKey] = React.useState(null);

    const playSound = React.useCallback((pad) => {
        const audio = document.getElementById(pad.key);
        if (audio) {
            audio.currentTime = 0;
            const playPromise = audio.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(() => {});
            }
        }
        setDisplayText(pad.label);
        setActiveKey(pad.key);
        setTimeout(() => {
            setActiveKey((prev) => (prev === pad.key ? null : prev));
        }, 120);
    }, []);

    React.useEffect(() => {
        function handleKeyDown(event) {
            const key = event.key.toUpperCase();
            const pad = drumPads.find((item) => item.key === key);
            if (pad) {
                playSound(pad);
            }
        }

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [playSound]);

    return React.createElement(
        "main",
        { id: "drum-machine" },
        React.createElement(
            "div",
            { className: "machine-header" },
            React.createElement("span", { className: "brand" }, "Drum Machine"),
            React.createElement("div", { id: "display" }, displayText)
        ),
        React.createElement(
            "div",
            { className: "pad-grid" },
            drumPads.map((pad) =>
                React.createElement(
                    "button",
                    {
                        key: pad.key,
                        type: "button",
                        id: pad.id,
                        className: activeKey === pad.key ? "drum-pad active" : "drum-pad",
                        onClick: () => playSound(pad)
                    },
                    pad.key,
                    React.createElement("audio", {
                        className: "clip",
                        id: pad.key,
                        src: pad.src
                    })
                )
            )
        )
    );
}

ReactDOM.render(
    React.createElement(DrumMachine),
    document.getElementById("root")
);
