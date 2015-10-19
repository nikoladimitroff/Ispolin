/// <reference path="../../typings/express/express.d.ts" />
/// <reference path="../../typings/restify/restify.d.ts" />
/// <reference path="../../typings/passport/passport.d.ts" />
/// <reference path="../../typings/passport-local/passport-local.d.ts" />
"use strict";
import crypto = require("crypto");
import fs = require("fs");

import express = require("express");
import restify = require("restify");
import bunyan = require("bunyan");
import passport = require("passport");
import { Strategy as LocalStrategy } from "passport-local";

import session = require("express-session");
import bodyParser = require("body-parser");

import { Validator } from "./validator";
import DataAccessLayer from "./data_access_layer";
import { SchemaModels } from "./schemas";

import { Users as UsersRoute } from "./routes/users";
import { Results as ResultsRoute } from "./routes/results";
import { Signup as SignupRoute } from "./routes/signup";
import { Homework as HomeworkRoute } from "./routes/homework";

type ICourseInfo = SchemaModels.ICourseInfo;
type IUser = SchemaModels.IUser;

export default class Server {
    public logger: bunyan.Logger;
    public dal: DataAccessLayer;

    private app: restify.Server;

    constructor() {
        this.app = restify.createServer({ name: "Ispolin" });
        this.logger = bunyan.createLogger({ name: "Ispolin" });
        this.dal = new DataAccessLayer("mongodb://localhost/system-data",
                                       this.logger);
        this.setupPassport();
        this.setupRouting();
    }

    public listen(): void {
        this.logger.info("Server started!");
        this.app.listen(8080);
    }

    private setupPassport(): void {
        let verifier = (email: string, password: string, done: Function) => {
            SchemaModels.User.findOne({ mail: email },
                                      (err, user) => {
                if (err) { return done(err, false); }
                if (!user) { return done(null, false); }
                let isCorrect = Validator.checkPassword(password,
                                                        user.passportHash);
                if (!isCorrect) { return done(null, false); }
                return done(null, user);
            });
        };
        passport.serializeUser(function(user: any, done: any): void {
            done(null, user._id);
        });
        passport.deserializeUser(function(id: any, done: any): void {
            SchemaModels.User.findById(id, function(err, user): void {
                done(err, user);
            });
        });

        this.app.use(bodyParser.json());
        this.app.use(session({
            secret: "keyboard cat",
            resave: true,
            saveUninitialized: false
        }));
        let strategySettings = {
            usernameField: "email",
            passwordField: "password",
            session: true
        };
        passport.use(new LocalStrategy(strategySettings, verifier));
        this.app.use(passport.initialize());
        this.app.use(passport.session());
    }
    private handleLogin(req: restify.Request,
                        res: restify.Response,
                        next: restify.Next): void {
        res.send(200);
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

        // When testing, alternate the below string to GEA or HPC
        const FIXED_COURSE = "HPC";
        let courseInfo: restify.RequestHandler = (req: restify.Request,
                                                  res: restify.Response,
                                                  next: restify.Next) => {
            let queryCourse = SchemaModels.Course
                                          .findOne({ shortName: FIXED_COURSE })
                                          .exec();
            let onSuccess = (result: ICourseInfo) => {
                res.send(200, result);
            };
            queryCourse.then(onSuccess, this.dal.onError);
        };
        this.app.get("/api/course-info/", courseInfo);

        let checkLogin = (req: restify.Request,
                          res: restify.Response,
                          next: restify.Next) => {
            res.send(200, (req as any).user);
        };
        this.app.get("/api/check-login/",
                     passport.authenticate("session"),
                     checkLogin);

        let logout = (req: restify.Request,
                      res: restify.Response,
                      next: restify.Next) => {
            // The following methods are added by passport
            /* tslint:disable */
            req.session.destroy();
            req.logout();
            /* tslint:enable */
            res.send(200);
        };
        this.app.get("/api/logout/",
                     logout);

        let users = new UsersRoute();
        this.app.get("/api/users/:course", users.handleRequest.bind(users));

        let results = new ResultsRoute();
        this.app.post("/api/results/:course",
                      passport.authenticate("session"),
                      results.handleRequest.bind(results));

        let homework = new HomeworkRoute();
        this.app.post("/api/homework/:course",
                      passport.authenticate("session"),
                      homework.handleRequest.bind(homework));

        // Express won't work with paths without :_ for some reason for POST
        let signup = new SignupRoute();
        this.app.post("/api/signup/:_",
                      signup.handleRequest.bind(signup));
        this.app.post("/api/login/:_",
                      passport.authenticate("local"),
                      this.handleLogin);

        let lectures: restify.RequestHandler = (req: restify.Request,
                                                res: restify.Response,
                                                next: restify.Next) => {
            const dirPath = `distr/client/lectures/${FIXED_COURSE}/`;
            res.send(200, fs.readdirSync(dirPath));
        };
        this.app.get("/api/lectures/", lectures);

        // Static files are added last as they match every request
        this.app.get(".*", restify.serveStatic({
            directory: "distr/client/",
            default: "index.html"
        }));
    }
}
