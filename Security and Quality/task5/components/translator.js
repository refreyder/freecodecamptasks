const americanOnly = require("./american-only.js");
const americanToBritishSpelling = require("./american-to-british-spelling.js");
const americanToBritishTitles = require("./american-to-british-titles.js");
const britishOnly = require("./british-only.js");

function invertMap(obj) {
    const inverted = {};
    for (const [key, val] of Object.entries(obj)) {
        inverted[val] = key;
    }
    return inverted;
}

const britishToAmericanSpelling = invertMap(americanToBritishSpelling);
const britishToAmericanTitles = invertMap(americanToBritishTitles);

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function matchCase(source, target) {
    if (source[0] && source[0] === source[0].toUpperCase() && source[0] !== source[0].toLowerCase()) {
        return target[0].toUpperCase() + target.slice(1);
    }
    return target;
}

class Translator {
    translate(text, locale) {
        if (locale !== "american-to-british" && locale !== "british-to-american") {
            return null;
        }

        const isAmToBr = locale === "american-to-british";
        const dict = isAmToBr
            ? { ...americanOnly, ...americanToBritishSpelling }
            : { ...britishOnly, ...britishToAmericanSpelling };
        const titles = isAmToBr ? americanToBritishTitles : britishToAmericanTitles;

        let working = text;
        const replacements = [];

        const addReplacement = (replacementText) => {
            const token = `\u0000${replacements.length}\u0000`;
            replacements.push(`<span class="highlight">${replacementText}</span>`);
            return token;
        };

        const titleKeys = Object.keys(titles).sort((a, b) => b.length - a.length);
        for (const key of titleKeys) {
            const regex = new RegExp(`(?<![a-zA-Z0-9])${escapeRegex(key)}(?=\\s|$)`, "gi");
            working = working.replace(regex, (matched) => {
                const translated = matchCase(matched, titles[key]);
                return addReplacement(translated);
            });
        }

        const timeRegex = isAmToBr
            ? /\b(\d{1,2}):(\d{2})\b/g
            : /\b(\d{1,2})\.(\d{2})\b/g;
        const timeSep = isAmToBr ? "." : ":";
        working = working.replace(timeRegex, (_, h, m) => addReplacement(`${h}${timeSep}${m}`));

        const dictKeys = Object.keys(dict).sort((a, b) => b.length - a.length);
        for (const key of dictKeys) {
            const regex = new RegExp(`(?<![a-zA-Z0-9-])${escapeRegex(key)}(?![a-zA-Z0-9-])`, "gi");
            working = working.replace(regex, (matched) => {
                const translated = matchCase(matched, dict[key]);
                return addReplacement(translated);
            });
        }

        if (replacements.length === 0) {
            return "Everything looks good to me!";
        }

        return working.replace(/\u0000(\d+)\u0000/g, (_, idx) => replacements[Number(idx)]);
    }
}

module.exports = Translator;
