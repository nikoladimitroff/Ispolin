import Server = require("./server");

"use strict";
function main(): void {
    let server: Server.Server = new Server.Server();
    server.listen();
}
main();
