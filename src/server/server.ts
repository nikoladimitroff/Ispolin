/// <reference path="../../typings/restify/restify.d.ts" />

import restify = require("restify");

"use strict";
export class Server {
    constructor() {
        this.app = restify.createServer({
            name: "Unnamed"
        });
        this.setupRouting();
    }

    public listen(): void {
        this.app.listen(8080);
    }

    private setupRouting(): void {
        let courses: restify.RequestHandler = (req: restify.Request,
                                               res: restify.Response,
                                               next: restify.Next) => {
            let availableCourses = {
                "test": {
                    link: "course_index.html",
                    description: "Testing testy for testing purposy."
                },
                "nonexistent": {
                    link: "http://example.com",
                    description: "Example madafaka."
                },
                "coherent labs": {
                    link: "http://coherent-labs.com",
                    description: "Coherent labs' Being Awesome 101"
                }
            };
            res.send(200, availableCourses);
        };
        this.app.get("/api/courses/", courses);

        // Static files are added last as they match every request
        this.app.get(".*", restify.serveStatic({
            directory: "distr/client/",
            default: "index.html"
        }));
    }
    private app: restify.Server;
}
