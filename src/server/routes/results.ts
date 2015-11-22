/// <reference path="../../common/models.ts" />

"use strict";
import restify = require("restify");
import Q = require("q");
import { IRoute } from "./route";
import { SchemaModels } from "../schemas";

type IUser = SchemaModels.IUser;
type IGrade = Models.IGrade;

export class Results implements IRoute {

    public handleRequest(req: restify.Request,
                         res: restify.Response,
                         next: restify.Next): void {
        let sendResults = (queryData: Models.ICourseData): void => {
            if (!queryData) {
                res.send(200, []);
            } else {
                res.send(200, queryData.results);
            }
        };
        let user: IUser = (req as any).user;
        console.log("Standings: ", req.params.shortCourseName);
        this.getResults(user, req.params.shortCourseName).done(sendResults);
    }

    private getResults(user: IUser, courseName: string): any {
        let query = {
            course: courseName,
            user: user._id
        };
        let queryGrades = Q(SchemaModels.CourseData
                                        .findOne(query)
                                        .select("results")
                                        .exec());
        return queryGrades;
    }
}
