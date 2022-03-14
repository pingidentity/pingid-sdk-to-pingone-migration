"use strict";

const fs = require("fs"), 
	  path = require("path"),
	  readline = require("readline"),
      run = require("./migrateLogic"),
	  filename = path.basename(__filename);

const fileToRead = process.argv[2];

if (!fileToRead) {
    console.log(`Usage: node ${filename} pingidsdk.properties`);
    process.exit(1);
}

console.log(`reading ${fileToRead}`);
const propsFile =  fs.readFileSync(fileToRead, "utf-8");

const props = {};

const rl = readline.createInterface({
    input: fs.createReadStream(fileToRead),
    output: process.stdout,
    terminal: false
});


rl.on("line", line => {
    if (line.startsWith("#")) {
    	return;
    }

	const [field, value] = line.split("=");
    props[field] = value;
});

rl.on("close", () => run(props));





