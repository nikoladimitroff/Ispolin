var TAGS = ["Feature", "Enhancement", "Content", "Tools", "API", "Refactor", "Fix", "Docs"];
var ERROR_MESSAGE = [
                    "",
                    "COMMIT FAILED:" ,
                    "Your commit message does not adhere to our naming convention.",
                    "Use either '[Tag] Message' or '* Message'.",
                    "Supported tags: " + TAGS.join(" ")
                ].join("\r\n");

function fail() {
    console.error(ERROR_MESSAGE);
    process.exit(1);
};

// arg[0] == node, arg[1] == path/to/script
var message = process.argv[2];

// Check for wildstar
var usesWildstar = message.substr(0, 2) === "* ";

// Check for [Tag]
var leftBracket = message.indexOf("[");
var rightBracket = message.indexOf("]");
var usesTag = false;
if (leftBracket >= 0  && rightBracket >= 0) {
    var tag = message.substring(leftBracket + 1, rightBracket);
    usesTag = TAGS.indexOf(tag) >= 0;
    if (usesTag) {
        // Make sure that the message is descriptive enough
        var DESCRIPTIVE_ENOUGH = 10;
        usesTag = (message.length - rightBracket) >= DESCRIPTIVE_ENOUGH;
    }
}

if (!usesTag && !usesWildstar) {
    fail();
}