/// <reference path="../../common/models.ts" />

"use strict";
import restify = require("restify");
import { IRoute } from "./route";
import { CourseParser } from "./course_parser";

export class AllCourses implements IRoute {
    public handleRequest(req: restify.Request,
                         res: restify.Response,
                         next: restify.Next): void {
        res.send(200, CourseParser.instance.getAllCourses());
    }
}
