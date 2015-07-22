"use strict";
import fs = require("fs");

import restify = require("restify");
import bunyan = require("bunyan");

import DataAccessLayer from "./data_access_layer";
import { SchemaModels } from "./schemas";

import { Routes } from "./routes/users";

type ICourseInfo = SchemaModels.ICourseInfo;
type IUser = SchemaModels.IUser;


export default class Server {
    public logger: bunyan.Logger;
    public dal: DataAccessLayer;

    private app: restify.Server;

    constructor() {
        this.app = restify.createServer({ name: "Unnamed" });
        this.logger = bunyan.createLogger({ name: "Unnamed" });
        this.dal = new DataAccessLayer("mongodb://localhost/system-data",
                                       this.logger);
        this.setupRouting();
    }

    public listen(): void {
        this.logger.info("Server started!");
        this.app.listen(8080);
    }

    private setupRouting(): void {
        let courses: restify.RequestHandler = (req: restify.Request,
                                               res: restify.Response,
                                               next: restify.Next) => {
            let availableCourses = SchemaModels.Course.find({}).exec();
            let onSuccess = (result: ICourseInfo[]) => res.send(200, result);
            availableCourses.then(onSuccess, this.dal.onError);
        };
        this.app.get("/api/courses/", courses);

        let users = new Routes.Users();
        this.app.get("/api/users/", users.handleRequest.bind(users));

        let lectures: restify.RequestHandler = (req: restify.Request,
                                                res: restify.Response,
                                                next: restify.Next) => {
            res.send(200, fs.readdirSync("distr/client/lectures"));
        };
        this.app.get("/api/lectures/", lectures);

        // Static files are added last as they match every request
        this.app.get(".*", restify.serveStatic({
            directory: "distr/client/",
            default: "index.html"
        }));
    }
}
