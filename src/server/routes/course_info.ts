/// <reference path="../../common/models.ts" />

"use strict";
import restify = require("restify");
import { IRoute } from "./route";
import { CourseParser } from "./course_parser";

type IHomework = Models.IHomework;
type IDetailedInfo = Models.IDetailedCourseInfo;

export class CourseInfo implements IRoute {
    public handleRequest(req: restify.Request,
                         res: restify.Response,
                         next: restify.Next): void {
        let parser = CourseParser.instance;
        let info = parser.getDetailedInfo(req.params.shortCourseName);
        if (info) {
            res.send(200, info);
        } else {
            res.send(404);
        }
    }


}
