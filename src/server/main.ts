import Server from "./server";

"use strict";
function main(): void {
    let server: Server = new Server();
    server.listen();
}
main();
