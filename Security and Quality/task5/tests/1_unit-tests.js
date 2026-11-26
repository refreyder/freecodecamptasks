const assert = require("assert");
const Translator = require("../components/translator");

function stripTags(str) {
    return str.replace(/<[^>]+>/g, "");
}

function runUnitTests() {
    const translator = new Translator();

    const cases = [
        {
            title: "Translate Mangoes are my favorite fruit. to British English",
            fn: () => assert.strictEqual(
                stripTags(translator.translate("Mangoes are my favorite fruit.", "american-to-british")),
                "Mangoes are my favourite fruit."
            )
        },
        {
            title: "Translate I ate yogurt for breakfast. to British English",
            fn: () => assert.strictEqual(
                stripTags(translator.translate("I ate yogurt for breakfast.", "american-to-british")),
                "I ate yoghurt for breakfast."
            )
        },
        {
            title: "Translate We had a party at my friend's condo. to British English",
            fn: () => assert.strictEqual(
                stripTags(translator.translate("We had a party at my friend's condo.", "american-to-british")),
                "We had a party at my friend's flat."
            )
        },
        {
            title: "Translate Can you toss this in the trashcan for me? to British English",
            fn: () => assert.strictEqual(
                stripTags(translator.translate("Can you toss this in the trashcan for me?", "american-to-british")),
                "Can you toss this in the bin for me?"
            )
        },
        {
            title: "Translate The parking lot was full. to British English",
            fn: () => assert.strictEqual(
                stripTags(translator.translate("The parking lot was full.", "american-to-british")),
                "The car park was full."
            )
        },
        {
            title: "Translate Like a high tech Rube Goldberg machine. to British English",
            fn: () => assert.strictEqual(
                stripTags(translator.translate("Like a high tech Rube Goldberg machine.", "american-to-british")),
                "Like a high tech Heath Robinson device."
            )
        },
        {
            title: "Translate To play hooky means to skip class or work. to British English",
            fn: () => assert.strictEqual(
                stripTags(translator.translate("To play hooky means to skip class or work.", "american-to-british")),
                "To bunk off means to skip class or work."
            )
        },
        {
            title: "Translate No Mr. Bond, I expect you to die. to British English",
            fn: () => assert.strictEqual(
                stripTags(translator.translate("No Mr. Bond, I expect you to die.", "american-to-british")),
                "No Mr Bond, I expect you to die."
            )
        },
        {
            title: "Translate Dr. Grosh will see you now. to British English",
            fn: () => assert.strictEqual(
                stripTags(translator.translate("Dr. Grosh will see you now.", "american-to-british")),
                "Dr Grosh will see you now."
            )
        },
        {
            title: "Translate Lunch is at 12:15 today. to British English",
            fn: () => assert.strictEqual(
                stripTags(translator.translate("Lunch is at 12:15 today.", "american-to-british")),
                "Lunch is at 12.15 today."
            )
        },
        {
            title: "Translate We watched the footie match for a while. to American English",
            fn: () => assert.strictEqual(
                stripTags(translator.translate("We watched the footie match for a while.", "british-to-american")),
                "We watched the soccer match for a while."
            )
        },
        {
            title: "Translate Paracetamol takes up to an hour to work. to American English",
            fn: () => assert.strictEqual(
                stripTags(translator.translate("Paracetamol takes up to an hour to work.", "british-to-american")),
                "Tylenol takes up to an hour to work."
            )
        },
        {
            title: "Translate First, caramelise the onions. to American English",
            fn: () => assert.strictEqual(
                stripTags(translator.translate("First, caramelise the onions.", "british-to-american")),
                "First, caramelize the onions."
            )
        },
        {
            title: "Translate I spent the bank holiday at the funfair. to American English",
            fn: () => assert.strictEqual(
                stripTags(translator.translate("I spent the bank holiday at the funfair.", "british-to-american")),
                "I spent the public holiday at the carnival."
            )
        },
        {
            title: "Translate I had a bicky then went to the chippy. to American English",
            fn: () => assert.strictEqual(
                stripTags(translator.translate("I had a bicky then went to the chippy.", "british-to-american")),
                "I had a cookie then went to the fish-and-chip shop."
            )
        },
        {
            title: "Translate I've just got bits and bobs in my bum bag. to American English",
            fn: () => assert.strictEqual(
                stripTags(translator.translate("I've just got bits and bobs in my bum bag.", "british-to-american")),
                "I've just got odds and ends in my fanny pack."
            )
        },
        {
            title: "Translate The car boot sale at Boxted Airfield was called off. to American English",
            fn: () => assert.strictEqual(
                stripTags(translator.translate("The car boot sale at Boxted Airfield was called off.", "british-to-american")),
                "The swap meet at Boxted Airfield was called off."
            )
        },
        {
            title: "Translate Have you met Mrs Kalyani? to American English",
            fn: () => assert.strictEqual(
                stripTags(translator.translate("Have you met Mrs Kalyani?", "british-to-american")),
                "Have you met Mrs. Kalyani?"
            )
        },
        {
            title: "Translate Prof Joyner of King's College, London. to American English",
            fn: () => assert.strictEqual(
                stripTags(translator.translate("Prof Joyner of King's College, London.", "british-to-american")),
                "Prof. Joyner of King's College, London."
            )
        },
        {
            title: "Translate Tea time is usually around 4 or 4.30. to American English",
            fn: () => assert.strictEqual(
                stripTags(translator.translate("Tea time is usually around 4 or 4.30.", "british-to-american")),
                "Tea time is usually around 4 or 4:30."
            )
        },
        {
            title: "Highlight translation in Mangoes are my favorite fruit.",
            fn: () => assert.ok(
                translator.translate("Mangoes are my favorite fruit.", "american-to-british").includes('<span class="highlight">favourite</span>')
            )
        },
        {
            title: "Highlight translation in I ate yogurt for breakfast.",
            fn: () => assert.ok(
                translator.translate("I ate yogurt for breakfast.", "american-to-british").includes('<span class="highlight">yoghurt</span>')
            )
        },
        {
            title: "Highlight translation in We watched the footie match for a while.",
            fn: () => assert.ok(
                translator.translate("We watched the footie match for a while.", "british-to-american").includes('<span class="highlight">soccer</span>')
            )
        },
        {
            title: "Highlight translation in Paracetamol takes up to an hour to work.",
            fn: () => assert.ok(
                translator.translate("Paracetamol takes up to an hour to work.", "british-to-american").includes('<span class="highlight">Tylenol</span>')
            )
        }
    ];

    return cases.map((c) => {
        try {
            c.fn();
            return { title: c.title, context: "Unit Tests", state: "passed", assertions: [{ method: "assert", args: [] }] };
        } catch (err) {
            return { title: c.title, context: "Unit Tests", state: "failed", error: err.message, assertions: [] };
        }
    });
}

module.exports = runUnitTests;
