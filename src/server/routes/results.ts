/// <reference path="../../common/models.ts" />

"use strict";
import restify = require("restify");
import Q = require("q");
import { IRoute } from "./route";
import DataAccessLayer from "../data_access_layer";
import { SchemaModels } from "../schemas";

type IUser = SchemaModels.IUser;
type ICourseInfo = SchemaModels.ICourseInfo;
type IGrade = Models.IGrade;

export class Results implements IRoute {

    public handleRequest(req: restify.Request,
                         res: restify.Response,
                         next: restify.Next): void {
        let sendResults = (queryData: Models.ICourseData): void => {
            res.send(200, queryData.results);
        };
        let user: IUser = (req as any).user;
        console.log("Standings: ", req.params.courseId);
        this.getResults(user, req.params.courseId).done(sendResults);
    }

    private getResults(user: IUser, courseId: string): any {
        let query = {
            course: courseId,
            user: user._id
        };
        let queryGrades = Q(SchemaModels.CourseData
                                        .findOne(query)
                                        .select("results")
                                        .exec());
        return queryGrades;
    }
}
